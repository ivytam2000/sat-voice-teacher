from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from gtts import gTTS
import csv
import re
import boto3
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
app.debug = True


BUCKET = "saturn-tts"

s3 = boto3.client('s3', region_name='us-east-1')
endpointUrl = s3.meta.endpoint_url
s3 = boto3.client('s3', endpoint_url=endpointUrl, region_name='us-east-1')

s3_resource = boto3.resource('s3')
bucket = s3_resource.Bucket(name=BUCKET)
key = ''

# File Processing Configuration
ALLOWED_EXTENSIONS = set(['txt'])

model_path = './fine-tuned-sentence-transformers'
model = SentenceTransformer.load(model_path)

data = {}
qa_pairs = {}

def set_up_answers():
    with open('dataset/SATCorpus.csv', 'r', encoding='latin-1') as file:
        reader = csv.reader(file)
        # skip the header
        next(reader)
        for row in reader:
            qna_id = int(row[5])
            question = row[0]
            long_answer = row[1]
            short_answer = row[2]
            context_needed = False if row[6] =='FALSE' else True
            in_course = False if row[7] =='FALSE' else True
            prompts_list = []

            prompts = row[4].strip('][')
            prompts = prompts.split('}')
            prompts.pop()
            for prompt in prompts:
                prompt = prompt.strip(',{')
                prompt = prompt.replace('"','')
                prompt = re.split(':|,', prompt)
                prompts_list.append({'DisplayOrder': int(prompt[1]), 'QnaId': int(prompt[3]), 'DisplayText': prompt[5]})

            data[qna_id] = {'Question':question, 'LongAnswer':long_answer, 'ShortAnswer':short_answer, 'Prompts': prompts_list, 'ContextNeeded': context_needed, 'InCourse': in_course}
            if not context_needed:
                qa_pairs[question] = qna_id

# returns long-answer if short-answer is specified but not available
def get_answer_type(qna_id, answer_type):
    if answer_type == 'short-answer':
        value = data[qna_id]
        if value['ShortAnswer'] != '':
            return 'ShortAnswer'
    return 'LongAnswer'

def get_preasigned_s3_url(prefix):
    key = ''
    for obj in bucket.objects.filter(Prefix=prefix):
        key = obj.key

    url = s3.generate_presigned_url('get_object',
                                         Params={'Bucket': BUCKET,
                                                 'Key': key},
                                         ExpiresIn=3600)
    return url


def preprocess_question(question):
    filler_word_pattern= r'\b(uh|um|like)\b'
    text = re.sub(filler_word_pattern, '', question, flags=re.IGNORECASE)
    return text

# If qna_id is specified this means the qna has a prompt
def generate_response(question, qna_id = None, answer_type = 'long-answer'):
    question = preprocess_question(question)
    if qna_id == None:
        possible_sentences = list(qa_pairs.keys())
    else:
        value = data[qna_id]
        prompts = value['Prompts']
        qa_pairs_augmented = qa_pairs
        for idx, prompt in enumerate(prompts):
            if idx == 0:
                qa_pairs_augmented['Next'] = prompt['QnaId']
            qa_pairs_augmented[prompt['DisplayText']] = prompt['QnaId']

        possible_sentences = list(qa_pairs_augmented.keys())

    query_embedding = model.encode(question)
    passage_embedding = model.encode(possible_sentences)

    sim_scores = util.dot_score(query_embedding, passage_embedding).numpy()[0]

    sentence_pos = []
    for i in range(len(sim_scores)):
        sentence_pos.append({'index': i, 'score': sim_scores[i]})

    sentence_pos = sorted(sentence_pos, key=lambda x: x['score'], reverse=True)

    # FOR DEBUGGING PURPOSES:
    # print("possible sentences", possible_sentences)
    # print("The top 3 most similar sentences are:  \n")
    # for sentence in sentence_pos[:3]:
    #     i = sentence['index']
    #     score = sentence['score']
    #     print("{} Score: {:.4f}".format(possible_sentences[i],score))

    most_sim_pos = sentence_pos[0]['index']
    next_qna_id = qa_pairs[possible_sentences[most_sim_pos]]

    # If query does not match any question we return the default answer
    if sentence_pos[0]['score'] < 0.4:
        next_qna_id = qa_pairs['default']

    value = data[next_qna_id]
    prompts = value['Prompts']
    answer_type_key = get_answer_type(next_qna_id, answer_type)
    answer = value[answer_type_key].replace(r'\n', '\n')
    answer = answer.replace(r'*', '')
    answer = answer.replace('typing', 'saying')

    return answer, prompts, next_qna_id

def generate_prompt_response(prompts, in_course):
    options = ''
    if len(prompts) == 1 and in_course:
        if prompts[0]['DisplayText'] == 'Next':
            return "Say 'next' to continue with the course"
        return f"The next section is on {prompts[0]['DisplayText']}. Say 'next' to continue with the course."
    elif len(prompts) == 1 and not in_course:
        options = f"{prompts[0]['DisplayText']}"
    elif len(prompts) == 2:
        options = f"{prompts[0]['DisplayText']} or {prompts[1]['DisplayText']}"
    else:
        display_texts = [item['DisplayText'] for item in prompts]
        formatted_prompts = ", ".join(display_texts[:-1])
        options = f"{formatted_prompts}, or {display_texts[-1]}."

    return f"What specific topic would you like to explore next? Here are a few options: {options}. Or say 'next' to continue with the course." if in_course else f"You may want to explore these topics next: {options}"

@app.route("/answer", methods = ['POST'])
@cross_origin()
def answer():
    if not request.json:
        return jsonify({"message": "Invalid JSON format", "type": "error"}), 400
    else:
        try:
            question = request.json['question']
            qna_id = request.json['qnaId']
            voice = request.json['voice']
            answer_type = request.json['answerType']  # "long-answer" or "short-answer"

            answer, prompts, next_qna_id = generate_response(question, qna_id, answer_type)

            value = data[next_qna_id]
            in_course = value['InCourse']
            prompt_message = ''
            if len(prompts) > 0:
                prompt_message = generate_prompt_response(prompts, in_course)

            answer_type = get_answer_type(next_qna_id, answer_type)
            answer_type = 'short-answer' if answer_type == 'ShortAnswer' else 'long-answer'
            url = ''
            if voice == 'gtts':
                url = get_preasigned_s3_url(f"audio/{next_qna_id}-{answer_type}")
            elif voice == 'olivia':
                url = get_preasigned_s3_url(f"polly/{next_qna_id}-{answer_type}")
            else:
                url = get_preasigned_s3_url(f"polly/{next_qna_id}-{answer_type}-{voice}")

        except Exception as e:
            return jsonify({"message": "An error occured when processing your question: " + str(e), "type": "error"}), 500

        return jsonify({"type": "success", "message": "You have successfully process the text.", "answer": answer, "curPrompts": prompts, "promptMessage": prompt_message,"qnaId": next_qna_id, "url": url}),200


@app.route("/text-answer", methods = ['POST'])
@cross_origin()
def text_answer():
    if not request.json:
        return jsonify({"message": "Invalid JSON format", "type": "error"}), 400
    else:
        try:
            question = request.json['question']
            qna_id = request.json['qnaId']
            answer_type = request.json['answerType']

            answer, prompts, next_qna_id = generate_response(question, qna_id, answer_type)

            value = data[next_qna_id]
            in_course = value['InCourse']
            prompt_message = ''
            if len(prompts) > 0:
                prompt_message = generate_prompt_response(prompts, in_course)

        except Exception as e:
            return jsonify({"message": "An error occured when processing your question: " + str(e), "type": "error"}), 500

        return jsonify({"type": "success", "message": "You have successfully process the text.", "answer": answer, "curPrompts": prompts, "promptMessage": prompt_message,"qnaId": next_qna_id}),200

# Speech synthesis on-the-fly with gTTS
@app.route("/sound-answer", methods = ['POST'])
@cross_origin()
def sound_answer():
    if not request.json:
        return jsonify({"message": "Invalid JSON format", "type": "error"}), 400
    else:
        try:
            question = request.json['question']
            qna_id = request.json['qnaId']

            answer, prompts , next_qna_id = generate_response(question, qna_id, 'long-answer')
            full_answer = answer
            value = data[next_qna_id]
            in_course = value['InCourse']

            if len(prompts) > 0:
                response = generate_prompt_response(prompts, in_course)
                full_answer = answer + response

            speech = gTTS(full_answer)
            speech_file = "speech.mp3"
            speech.save(speech_file)

        except Exception as e:
            return jsonify({"message": "An error occured when processing your question", "type": "error"}), 500

        with open('speech.mp3', 'rb') as audio_file:
            return send_file('speech.mp3', mimetype='audio/mp3')

if __name__ == "__main__":
    set_up_answers()
    app.run(debug=True)

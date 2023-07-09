import boto3
import csv
import re
from gtts import gTTS
import nltk

BUCKET = "saturn-tts"

s3 = boto3.client('s3', region_name='us-east-1')
endpointUrl = s3.meta.endpoint_url
s3 = boto3.client('s3', endpoint_url=endpointUrl, region_name='us-east-1')

# File Processing Configuration
ALLOWED_EXTENSIONS = set(['txt'])

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

    for qnaid in data:
        info = data[qnaid]
        if not info['ContextNeeded']:
            qa_pairs[info['Question']] = qnaid


def generate_prompt_response(prompts, in_course):
    options = ''
    if len(prompts) == 1 and in_course:
        if prompts[0]['DisplayText'] == 'Next':
            return "Say next: to continue with the course"
        return f"The next section is on {prompts[0]['DisplayText']}. Say next: to continue with the course."
    elif len(prompts) == 1 and not in_course:
        options = f"{prompts[0]['DisplayText']}"
    elif len(prompts) == 2:
        options = f"{prompts[0]['DisplayText']}, or {prompts[1]['DisplayText']}"
    else:
        display_texts = [item['DisplayText'] for item in prompts]
        formatted_prompts = ", ".join(display_texts[:-1])
        options = f"{formatted_prompts}, or {display_texts[-1]}."

    return f"What specific topic would you like to explore next?: Here are a few options: {options}. Or say next: to continue with the course." if in_course else f"You may want to explore these topics next: {options}"

# uploads answer generated by gTTS
def upload_gTTS_answer(qna_id):
    value = data[qna_id]
    prompts = value['Prompts']
    in_course = value['InCourse']
    #upload_to_s3(value['LongAnswer'], prompts, f'{qna_id}-long-answer.mp3', in_course)
    if value['ShortAnswer'] != '':
        upload_to_s3(value['ShortAnswer'], prompts, f'{qna_id}-short-answer.mp3', in_course)

def upload_to_s3(answer, prompts, filename, in_course):
    answer = answer.replace(r'\n', '\n')
    answer = answer.replace(r'*', '')

    prompt_message = ''
    full_answer = answer
    if len(prompts) > 0:
        prompt_message = generate_prompt_response(prompts, in_course)
        full_answer = answer + prompt_message

    print("Full answer: ",full_answer)
    speech = gTTS(full_answer)
    speech_file = filename
    speech.save(speech_file)

    upload_data(filename, filename, BUCKET)

def upload_data(file_name, object_name,  bucket):
    object_name = "audio/" + object_name
    s3.upload_file(file_name, bucket, object_name)


def get_answer(qna_id, answer_type):
    value = data[qna_id]
    prompts = value['Prompts']
    answer = value[answer_type]
    in_course = value['InCourse']
    answer = answer.replace(r'\n', '\n')
    answer = answer.replace(r'*', '')
    prompt_message = ''
    full_answer = answer
    if len(prompts) > 0:
        prompt_message = generate_prompt_response(prompts, in_course)
        full_answer = answer + '<paragraph>' + prompt_message

    return full_answer

non_exercise_ssml = {"full_stop": '<break time=".2s"/>', "pause": '<break time=".1s"/>', "paragraph": '<break time=".4s"/>', "exclamation_start":'<prosody volume="+6dB">', "exclamation_end": '</prosody><break time=".2s"/>', "speech_start": '<prosody rate="80%">', "speech_end": '</prosody><break time=".1s"/>'}

exercise_ssml = {"full_stop": '<break time=".4s"/>', "pause": '<break time=".2s"/>', "paragraph": '<break time=".6s"/>', "exclamation_start":'<prosody volume="+6dB">', "exclamation_end": '</prosody><break time=".4s"/>', "speech_start": '<prosody rate="65%">', "speech_end": '</prosody><break time=".1s"/>'}

def sentence_to_ssml(sentence, is_exercise=False ):
    ssml_dict = exercise_ssml if is_exercise else non_exercise_ssml
    modified_sentence = ""
    speech_mark_count = 0

    for char in sentence:
        if char == '"':
            speech_mark_count += 1
            if speech_mark_count == 1:
                modified_sentence += ssml_dict["speech_start"]
            elif speech_mark_count == 2:
                modified_sentence += ssml_dict["speech_end"]
        else:
            modified_sentence += char
    modified_sentence = modified_sentence.strip()

    if sentence[-1] == '!':
        return ssml_dict["exclamation_start"] + modified_sentence + ssml_dict["exclamation_end"]
    else:
        return modified_sentence.strip() + ssml_dict["full_stop"]


def text_to_ssml(text, is_exercise=False):
    ssml_text = ""
    ssml_dict = exercise_ssml if is_exercise else non_exercise_ssml
    sentences = nltk.sent_tokenize(text)
    for sentence in sentences:
        sentence = sentence.strip()

        if sentence:
            ssml_text += sentence_to_ssml(sentence, is_exercise)
    ssml_text = re.sub(r'[:,-]', ssml_dict["pause"], ssml_text)
    ssml_text = ssml_text.replace("<paragraph>", ssml_dict["paragraph"])
    ssml_text = '<speak>' + ssml_text.strip() + '</speak>'

    return ssml_text


if __name__ == "__main__":
    set_up_answers()

    for qna_id in list(data.keys())[53:54]:
        upload_gTTS_answer(qna_id)


    # We synthesize SSML in Amazon Polly console for more control as this allows us
    # to double check the configurations and craft any special elements and not waste
    # the free characters
    for qna_id in list(data.keys())[53:54]:
        answer = get_answer(qna_id, "LongAnswer")
        value = data[qna_id]
        question = value['Question']
        isExercise = question.startswith('exercise')
        print("long_answer:", text_to_ssml(answer, isExercise))
        answer = get_answer(qna_id, "ShortAnswer")
        print("short_answer:", text_to_ssml(answer, isExercise))




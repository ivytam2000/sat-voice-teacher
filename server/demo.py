from transformers import pipeline
from fairseq.checkpoint_utils import load_model_ensemble_and_task_from_hf_hub
from fairseq.models.text_to_speech.hub_interface import TTSHubInterface
import gradio as gr


model= "facebook/wav2vec2-base-960h"
#model="ivy-tam/finetuned-whisper-base"
#model="openai/whisper-base"
p = pipeline("automatic-speech-recognition", model=model)  #

models, cfg, task = load_model_ensemble_and_task_from_hf_hub(
    "facebook/fastspeech2-en-ljspeech",
    arg_overrides={"vocoder": "hifigan", "fp16": False}
)

model = models[0]
TTSHubInterface.update_cfg_with_data_cfg(cfg, task.data_cfg)
# Put model in list when building the generator
generator = task.build_generator([model], cfg)

def transcribe(audio):
    text = p(audio)["text"]
    text = "You said " + text
    sample = TTSHubInterface.get_model_input(task, text)
    wav, rate = TTSHubInterface.get_prediction(task, model, generator, sample)
    return text, (rate, wav.numpy())


gr.Interface(
    fn=transcribe,
    inputs=[
        gr.Audio(source="microphone", type="filepath", label="Say something."),
    ],
    outputs=[
        gr.Textbox(label="You said..."),
        'audio'
    ],
).launch()




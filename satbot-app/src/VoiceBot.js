import React, { useState, useEffect, useRef } from "react";
import { trackPromise } from "react-promise-tracker";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";
import axios from "axios";
import { LoadingIndicator } from "./loadingIndicator";
import kaiImage from "./Kai.png";
import vase from "./vase.png";
import { PromptBar } from "./PromptBar";
import { VoiceRadioButton } from "./VoiceRadioButton";
import "./VoiceBot.css";

export function VoiceBot({ addChatMessage, exercise, setExercise }) {
  const [prompts, setPrompts] = useState([{}]);
  const [promptMessage, setPromptMessage] = useState("");
  // current qnaid
  const [qnaId, setQnaId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [src, setSrc] = useState("");
  const audioRef = useRef();
  const [showTrans, setShowTrans] = useState(true);
  const [showAnswer, setShowAns] = useState(false);
  const [shortAnswer, setShortAnswer] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("amy");
  const [messages, setMessages] = useState([]);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    handleExerciseChange();
  }, [exercise]);

  function handleExerciseChange() {
    //console.log("Exercise changed:", exercise);
    if (exercise !== "null") {
      //console.log("Not null exercise changed:", exercise);
      getSaturnAnswer(exercise);
      setIsPlaying(false);
    }
  }

  function handleCheckboxChange() {
    setShortAnswer(!shortAnswer);
  }

  function setPlayBack() {
    const rate = selectedVoice === "gtts" ? playbackRate + 0.25 : playbackRate;
    audioRef.current.playbackRate = rate;
  }

  function onEndOfAudioAnswer() {
    resetTranscript();
    setShowTrans(true);
    setIsPlaying(false);
    setExercise("null");
  }

  function getAnswerType() {
    return shortAnswer ? "short-answer" : "long-answer";
  }

  function reset() {
    resetTranscript();
    setAnswer("");
    setShowAns(false);
    setPrompts([{}]);
    setQnaId(null);
    setExercise("null");
    audioRef.current.pause();
  }

  function togglePlayPause() {
    const audioElement = audioRef.current;
    if (audioElement.paused) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
    setIsPlaying(!isPlaying);
  }

  function sendInput() {
    setExercise("null");
    SpeechRecognition.stopListening();
    getSaturnAnswer(transcript, qnaId);
    setIsPlaying(false);
    // FOR DEBUGGING
    //console.log(transcript);
  }

  function handlePrompts(prompts, qnaId, promptMessage) {
    console.log(prompts);
    if (prompts.length > 0) {
      setQnaId(qnaId);
    } else {
      setQnaId(null);
      return;
    }
    setMessages((prevMessages) => [...prevMessages, promptMessage]);
  }

  function splitAnswerToMessages(ans) {
    const msgs = ans.split("\n");
    console.log(ans);
    console.log(ans.split("\n"));
    setMessages(msgs);
  }

  function renderMessages(message, qnaid) {
    if (message === "VASE") {
      return (
        <div className="vase">
          <div className="vase-container">
            <img src={vase} alt=""></img>
          </div>
        </div>
      );
    }
    return (
      <div className="message-speech top">
        <div className="chat-text">{message}</div>
      </div>
    );
  }

  function getSaturnAnswer(question, qna = null) {
    setShowAns(false);
    setIsPlaying(false);

    trackPromise(
      axios({
        method: "post",
        // url: 'http://127.0.0.1:5000/answer',
        url: "https://saturnfyp.pythonanywhere.com/answer",
        responseType: "json",
        data: {
          question: question,
          qnaId: qna,
          voice: selectedVoice,
          answerType: getAnswerType(),
        },
      })
        .then((res) => {
          setPrompts(res.data.curPrompts);
          setAnswer(res.data.answer);
          splitAnswerToMessages(res.data.answer);

          addChatMessage("user", question);
          addChatMessage("saturn", res.data.answer);

          setPromptMessage(res.data.promptMessage);
          handlePrompts(
            res.data.curPrompts,
            res.data.qnaId,
            res.data.promptMessage
          );

          setSrc(res.data.url);

          setShowTrans(false);
          setShowAns(true);
        })
        .catch((error) => {
          console.log("axios error:", error);
        })
    );
  }

  const commands = [
    {
      command: "* reset",
      callback: () => reset(),
    },
    {
      command: "reset",
      callback: () => reset(),
    },
  ];
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });

  function toggleListening() {
    if (!micOn) {
      startListening();
      resetTranscript();
      setMicOn(true);
    } else {
      sendInput();
      setMicOn(false);
    }
  }

  const handleSpeedUp = () => {
    const newPlaybackRate = Math.min(2, playbackRate + 0.25);
    audioRef.current.playbackRate = newPlaybackRate;
    setPlaybackRate(newPlaybackRate);
  };

  const handleSlowDown = () => {
    const newPlaybackRate = Math.max(0.25, playbackRate - 0.25);
    audioRef.current.playbackRate = newPlaybackRate;
    setPlaybackRate(newPlaybackRate);
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <div className="voicechat-container">
        <button className="invisible-button">START</button>
        <div className="voice-bot-title"> Select a voice: </div>
        <VoiceRadioButton
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
        />

        <div className="chatbot-header">
          <img src={kaiImage} alt=""></img>
        </div>
        <div className="voicebot-container">
          {!showAnswer && (
            <div className="message-speech top">
              <div className="chat-text">
                Ask me a question about self attachment therapy or say hello to
                get started.
              </div>
            </div>
          )}
          {showAnswer &&
            messages.map((message, index) => renderMessages(message, qnaId))}
          <LoadingIndicator />
        </div>

        <PromptBar
          noPrompts={qnaId === null}
          promptData={prompts}
          getSaturnAnswer={getSaturnAnswer}
          setExercise={setExercise}
        />
        <audio
          ref={audioRef}
          onEnded={() => onEndOfAudioAnswer()}
          onCanPlay={() => setPlayBack()}
          autoPlay
          src={src}
        />
        <div className="user-container">
          {/* <div className="voice-bot-title"> you asked... </div> */}
        </div>

        <div className="short-answer">
          <label>
            <input
              type="checkbox"
              checked={shortAnswer}
              onChange={handleCheckboxChange}
            />
            Tick for Short Answer
          </label>
        </div>

        <div className="voice-input-wrapper">
          <div className="saturn-container">
            <div className="voice-bot-title">{transcript}</div>
          </div>
          <div className="controls">
            <button
              className="button"
              onClick={toggleListening}
              title="Click to record and send message"
            >
              <i
                className={
                  listening
                    ? "fa-solid fa-microphone fa-beat"
                    : "fa-solid fa-microphone "
                }
              ></i>
            </button>
          </div>
          <div className="playpause-container">
            <button className="button" onClick={togglePlayPause}>
              <i
                className={isPlaying ? "fa-solid fa-play" : "fa-solid fa-pause"}
              ></i>
            </button>
          </div>
        </div>

        <div className="speedbar-wrapper">
          <div className="button-30-wrapper">
            <button className="speed-button" onClick={handleSlowDown}>
              <i className="fa-solid fa-backward speed-icon"></i>
            </button>
          </div>
          <div className="speed">SPEED: {playbackRate.toFixed(2)}</div>
          <div className="button-30-wrapper">
            <button className="speed-button" onClick={handleSpeedUp}>
              <i className="fa-solid fa-forward"></i>
            </button>
          </div>
        </div>

        <div className="bottom-container">
          <div className="button-30-wrapper">
            <button className="button-30" onClick={reset}>
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

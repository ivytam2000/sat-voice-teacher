import React, { useState } from "react";

import "./App.css";
import { VoiceBot } from "./VoiceBot";
import { LandingPage } from "./landing";
import { FeedbackPage } from "./feedback";
import { NavBar } from "./NavBar";
import { Route, Routes } from "react-router-dom";
import { ChatHistory } from "./ChatHistory";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [exercise, setExercise] = useState("null");

  function addChatMessage(sender, message) {
    message = message.replace(/VASE/g, "");
    const newMessage = {
      sender: sender,
      message: message,
    };

    setChatHistory((prevChatHistory) => [...prevChatHistory, newMessage]);
  }

  return (
    <div className="App">
      <NavBar setExercise={setExercise} />
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/voice-bot"
            element={
              <VoiceBot
                addChatMessage={addChatMessage}
                exercise={exercise}
                setExercise={setExercise}
              />
            }
          />
          <Route
            path="/chat-history"
            element={
              <ChatHistory
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            }
          />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </div>
    </div>
  );
};
export default App;

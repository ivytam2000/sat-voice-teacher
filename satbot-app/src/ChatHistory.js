import React, { useRef, useEffect } from "react";
import "./ChatHistory.css";
import kaiImage from "./Kai.png";
export function ChatHistory({ chatHistory, setChatHistory }) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container whenever chat history changes
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatHistory]);

  function renderChatBubble(message) {
    if (message.sender === "saturn") {
      return (
        <div className="speech-container">
          <div className="kai-container">
            <img className="image" src={kaiImage} alt=""></img>
          </div>
          <div className="speech left">
            <div className="chat-text">{message.message}</div>
          </div>
        </div>
      );
    } else if (message.sender === "user") {
      return (
        <div className="speech right">
          <div className="chat-text">{message.message}</div>
        </div>
      );
    }
  }

  return (
    <div>
      <div ref={chatContainerRef} className="chat-history-container">
        {chatHistory.map((message, index) => renderChatBubble(message))}
      </div>
      <button className="clear-button" onClick={() => setChatHistory([])}>
        clear
      </button>
    </div>
  );
}

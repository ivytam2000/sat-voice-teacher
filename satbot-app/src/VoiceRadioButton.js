import React from "react";
import "./PromptBar.css";
import "./VoiceRadioButton.css";

export function VoiceRadioButton({ selectedVoice, setSelectedVoice }) {
  const handleOptionChange = (option) => {
    setSelectedVoice(option);
  };

  return (
    <div className="radio-bar-wrapper">
      <div className="radio-button-wrapper">
        <button
          value="gtts"
          className={
            selectedVoice === "gtts"
              ? "radio-button active-radio-button"
              : "radio-button"
          }
          onClick={() => handleOptionChange("gtts")}
        >
          Sophia
        </button>
      </div>

      <div className="radio-button-wrapper">
        <button
          value="gtts"
          className={
            selectedVoice === "olivia"
              ? "radio-button active-radio-button"
              : "radio-button"
          }
          onClick={() => handleOptionChange("olivia")}
        >
          Olivia
        </button>
      </div>

      <div className="radio-button-wrapper">
        <button
          value="gtts"
          className={
            selectedVoice === "amy"
              ? "radio-button active-radio-button"
              : "radio-button"
          }
          onClick={() => handleOptionChange("amy")}
        >
          Amy
        </button>
      </div>

      <div className="radio-button-wrapper">
        <button
          value="gtts"
          className={
            selectedVoice === "stephen"
              ? "radio-button active-radio-button"
              : "radio-button"
          }
          onClick={() => handleOptionChange("stephen")}
        >
          Stephen
        </button>
      </div>
    </div>
  );
}

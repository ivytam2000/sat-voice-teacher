import React from "react";
import "./PromptBar.css";

export function PromptBar({
  noPrompts,
  promptData,
  getSaturnAnswer,
  setExercise,
}) {
  if (noPrompts) {
    return null;
  }

  return (
    <div className="prompt-bar-wrapper">
      {promptData.map((prompt) => (
        <div className="prompt-button-wrapper">
          <button
            className="prompt-button"
            onClick={() => {
              setExercise("null");
              getSaturnAnswer(prompt.DisplayText, prompt.QnaId);
            }}
          >
            {prompt.DisplayText}
          </button>
        </div>
      ))}
    </div>
  );
}

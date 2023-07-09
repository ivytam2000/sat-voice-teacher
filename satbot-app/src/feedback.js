import "./feedback.css";

export function FeedbackPage() {
  const handleClick = () => {
    window.open("https://forms.gle/tqDjqFjiwvR8HJ2C8", "_blank");
  };
  return (
    <div class="landing-container">
      <button className="feedback-button" onClick={handleClick}>
        click to give feedback
      </button>
    </div>
  );
}

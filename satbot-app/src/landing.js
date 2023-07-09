import satImage from "./landing-new.png";
import { Link } from "react-router-dom";
import "./landing.css";

export function LandingPage() {
  return (
    <div class="landing-container">
      <div class="landing-kai">
        <img src={satImage} alt=""></img>
      </div>
      <div class="description-container">
        <div class="landing-title">
          Welcome to Self-Attachment Technique (SAT) course
        </div>

        <div class="landing-description">
          Chat with our voice-based virtual teacher, who will be guiding you
          through the course and answer SAT-related questions you might have.
        </div>

        <div className="landing-description">
          If you would like to view our full list of exercises, please hover
          over the navigation panel on the right
        </div>
      </div>

      <Link to="/voice-bot" className="no-underline-link">
        <button className="get-started-button">Get Started</button>
      </Link>
    </div>
  );
}

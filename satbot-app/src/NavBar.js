import { Link, useMatch, useResolvedPath } from "react-router-dom";
import "./NavBar.css";
import "./VoiceBot";

export function NavBar({ setExercise }) {
  return (
    <div>
      <div className="header">
        <div id="navbar-title">
          <Link to="/">S A T B O T</Link>
        </div>
        <div className="nav-bar">
          <CustomLink to="/">HOME</CustomLink>
          <CustomLink to="/voice-bot">VOICE BOT</CustomLink>
          <CustomLink to="/chat-history">CHAT HISTORY</CustomLink>
          <CustomLink to="/feedback">FEEDBACK</CustomLink>
        </div>
      </div>

      <div>
        <div id="root"></div>

        <div className="menu">
          <div className="title">EXERCISES OVERVIEW</div>
          <ul className="navigation">
            <div className="exercise" onClick={() => setExercise("exercise 1")}>
              <CustomExerciseLink>
                <b> 1: </b> Recalling childhood memories
              </CustomExerciseLink>
            </div>

            <div className="exercise" onClick={() => setExercise("exercise 2")}>
              <CustomExerciseLink>
                <b> 2: </b> Embracing and comforting the Child
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 3")}>
              <CustomExerciseLink>
                <b> 3: </b> Singing a song of affection
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 4")}>
              <CustomExerciseLink>
                <b> 4: </b> Expressing love and care for the Child
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 5")}>
              <CustomExerciseLink>
                <b> 5: </b> Pledging to support and care for the Child
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 6")}>
              <CustomExerciseLink>
                <b> 6: </b> Restoring our emotional world
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 7")}>
              <CustomExerciseLink>
                <b> 7: </b> Maintaining a loving relationship with the Child and
                creating zest for life
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 8")}>
              <CustomExerciseLink>
                <b> 8: </b> Enjoying nature
              </CustomExerciseLink>
            </div>
            <div className="exercise" onClick={() => setExercise("exercise 9")}>
              <CustomExerciseLink>
                <b> 9: </b> Overcoming past pain
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 10")}
            >
              <CustomExerciseLink>
                <b> 10: </b> Muscle relaxation and playful face for intentional
                laughing
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 11")}
            >
              <CustomExerciseLink>
                <b> 11: </b> Processing Current Negative Emotions
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 12")}
            >
              <CustomExerciseLink>
                <b> 12: </b> Victory laughter on our own
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 13")}
            >
              <CustomExerciseLink>
                <b>13:</b> Laughing with our childhood self
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 14")}
            >
              <CustomExerciseLink>
                <b>14:</b> Intentional laughter
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 15")}
            >
              <CustomExerciseLink>
                <b>15:</b> Learning to change your perspective
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 16")}
            >
              <CustomExerciseLink>
                <b>16:</b> Learning to be playful about your past pains
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 17")}
            >
              <CustomExerciseLink>
                <b>17:</b> Identifying patterns of acting out personal
                resentments
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 18")}
            >
              <CustomExerciseLink>
                <b>18:</b> Planning more constructive actions
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 19")}
            >
              <CustomExerciseLink>
                <b>19:</b> Finding and bonding with your compassionate role
                model
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 20")}
            >
              <CustomExerciseLink>
                <b>20:</b> Updating our rigid beliefs to enhance creativity
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 21")}
            >
              <CustomExerciseLink>
                <b>21:</b> Practicing Affirmations
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 22")}
            >
              <CustomExerciseLink>
                <b>22:</b> Using laughter to come to terms with a tragedy
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 23")}
            >
              <CustomExerciseLink>
                <b>23:</b> Try to become gradually aware of your IWM and the
                influence of your primary care-givers
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 24")}
            >
              <CustomExerciseLink>
                <b>24:</b> Recognizing and containing the internal persecutor
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 25")}
            >
              <CustomExerciseLink>
                <b>25:</b> Solving personal crises
              </CustomExerciseLink>
            </div>
            <div
              className="exercise"
              onClick={() => setExercise("exercise 26")}
            >
              <CustomExerciseLink>
                <b>26:</b> Discovering your true, free, and sovereign self in
                this age of emergency
              </CustomExerciseLink>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <div>
      <Link
        className={isActive ? "nav-active" : "nav-normal"}
        to={to}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

function CustomExerciseLink({ children, ...props }) {
  return (
    <div>
      <Link
        to={"/voice-bot"}
        style={{ textDecoration: "none", color: "inherit" }}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

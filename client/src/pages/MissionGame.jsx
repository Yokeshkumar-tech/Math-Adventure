// client/src/pages/MissionGame.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import GeometryDiagram from "../components/game/GeometryDiagram";
import MathRenderer from "../components/MathRenderer.jsx";
import MathVisualizer from "../components/MathVisualizer.jsx";
import TeachBeforeTestingModal from "../components/game/TeachBeforeTestingModal.jsx";
import {
  playClickSound,
  playCoinSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  isSoundEnabled,
  setSoundEnabled,
} from "../utils/soundEffects";
import "./MissionGame.css";

export default function MissionGame() {
  const { missionId } = useParams();
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  // Session & Mission Data
  const [session, setSession] = useState(null);
  const [mission, setMission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gameplay State
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(null); // null, 3, 2, 1, "GO!"
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState(null); // { isCorrect, explanation, correctAnswer, coinsEarned, xpEarned }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintTier, setHintTier] = useState(1);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [showVisualizerModal, setShowVisualizerModal] = useState(false);
  const [untimedMode, setUntimedMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [charAnimation, setCharAnimation] = useState("idle");

  // Running Tallies
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Completion State
  const [completionResult, setCompletionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const questionStartTime = useRef(Date.now());
  const inputRef = useRef(null);

  // Fetch / initialize mission game
  useEffect(() => {
    loadMissionData();
  }, [missionId, token]);

  const loadMissionData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/game/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start mission.");

      setSession(data.session || { _id: data.sessionId });
      setMission(data.mission);
      setQuestions(data.questions || [data.question]);
      setCurrentIndex(0);
      setCoinsEarned(0);
      setXpEarned(0);
      setCorrectCount(0);
      setCompletionResult(null);
      setFeedback(null);
      setSelectedOption("");
      setGameStarted(false); // Wait for user to review mission briefing and click Start
    } catch (err) {
      setError(err.message || "Could not launch mission.");
    } finally {
      setLoading(false);
    }
  };

  // Start Mission with 3-second animated countdown
  const handleStartMission = () => {
    playClickSound();
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return "GO!";
        clearInterval(timer);
        setTimeout(() => {
          setCountdown(null);
          setGameStarted(true);
          questionStartTime.current = Date.now();
        }, 600);
        return prev;
      });
    }, 800);
  };

  const handleSelectOption = (option) => {
    if (feedback || isSubmitting) return;
    playClickSound();
    setSelectedOption(String(option));
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedOption || !session || feedback || isSubmitting) return;
    setIsSubmitting(true);

    const currentQ = questions[currentIndex];
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime.current) / 1000));

    try {
      const res = await fetch("http://localhost:5000/api/game/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session._id,
          questionId: currentQ._id || currentQ.id,
          selectedAnswer: selectedOption,
          timeSpentSeconds: timeSpent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error validating answer.");

      const isCorrect = data.isCorrect ?? data.correct;

      if (isCorrect) {
        playCorrectSound();
        playCoinSound();
        setCharAnimation("attack");
        setCoinsEarned((prev) => prev + (data.coinsEarned || 20));
        setXpEarned((prev) => prev + (data.xpEarned || 10));
        setCorrectCount((prev) => prev + 1);
        setTimeout(() => setCharAnimation("idle"), 800);
      } else {
        playWrongSound();
        setCharAnimation("hurt");
        setTimeout(() => setCharAnimation("idle"), 600);
      }

      setFeedback({
        isCorrect,
        explanation: data.explanation || "Review the step-by-step mathematical reasoning!",
        correctAnswer: data.correctAnswer,
        coins: data.coinsEarned || (isCorrect ? 20 : 0),
        xp: data.xpEarned || (isCorrect ? 10 : 0),
      });
    } catch (err) {
      setError(err.message || "Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOption, session, feedback, isSubmitting, questions, currentIndex, token]);

  const handleNextQuestion = useCallback(() => {
    playClickSound();
    setFeedback(null);
    setSelectedOption("");
    setShowHintModal(false);
    setHintTier(1);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      questionStartTime.current = Date.now();
    } else {
      finishMissionGame();
    }
  }, [currentIndex, questions.length]);

  const handleRetryQuestion = () => {
    playClickSound();
    setFeedback(null);
    setSelectedOption("");
    setShowHintModal(false);
    questionStartTime.current = Date.now();
  };

  const finishMissionGame = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/game/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: session._id,
          missionId: mission._id || mission.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error finalizing mission.");

      playVictorySound();
      setCharAnimation("victory");
      setCompletionResult(data);

      // Update global user stats
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          totalCoins: (prev?.totalCoins || 0) + (data.totalCoinsEarned || 0),
          totalStars: (prev?.totalStars || 0) + (data.starsEarned || 0),
          totalXP: (prev?.totalXP || 0) + (data.totalXpEarned || 0),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not complete mission.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard controls: 1-4 for options, Enter for submit or next
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in numerical text input
      if (e.target && e.target.tagName === "INPUT") {
        if (e.key === "Enter" && !feedback) {
          e.preventDefault();
          handleSubmitAnswer();
        }
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (feedback) {
          handleNextQuestion();
        } else if (selectedOption && !isSubmitting) {
          handleSubmitAnswer();
        }
        return;
      }

      if (!feedback && !isSubmitting && questions[currentIndex]) {
        const q = questions[currentIndex];
        const opts = q.options || [];
        if (opts.length > 0) {
          if (e.key === "1" && opts[0]) handleSelectOption(opts[0]);
          if (e.key === "2" && opts[1]) handleSelectOption(opts[1]);
          if (e.key === "3" && opts[2]) handleSelectOption(opts[2]);
          if (e.key === "4" && opts[3]) handleSelectOption(opts[3]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedback, isSubmitting, selectedOption, currentIndex, questions, handleNextQuestion, handleSubmitAnswer]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length
    ? Math.round(((currentIndex + (feedback?.isCorrect ? 1 : 0)) / questions.length) * 100)
    : 0;

  // Determine Answer Type
  const answerType = currentQ?.answerType || (currentQ?.options?.length > 0 ? "multiple_choice" : "numerical");

  return (
    <div className={`mission-game-page theme-${mission?.worldSlug || "number-forest"}`}>
      {/* Top Game HUD */}
      <header className="game-hud">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hud-pause-btn"
            onClick={() => {
              playClickSound();
              setIsPaused(true);
            }}
          >
            ⏸ Pause
          </button>
          <button
            type="button"
            className="hud-pause-btn"
            title="Toggle Fullscreen"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? "🗗 Exit" : "⛶ Fullscreen"}
          </button>
        </div>

        <div className="hud-title-zone">
          <span className="hud-mission-name">{mission?.title}</span>
          <span className="hud-q-counter">
            {gameStarted ? `Question ${currentIndex + 1} of ${questions.length}` : "Mission Briefing"}
          </span>
        </div>

        <div className="hud-rewards-zone">
          <div className="hud-counter-pill coins-pill">
            <span>🪙</span>
            <strong>+{coinsEarned}</strong>
          </div>
          <div className="hud-counter-pill xp-pill">
            <span>⚡</span>
            <strong>+{xpEarned}</strong>
          </div>
          <button
            type="button"
            className="hud-sound-toggle"
            title="Toggle Sound"
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              setSoundEnabled(next);
            }}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="game-mission-progress-bar">
        <div className="game-mission-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Countdown Animation Overlay */}
      {countdown !== null && (
        <div className="countdown-overlay">
          <div className="countdown-number animate-bounce">{countdown}</div>
        </div>
      )}

      {/* Main Game Arena */}
      <main className="game-arena">
        {error && <div className="game-error-toast">{error}</div>}

        {loading ? (
          <div className="game-loading-card">
            <div className="game-loading-orb" />
            <p>Loading magical challenge...</p>
          </div>
        ) : !gameStarted ? (
          /* MISSION START BRIEFING STAGE */
          <div className="mission-briefing-card animate-fadeIn">
            <div className="briefing-badge">📜 Quest Objective</div>
            <h1 className="briefing-title">{mission?.title}</h1>
            <p className="briefing-story">"{mission?.story}"</p>

            <div className="briefing-details-grid">
              <div className="briefing-detail-box">
                <span className="detail-label">🎯 Target Topic</span>
                <strong className="detail-value">{mission?.topic}</strong>
              </div>
              <div className="briefing-detail-box">
                <span className="detail-label">📊 Questions</span>
                <strong className="detail-value">{questions.length} Challenges</strong>
              </div>
              <div className="briefing-detail-box">
                <span className="detail-label">🎁 Rewards</span>
                <strong className="detail-value text-amber-400">🪙 +50 Coins • ⭐ 3 Stars</strong>
              </div>
            </div>

            <div className="briefing-mentor-quote">
              <span className="mentor-icon">🧙‍♂️</span>
              <p>"{mission?.characterDialogue || "Trust in your mathematics, young champion! Take each problem step by step."}"</p>
            </div>

            <div className="briefing-actions">
              <button
                type="button"
                className="btn-teach-first px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-900 font-fredoka font-bold text-base shadow-lg shadow-amber-400/30 transition hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => setShowTeachModal(true)}
              >
                <span>🦉 Teach Me First (with Professor Pi)</span>
              </button>
              <button
                type="button"
                className="btn-start-quest"
                onClick={handleStartMission}
              >
                ⚔️ Start Mission
              </button>
              <button
                type="button"
                className="btn-exit-briefing"
                onClick={() => navigate(`/worlds/${mission?.worldSlug || "number-forest"}`)}
              >
                ↩️ Back to Map
              </button>
            </div>
          </div>
        ) : completionResult ? (
          /* MISSION COMPLETION VICTORY SCREEN */
          <div className="mission-victory-card">
            <div className="victory-character-stage">
              <CharacterSprite
                characterId={user?.selectedCharacter?.id || "knight"}
                costume={user?.selectedCharacter?.costume || "default"}
                accessory={user?.selectedCharacter?.accessory || "none"}
                pet={user?.selectedCharacter?.pet || "none"}
                animation="victory"
                size="lg"
              />
            </div>

            <h2 className="victory-title">🎉 Mission Accomplished!</h2>
            <p className="victory-subtitle">{mission?.title}</p>

            {/* Stars Celebration Tray */}
            <div className="victory-stars-tray">
              {[1, 2, 3].map((starIdx) => (
                <div
                  key={starIdx}
                  className={`victory-star-badge ${
                    starIdx <= completionResult.starsEarned ? "earned" : "unearned"
                  }`}
                >
                  ⭐
                </div>
              ))}
            </div>

            <div className="victory-accuracy-tag">
              Accuracy: {completionResult.accuracy}% ({correctCount}/{questions.length} Correct) •{" "}
              {completionResult.starsEarned === 3
                ? "⭐⭐⭐ Mastery (≥80%)"
                : completionResult.starsEarned === 2
                ? "⭐⭐ Great Job (60-79%)"
                : "⭐ Mission Completed (<60%)"}
            </div>

            {/* Rewards Breakdown */}
            <div className="victory-rewards-summary">
              <div className="victory-reward-chip">
                <span className="chip-icon">🪙</span>
                <div>
                  <strong>+{completionResult.totalCoinsEarned}</strong>
                  <small>Coins Collected</small>
                </div>
              </div>

              <div className="victory-reward-chip">
                <span className="chip-icon">⚡</span>
                <div>
                  <strong>+{completionResult.totalXpEarned}</strong>
                  <small>XP Gained</small>
                </div>
              </div>

              <div className="victory-reward-chip">
                <span className="chip-icon">⭐</span>
                <div>
                  <strong>+{completionResult.starsEarned}</strong>
                  <small>Stars Awarded</small>
                </div>
              </div>
            </div>

            {/* Unlocks Alerts */}
            {completionResult.unlockedBadge && (
              <div className="victory-badge-alert">
                🏆 New Achievement: <strong>{completionResult.unlockedBadge}</strong>!
              </div>
            )}
            {completionResult.nextWorldUnlocked && (
              <div className="victory-world-alert">
                🌍 Next Fantasy World Unlocked: <strong>{completionResult.nextWorldUnlocked}</strong>!
              </div>
            )}

            {/* Navigation Actions */}
            <div className="victory-actions-tray">
              <button
                type="button"
                className="btn-return-map"
                onClick={() => {
                  playClickSound();
                  navigate(`/worlds/${mission?.worldSlug || "number-forest"}`);
                }}
              >
                🗺️ Return to World
              </button>
              <button
                type="button"
                className="btn-replay-mission"
                onClick={() => loadMissionData()}
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTION BATTLE SCREEN */
          <div className="game-battle-stage">
            {/* Left Hero Stage */}
            <div className="game-hero-pane">
              <CharacterSprite
                characterId={user?.selectedCharacter?.id || "knight"}
                costume={user?.selectedCharacter?.costume || "default"}
                accessory={user?.selectedCharacter?.accessory || "none"}
                pet={user?.selectedCharacter?.pet || "none"}
                animation={charAnimation}
                size="md"
                showName={true}
                nickname={user?.nickname || user?.displayName || user?.name || "Hero"}
                level={user?.currentLevel || 1}
              />
              <div className="hero-dialogue-cloud">
                <span>{mission?.characterDialogue || "Calculate carefully, young hero!"}</span>
              </div>

              {/* Points badge & Keyboard guidance */}
              <div className="mt-4 flex flex-col gap-1 items-center">
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full">
                  ⚡ {currentQ?.points || 10} Points
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  ⌨️ Keys 1–4 to pick • Enter to submit
                </span>
              </div>
            </div>

            {/* Center Runestone Question Card */}
            <div className="game-question-runestone">
              <div className="runestone-header">
                <span className="runestone-topic-tag">{currentQ?.topic}</span>
                <span className={`runestone-diff diff-${currentQ?.difficulty}`}>
                  {currentQ?.difficulty}
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Visual Math Tool Button */}
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1"
                    onClick={() => {
                      playClickSound();
                      setShowVisualizerModal(true);
                    }}
                    title="Interactive Math Visualizer"
                  >
                    <span>🎨 Visual Tool</span>
                  </button>

                  {/* Ask Professor Pi Button */}
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1"
                    onClick={() => {
                      playClickSound();
                      setShowTeachModal(true);
                    }}
                    title="Ask Professor Pi"
                  >
                    <span>🦉 Ask Pi</span>
                  </button>

                  {/* 3-Tier Hint Button */}
                  <button
                    type="button"
                    className="runestone-hint-btn"
                    onClick={() => {
                      playClickSound();
                      setShowHintModal(true);
                    }}
                  >
                    💡 Hints
                  </button>
                </div>
              </div>

              {/* Geometry Diagram (if geometric or SVG provided) */}
              <GeometryDiagram
                diagramSvg={currentQ?.diagramSvg}
                topic={currentQ?.topic}
                questionText={currentQ?.questionText || currentQ?.question}
              />

              {/* Question Text */}
              <div className="runestone-question-text">
                <h2><MathRenderer content={currentQ?.questionText || currentQ?.question || ""} /></h2>
              </div>

              {/* Answer Engine: Switch based on answerType */}
              {answerType === "numerical" || answerType === "fill_blank" ? (
                /* NUMERICAL / FILL IN THE BLANK INPUT */
                <div className="numerical-answer-engine">
                  <label htmlFor="num-input" className="text-sm font-semibold text-sky-200">
                    Enter your calculated answer:
                  </label>
                  <div className="numerical-input-group">
                    <input
                      id="num-input"
                      ref={inputRef}
                      type="text"
                      className="numerical-text-input"
                      placeholder="e.g. 24 or 3/4"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={feedback !== null || isSubmitting}
                      autoFocus
                    />
                    {!feedback && (
                      <button
                        type="button"
                        className="numerical-submit-btn"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedOption.trim() || isSubmitting}
                      >
                        {isSubmitting ? "Checking..." : "Submit ⚡"}
                      </button>
                    )}
                  </div>
                </div>
              ) : answerType === "true_false" ? (
                /* TRUE / FALSE SELECTION */
                <div className="true-false-grid">
                  {["True", "False"].map((opt) => {
                    const isSelected = selectedOption.toLowerCase() === opt.toLowerCase();
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`true-false-card ${opt.toLowerCase()} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectOption(opt)}
                        disabled={feedback !== null || isSubmitting}
                      >
                        <span className="tf-icon">{opt === "True" ? "✅" : "❌"}</span>
                        <span className="tf-label">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* MULTIPLE CHOICE OPTIONS GRID (Default) */
                <div className="runestone-options-grid">
                  {currentQ?.options?.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isFeedback = feedback !== null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`runestone-option-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectOption(opt)}
                        disabled={isFeedback || isSubmitting}
                      >
                        <span className="option-letter">{idx + 1}</span>
                        <span className="option-label"><MathRenderer content={opt} /></span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Submit or Next / Retry Action Tray */}
              {!feedback ? (
                answerType !== "numerical" && (
                  <button
                    type="button"
                    className="runestone-submit-btn"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption || isSubmitting}
                  >
                    {isSubmitting ? "Casting Answer..." : "⚡ Cast Answer"}
                  </button>
                )
              ) : (
                <div
                  className={`runestone-feedback-banner ${
                    feedback.isCorrect ? "feedback-correct" : "feedback-incorrect"
                  }`}
                >
                  <div className="feedback-content">
                    <span className="feedback-icon">
                      {feedback.isCorrect ? "🎉 Correct! Well Done!" : "💡 Not quite yet!"}
                    </span>
                    {!feedback.isCorrect && feedback.correctAnswer && (
                      <p className="font-bold text-amber-300 text-sm">
                        Correct Answer: {feedback.correctAnswer}
                      </p>
                    )}
                    <div className="feedback-explanation"><MathRenderer content={feedback.explanation} /></div>
                    {feedback.isCorrect && (
                      <span className="feedback-reward-tag">
                        +{feedback.coins} 🪙 Coins • +{feedback.xp} ⚡ XP
                      </span>
                    )}
                  </div>

                  <div className="feedback-action-row">
                    {feedback.isCorrect ? (
                      <button
                        type="button"
                        className="feedback-next-btn"
                        onClick={handleNextQuestion}
                      >
                        {currentIndex + 1 < questions.length
                          ? "Next Question ➡️"
                          : "Finish Mission 🏆"}
                      </button>
                    ) : (
                      <div className="feedback-incorrect-buttons">
                        <button
                          type="button"
                          className="feedback-retry-btn"
                          onClick={handleRetryQuestion}
                        >
                          🔄 Try Again
                        </button>
                        <button
                          type="button"
                          className="feedback-skip-btn"
                          onClick={handleNextQuestion}
                        >
                          Continue ➡️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3-TIER HINT MODAL DRAWER */}
      {showHintModal && (
        <div className="pause-modal-backdrop" onClick={() => setShowHintModal(false)}>
          <div className="hint-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-400">💡 Mentor's Guidance</h2>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg font-bold"
                onClick={() => setShowHintModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Tier Tabs */}
            <div className="hint-tier-tabs">
              <button
                type="button"
                className={`hint-tier-tab ${hintTier === 1 ? "active" : ""}`}
                onClick={() => setHintTier(1)}
              >
                Level 1: Clue
              </button>
              <button
                type="button"
                className={`hint-tier-tab ${hintTier === 2 ? "active" : ""}`}
                onClick={() => setHintTier(2)}
              >
                Level 2: Formula / Concept
              </button>
              <button
                type="button"
                className={`hint-tier-tab ${hintTier === 3 ? "active" : ""}`}
                onClick={() => setHintTier(3)}
              >
                Level 3: Worked Example
              </button>
            </div>

            {/* Hint Content Area */}
            <div className="hint-content-box">
              {hintTier === 1 && (
                <div>
                  <h4 className="font-bold text-sky-300 text-sm mb-1">🔍 Small Clue</h4>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {currentQ?.hints?.clue || currentQ?.hint || "Check the numbers given in the problem and consider what operation relates them."}
                  </p>
                </div>
              )}
              {hintTier === 2 && (
                <div>
                  <h4 className="font-bold text-emerald-300 text-sm mb-1">📐 Formula & Principle</h4>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {currentQ?.hints?.concept || `Remember the core rule for ${currentQ?.topic}: follow the step-by-step formula and keep track of units.`}
                  </p>
                </div>
              )}
              {hintTier === 3 && (
                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-1">✍️ Worked Example (Different Values)</h4>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    {currentQ?.hints?.workedExample || "Example: If side is 5 cm, Perimeter = 4 × 5 = 20 cm. Apply the same reasoning to the given question!"}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
              onClick={() => setShowHintModal(false)}
            >
              Got it, let me solve it!
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="pause-modal-backdrop" onClick={() => setIsPaused(false)}>
          <div className="pause-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>⏸ Mission Paused</h2>
            <p>Your current answers and progress are safe.</p>
            <div className="pause-modal-buttons">
              <button
                type="button"
                className="btn-pause-resume"
                onClick={() => {
                  playClickSound();
                  setIsPaused(false);
                }}
              >
                ▶ Resume Adventure
              </button>
              <button
                type="button"
                className="btn-pause-restart"
                onClick={() => {
                  playClickSound();
                  setIsPaused(false);
                  loadMissionData();
                }}
              >
                🔄 Restart Mission
              </button>
              <button
                type="button"
                className="btn-pause-quit"
                onClick={() => {
                  playClickSound();
                  navigate(`/worlds/${mission?.worldSlug || "number-forest"}`);
                }}
              >
                🚪 Quit to World Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACH BEFORE TESTING MODAL WITH PROFESSOR PI */}
      <TeachBeforeTestingModal
        isOpen={showTeachModal}
        onClose={() => setShowTeachModal(false)}
        onStartMission={() => {
          setShowTeachModal(false);
          handleStartMission();
        }}
        topic={currentQ?.topic || mission?.topic || "Arithmetic"}
        missionTitle={mission?.title || "Mission Quest"}
      />

      {/* INTERACTIVE MATH VISUALIZER MODAL */}
      {showVisualizerModal && (
        <div className="pause-modal-backdrop" onClick={() => setShowVisualizerModal(false)}>
          <div
            className="bg-slate-900 border-2 border-purple-400 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <h3 className="text-lg font-bold text-white font-fredoka">
                  Interactive Math Lab: {currentQ?.topic || mission?.topic}
                </h3>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg font-bold"
                onClick={() => setShowVisualizerModal(false)}
              >
                ✕
              </button>
            </div>

            <MathVisualizer type="auto" topic={currentQ?.topic || mission?.topic} />

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                onClick={() => setShowVisualizerModal(false)}
              >
                Back to Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

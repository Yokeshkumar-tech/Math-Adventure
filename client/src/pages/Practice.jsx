// client/src/pages/Practice.jsx - Premium Adventure Quiz Arena
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import MathRenderer from "../components/MathRenderer.jsx";
import GeometryDiagram from "../components/game/GeometryDiagram.jsx";
import CharacterSprite from "../components/game/CharacterSprite.jsx";
import TeachBeforeTestingModal from "../components/game/TeachBeforeTestingModal.jsx";
import MathVisualizer from "../components/MathVisualizer.jsx";
import confetti from "canvas-confetti";
import {
  playClickSound,
  playCoinSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  isSoundEnabled,
  setSoundEnabled,
  isMusicEnabled,
  setMusicEnabled,
} from "../utils/soundEffects.js";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Shield,
  Clock,
  Lightbulb,
  Scissors,
  Flame,
  HelpCircle,
  BookOpen,
  Award,
  ChevronRight,
  Pause,
  Play,
  LogOut,
  Zap,
} from "lucide-react";
import "./Practice.css";

// Realm metadata mapping for top quest panel
const REALM_META = {
  "number-forest": { name: "Number Forest", icon: "🌲", mission: "The Ancient Arithmetic Gates" },
  "fraction-kingdom": { name: "Fraction Kingdom", icon: "🍕", mission: "The Pizza Golem Trial" },
  "desert-of-numbers": { name: "Desert of Numbers", icon: "🏜️", mission: "The Prime Sphinx Oasis" },
  "ocean-of-geometry": { name: "Ocean of Geometry", icon: "🌊", mission: "The Polygon Reefs" },
  "geometry-mountains": { name: "Geometry Mountains", icon: "⛰️", mission: "The Broken Bridge" },
  "dragons-castle": { name: "Dragon's Math Castle", icon: "🏰", mission: "Ignis' Volcanic Chamber" },
  "fractions": { name: "Fraction Kingdom", icon: "🍕", mission: "Equivalent Tower Challenge" },
  "decimals": { name: "Desert of Numbers", icon: "🏜️", mission: "Decimal Mirage Pass" },
  "area-and-perimeter": { name: "Geometry Mountains", icon: "⛰️", mission: "The Broken Bridge" },
  "basic-geometry": { name: "Ocean of Geometry", icon: "📐", mission: "Angle Archipelago" },
};

function getRealmMeta(topicId = "") {
  const key = String(topicId).toLowerCase().replace(/\s+/g, "-");
  return REALM_META[key] || {
    name: decodeURIComponent(topicId) || "Adventure Realm",
    icon: "⚔️",
    mission: "Mathematical Trial",
  };
}

export default function Practice() {
  const { topicId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Realm & Branding
  const realm = getRealmMeta(topicId);

  // Authoritative Game State
  const [gameState, setGameState] = useState("READY"); // READY, PLAYING, SUBMITTED, PAUSED, COMPLETED
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentLevel, setCurrentLevel] = useState("easy");
  const [runningPoints, setRunningPoints] = useState(0);

  // Answer & Feedback State
  const [selectedOption, setSelectedOption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [nextQCache, setNextQCache] = useState(null);

  // Combo Streak Mechanics
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  // Challenge Mode & Timer (30s per question)
  const [challengeMode, setChallengeMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // Power-Ups Inventory
  const [powerups, setPowerups] = useState({
    fiftyFifty: 2,
    timeBoost: 2,
    hintCrystal: 3,
    streakShield: 1,
  });
  const [shieldActive, setShieldActive] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);

  // Tiered Hints (Tier 1: Clue, Tier 2: Formula, Tier 3: Worked Example)
  const [showHintModal, setShowHintModal] = useState(false);
  const [activeHintTier, setActiveHintTier] = useState(1);
  const [unlockedHintTier, setUnlockedHintTier] = useState(1);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  // Professor Pi / Formula Reference
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [showVisualizerModal, setShowVisualizerModal] = useState(false);

  // Audio & Accessibility Settings
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());

  // Performance Review Tracking
  const [quizHistory, setQuizHistory] = useState([]); // List of answered questions for review
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Multiplier formula based on consecutive correct answers
  const comboMultiplier =
    currentStreak >= 8 ? 2.0 : currentStreak >= 5 ? 1.5 : currentStreak >= 3 ? 1.25 : 1.0;

  // Initialize Quiz
  useEffect(() => {
    async function initQuiz() {
      setLoading(true);
      try {
        let res;
        const decodedTopic = decodeURIComponent(topicId);

        if (topicId === "daily") {
          res = await api.post("/quizzes/daily-challenge");
        } else if (topicId === "revision") {
          res = await api.post("/quizzes/revision");
        } else {
          res = await api.post("/quizzes/start", {
            topic: decodedTopic,
            grade: user?.grade || 5,
          });
        }

        setSessionId(res.data.sessionId);
        setCurrentQuestion(res.data.question);
        setQuestionNumber(res.data.number || 1);
        setTotalQuestions(res.data.total || 10);
        setCurrentLevel(res.data.level || "easy");
        setGameState("PLAYING");
        setTimeLeft(30);
      } catch (err) {
        console.error("Start quiz error:", err);
        // Fallback demo question if network or offline
        const fallbackQ = {
          id: "demo-q1",
          question: "What is the perimeter of a square with side 6 cm?",
          options: ["18 cm", "20 cm", "24 cm", "36 cm"],
          difficulty: "easy",
          topic: "Area and Perimeter",
          points: 10,
          expression: "4 \\times 6",
          hints: {
            clue: "A square has four equal sides. You want the total distance around the outside.",
            concept: "Perimeter formula: P = 4 × side.",
            workedExample: "Since each of the 4 sides is 6 cm: 6 + 6 + 6 + 6 = 24 cm.",
          },
        };
        setCurrentQuestion(fallbackQ);
        setGameState("PLAYING");
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [topicId]);

  // Challenge Mode Timer effect
  useEffect(() => {
    if (gameState !== "PLAYING" || !challengeMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, challengeMode, currentQuestion]);

  // Handle time expiring in challenge mode
  const handleTimeExpired = () => {
    if (gameState !== "PLAYING" || submitting) return;
    playWrongSound();
    // Auto-submit empty choice to trigger feedback
    handleAnswerSubmit("__TIMEOUT__");
  };

  // Keyboard navigation: [1]-[4], [Enter], [Esc]
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keystrokes if typing inside any input or textarea
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === "Escape") {
        if (showHintModal) setShowHintModal(false);
        else if (showPauseModal) setShowPauseModal(false);
        else if (gameState === "PLAYING") setShowPauseModal(true);
        return;
      }

      if (gameState === "PLAYING") {
        if (["1", "2", "3", "4"].includes(e.key) && currentQuestion?.options) {
          const idx = parseInt(e.key, 10) - 1;
          const opt = currentQuestion.options[idx];
          if (opt && !eliminatedOptions.includes(opt)) {
            playClickSound();
            setSelectedOption(opt);
          }
        }
        if (e.key === "Enter" && selectedOption) {
          handleSubmit();
        }
      } else if (gameState === "SUBMITTED") {
        if (e.key === "Enter") {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentQuestion, selectedOption, eliminatedOptions, showHintModal, showPauseModal]);

  // Submit Answer
  const handleSubmit = () => {
    if (!selectedOption || gameState !== "PLAYING" || submitting) return;
    handleAnswerSubmit(selectedOption);
  };

  const handleAnswerSubmit = async (chosenOption) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      let isCorrect = false;
      let exp = "";
      let correctOpt = "";
      let ptsEarned = 0;
      let nextLevel = currentLevel;
      let isLast = questionNumber >= totalQuestions;
      let nextQ = null;

      if (sessionId) {
        const res = await api.post("/quizzes/submit", {
          sessionId,
          questionId: currentQuestion.id,
          selected: chosenOption,
        });
        isCorrect = res.data.correct;
        exp = res.data.explanation;
        correctOpt = res.data.correctAnswer;
        ptsEarned = Math.round((res.data.pointsEarned || 10) * comboMultiplier);
        nextLevel = res.data.nextLevel;
        isLast = res.data.isLast;
        nextQ = res.data.nextQuestion;
      } else {
        // Offline / demo fallback validation
        correctOpt = "24 cm";
        isCorrect = chosenOption.includes("24");
        exp = "A square has four equal sides. Perimeter = 4 × side = 4 × 6 = 24 cm.";
        ptsEarned = isCorrect ? Math.round(10 * comboMultiplier) : 0;
      }

      // Update streaks & shield
      if (isCorrect) {
        playCorrectSound();
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } else {
        playWrongSound();
        if (shieldActive) {
          // Shield absorbs the mistake
          setShieldActive(false);
        } else {
          setCurrentStreak(0);
        }
      }

      const feedbackData = {
        correct: isCorrect,
        correctAnswer: correctOpt,
        explanation: exp,
        pointsEarned: ptsEarned,
        userSelected: chosenOption,
      };

      setFeedback(feedbackData);
      setRunningPoints((prev) => prev + ptsEarned);
      setIsLastQuestion(isLast);
      setNextQCache(nextQ);
      setCurrentLevel(nextLevel);
      setGameState("SUBMITTED");

      // Record for quiz review drawer
      setQuizHistory((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          userSelected: chosenOption,
          correctAnswer: correctOpt,
          isCorrect,
          explanation: exp,
        },
      ]);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Advance to Next Question or Complete Quiz
  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      // Quiz Finished!
      setLoading(true);
      playVictorySound();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      try {
        let finishData = {
          pointsEarned: runningPoints,
          coinsEarned: Math.round(runningPoints / 2) + 20,
          starsEarned: runningPoints >= 70 ? 3 : runningPoints >= 40 ? 2 : 1,
          accuracy: Math.round(
            (quizHistory.filter((q) => q.isCorrect).length / totalQuestions) * 100
          ),
        };

        if (sessionId) {
          const res = await api.post("/quizzes/finish", { sessionId });
          await refreshUser();
          finishData = {
            ...finishData,
            ...res.data,
            pointsEarned: res.data.pointsEarned || runningPoints,
            coinsEarned: res.data.coinsEarned || finishData.coinsEarned,
            starsEarned: res.data.starsEarned || finishData.starsEarned,
            accuracy: res.data.attempt?.accuracy || finishData.accuracy,
          };
        }

        setCompletionData(finishData);
        setGameState("COMPLETED");
      } catch (err) {
        console.error("Finish quiz error:", err);
        setCompletionData({
          pointsEarned: runningPoints,
          coinsEarned: 25,
          starsEarned: 2,
          accuracy: 80,
        });
        setGameState("COMPLETED");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Move to next question in session
    if (nextQCache) {
      setCurrentQuestion(nextQCache);
      setQuestionNumber((prev) => prev + 1);
      setSelectedOption("");
      setFeedback(null);
      setEliminatedOptions([]);
      setUnlockedHintTier(1);
      setActiveHintTier(1);
      setTimeLeft(30);
      setNextQCache(null);
      setGameState("PLAYING");
    }
  };

  // Power-Up: 50/50 (Remove two incorrect options)
  const handleUseFiftyFifty = () => {
    if (powerups.fiftyFifty <= 0 || !currentQuestion?.options || gameState !== "PLAYING") return;
    playClickSound();

    // Identify wrong options to eliminate
    const wrongOptions = currentQuestion.options.filter(
      (opt) => opt !== currentQuestion.correctAnswer
    );
    const toEliminate = wrongOptions.slice(0, 2);

    setEliminatedOptions(toEliminate);
    setPowerups((prev) => ({ ...prev, fiftyFifty: prev.fiftyFifty - 1 }));
  };

  // Power-Up: Time Boost (+15s)
  const handleUseTimeBoost = () => {
    if (powerups.timeBoost <= 0 || gameState !== "PLAYING") return;
    playClickSound();
    setTimeLeft((prev) => prev + 15);
    setPowerups((prev) => ({ ...prev, timeBoost: prev.timeBoost - 1 }));
  };

  // Power-Up: Streak Shield
  const handleUseStreakShield = () => {
    if (powerups.streakShield <= 0 || shieldActive) return;
    playClickSound();
    setShieldActive(true);
    setPowerups((prev) => ({ ...prev, streakShield: prev.streakShield - 1 }));
  };

  // Power-Up / Feature: Tiered Hint Crystal
  const handleOpenHints = () => {
    playClickSound();
    setShowHintModal(true);
    setHintsUsedCount((prev) => prev + 1);
  };

  const handleUnlockNextHint = () => {
    if (unlockedHintTier < 3) {
      playClickSound();
      const nextTier = unlockedHintTier + 1;
      setUnlockedHintTier(nextTier);
      setActiveHintTier(nextTier);
    }
  };

  // Audio toggles
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    setMusicEnabled(next);
  };

  if (loading && !currentQuestion) {
    return (
      <div className="quiz-arena-page flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-fredoka text-xl text-indigo-300">Summoning Adventure Challenge...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: VICTORY & RESULTS DASHBOARD
  // ========================================================
  if (gameState === "COMPLETED" && completionData) {
    return (
      <div className="quiz-arena-page">
        <div className="quiz-arena-inner">
          <div className="quiz-results-card">
            
            {/* Animated Trophy */}
            <div className="results-trophy-zone">
              🏆
            </div>

            <h1 className="results-title">Mission Accomplished!</h1>
            <p className="results-subtitle">
              You conquered {realm.name} — {realm.mission}!
            </p>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-3 text-4xl mb-6">
              {[1, 2, 3].map((starIdx) => (
                <span
                  key={starIdx}
                  className={`transition-all duration-500 ${
                    starIdx <= (completionData.starsEarned || 2)
                      ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110"
                      : "text-slate-700 opacity-40"
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="results-metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Accuracy</div>
                <div className="metric-value accuracy">{completionData.accuracy || 80}%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Total XP Earned</div>
                <div className="metric-value xp">+{completionData.pointsEarned || runningPoints} XP</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Coins Won</div>
                <div className="metric-value coins">🪙 {completionData.coinsEarned || 30}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Best Streak</div>
                <div className="metric-value streak">🔥 {bestStreak}x</div>
              </div>
            </div>

            {/* Detailed Question Review Drawer */}
            <div className="review-drawer-box">
              <div className="review-drawer-title">
                <span>Question Review ({quizHistory.length} Total)</span>
                <span className="text-xs font-semibold text-slate-400">
                  {quizHistory.filter((q) => q.isCorrect).length} Correct / {quizHistory.filter((q) => !q.isCorrect).length} Missed
                </span>
              </div>

              {quizHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`review-item-row ${item.isCorrect ? "correct" : "incorrect"}`}
                >
                  <div className="review-item-q">
                    Q{idx + 1}: {item.question}
                  </div>
                  <div className="review-item-answers">
                    <span className={item.isCorrect ? "text-emerald-400 font-bold" : "text-rose-400 line-through"}>
                      Your Choice: {item.userSelected || "Time Expired"}
                    </span>
                    {!item.isCorrect && (
                      <span className="text-emerald-400 font-bold">
                        Correct Answer: {item.correctAnswer}
                      </span>
                    )}
                  </div>
                  <div className="review-item-explanation">
                    💡 {item.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                id="btn-play-again"
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Mission</span>
              </button>

              <button
                id="btn-next-mission"
                onClick={() => navigate("/adventure")}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-fredoka font-bold text-base shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 flex items-center gap-2"
              >
                <span>Continue on Adventure Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: ACTIVE QUIZ ARENA
  // ========================================================
  return (
    <div className="quiz-arena-page">
      <div className="quiz-arena-inner">
        
        {/* ========================================================
            1. PLAYER HUD
            ======================================================== */}
        <div className="quiz-player-hud">
          {/* Avatar & Player Identity */}
          <div className="hud-player-profile">
            <div className="hud-avatar-circle">
              {user?.avatar === "knight" ? "⚔️" : user?.avatar === "mage" ? "🧙" : "🏹"}
            </div>
            <div className="hud-name-level">
              <span className="hud-player-name">{user?.nickname || user?.name || "Math Explorer"}</span>
              <span className="hud-level-badge">Level {user?.currentLevel || 1} Adventurer</span>
            </div>
          </div>

          {/* Running Player Stats */}
          <div className="hud-stats-group">
            <div className="hud-stat-pill coins">
              🪙 <span>{user?.totalCoins ?? 100} Coins</span>
            </div>
            <div className="hud-stat-pill stars">
              ⭐ <span>{user?.totalStars ?? 0} Stars</span>
            </div>
            <div className="hud-stat-pill streak">
              🔥 <span>{currentStreak} Streak</span>
            </div>
          </div>

          {/* Quick HUD Audio & Settings Controls */}
          <div className="hud-controls-group">
            <button
              id="btn-toggle-sound"
              onClick={toggleSound}
              className={`hud-icon-btn ${soundOn ? "active" : ""}`}
              title="Toggle Sound Effects"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="btn-toggle-music"
              onClick={toggleMusic}
              className={`hud-icon-btn ${musicOn ? "active" : ""}`}
              title="Toggle Background Music"
            >
              <Music className="w-4 h-4" />
            </button>
            <button
              id="btn-pause-quiz"
              onClick={() => setShowPauseModal(true)}
              className="hud-icon-btn"
              title="Pause Quiz / Settings"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================
            2. TOP QUEST PANEL
            ======================================================== */}
        <div className="quiz-quest-panel">
          <div className="quest-panel-header">
            {/* Realm & Mission Details */}
            <div className="quest-realm-info">
              <span className="quest-realm-icon">{realm.icon}</span>
              <div>
                <h3 className="quest-realm-title">{realm.name}</h3>
                <span className="quest-mission-sub">Mission: {realm.mission}</span>
              </div>
            </div>

            {/* Badges: Difficulty & Points */}
            <div className="quest-badges-group">
              <span className={`badge-difficulty ${currentLevel}`}>
                {currentLevel}
              </span>
              <span className="badge-points">
                ⭐ +{currentQuestion?.points || 10} XP
              </span>
              {challengeMode && (
                <div className={`quest-timer-box ${timeLeft <= 8 ? "warning" : ""}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Question Progress Bar */}
          <div className="quest-progress-track">
            <div
              className="quest-progress-fill"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="quest-progress-footer">
            <span>
              Question <strong className="quest-counter-highlight">{questionNumber}</strong> of {totalQuestions}
            </span>
            <span className="text-amber-400 font-bold">
              Current Session: +{runningPoints} pts
            </span>
          </div>
        </div>

        {/* ========================================================
            3. COMBO BANNER & POWER-UPS BAR
            ======================================================== */}
        <div className="quiz-utility-row">
          
          {/* Combo Multiplier Banner */}
          <div className="combo-banner">
            <span className="combo-flame">🔥</span>
            <span>
              Combo Multiplier: <strong className="text-white text-base">{comboMultiplier}x</strong>
            </span>
            {currentStreak > 0 && (
              <span className="text-xs opacity-75">({currentStreak} in a row!)</span>
            )}
          </div>

          {/* 4 Interactive Power-Ups */}
          <div className="powerups-bar">
            {/* Fifty-Fifty */}
            <button
              id="powerup-5050"
              onClick={handleUseFiftyFifty}
              disabled={powerups.fiftyFifty <= 0 || gameState !== "PLAYING" || eliminatedOptions.length > 0}
              className="powerup-btn"
              title="Remove 2 wrong answer choices"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>50/50</span>
              <span className="powerup-count-badge">{powerups.fiftyFifty}</span>
            </button>

            {/* Streak Shield */}
            <button
              id="powerup-shield"
              onClick={handleUseStreakShield}
              disabled={powerups.streakShield <= 0 || shieldActive}
              className={`powerup-btn ${shieldActive ? "shield-active" : ""}`}
              title="Protect your streak from one mistake"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>{shieldActive ? "Shielded!" : "Shield"}</span>
              {!shieldActive && <span className="powerup-count-badge">{powerups.streakShield}</span>}
            </button>

            {/* Hint Crystal */}
            <button
              id="powerup-hint"
              onClick={handleOpenHints}
              disabled={powerups.hintCrystal <= 0}
              className="powerup-btn"
              title="Unlock tiered conceptual hints"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>Hint</span>
              <span className="powerup-count-badge">{powerups.hintCrystal}</span>
            </button>

            {/* Time Boost */}
            {challengeMode && (
              <button
                id="powerup-time"
                onClick={handleUseTimeBoost}
                disabled={powerups.timeBoost <= 0 || gameState !== "PLAYING"}
                className="powerup-btn"
                title="Add +15 seconds to question timer"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>+15s</span>
                <span className="powerup-count-badge">{powerups.timeBoost}</span>
              </button>
            )}
          </div>

        </div>

        {/* ========================================================
            4. MAIN QUESTION CARD
            ======================================================== */}
        <div className="quiz-main-card">
          
          {/* Question Metadata Header */}
          <div className="question-meta-row">
            <span className="question-topic-tag">
              🏷️ {currentQuestion?.topic || realm.name}
            </span>

            <div className="question-hint-triggers flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowVisualizerModal(true)}
                className="btn-mini-formula bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40"
                title="Open interactive visual math manipulatives"
              >
                <span>🎨 Visual Tool</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTeachModal(true)}
                className="btn-mini-hint bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/40"
                title="Professor Pi explains this concept step-by-step"
              >
                <span>🦉 Ask Professor Pi</span>
              </button>
              <button
                onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
                className="btn-mini-formula"
                title="View formula sheet for this problem"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formula Guide</span>
              </button>
              <button
                onClick={handleOpenHints}
                className="btn-mini-hint"
                title="Open Professor Pi's Hints"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need a Hint?</span>
              </button>
            </div>
          </div>

          {/* Formula Reference (Collapsible Drawer) */}
          {showFormulaDrawer && (
            <div className="formula-reference-box">
              <h4>
                <BookOpen className="w-4 h-4" />
                <span>Formula Sheet: {currentQuestion?.topic || "Mathematics"}</span>
              </h4>
              <p>
                {currentQuestion?.topic?.toLowerCase().includes("perimeter") || currentQuestion?.question?.toLowerCase().includes("perimeter")
                  ? "Perimeter of Square = 4 × side  |  Perimeter of Rectangle = 2 × (length + width)"
                  : currentQuestion?.topic?.toLowerCase().includes("fraction")
                  ? "Adding fractions with like denominators: a/c + b/c = (a + b)/c"
                  : "Remember to simplify calculations step by step!"}
              </p>
            </div>
          )}

          {/* Main Question Text with KaTeX Rendering */}
          <h2 id="quiz-question-text" className="question-title-text">
            <MathRenderer content={currentQuestion?.question || ""} />
          </h2>

          {/* Optional Mathematical Geometry Diagram */}
          <GeometryDiagram
            diagramSvg={currentQuestion?.diagramSvg}
            topic={currentQuestion?.topic}
            questionText={currentQuestion?.question}
          />

          {/* 4 Large Interactive Answer Cards */}
          <div className="answers-grid">
            {currentQuestion?.options?.map((opt, idx) => {
              const keyNumber = idx + 1;
              const isSelected = selectedOption === opt;
              const isEliminated = eliminatedOptions.includes(opt);
              const isSubmitted = gameState === "SUBMITTED";
              const isCorrect = isSubmitted && feedback && opt === feedback.correctAnswer;
              const isIncorrect = isSubmitted && isSelected && !feedback.correct;

              let cardStateClass = "";
              if (isEliminated) cardStateClass = "eliminated";
              else if (isCorrect) cardStateClass = "correct";
              else if (isIncorrect) cardStateClass = "incorrect";
              else if (isSelected) cardStateClass = "selected";

              return (
                <button
                  key={idx}
                  id={`btn-answer-card-${keyNumber}`}
                  onClick={() => {
                    if (gameState === "PLAYING" && !isEliminated) {
                      playClickSound();
                      setSelectedOption(opt);
                    }
                  }}
                  disabled={isSubmitted || isEliminated || submitting}
                  className={`answer-card-btn ${cardStateClass}`}
                >
                  <div className="answer-card-content">
                    <span className="answer-key-pill">{keyNumber}</span>
                    <span className="answer-text-content">
                      <MathRenderer content={opt} />
                    </span>
                  </div>

                  {/* Status Indicator Icon */}
                  {isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  )}
                  {isIncorrect && (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Answer Feedback Banner */}
          {gameState === "SUBMITTED" && feedback && (
            <div
              id="quiz-feedback-box"
              className={`quiz-feedback-card ${feedback.correct ? "correct" : "incorrect"}`}
            >
              <div className="feedback-header">
                {feedback.correct ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                ) : (
                  <HelpCircle className="w-7 h-7 text-amber-300" />
                )}
                <h4 className="feedback-title">
                  {feedback.correct ? "Brilliant! Correct Solution! 🎉" : "Great Try! Here is the breakdown 💡"}
                </h4>
              </div>

              <div className="feedback-explanation">
                <MathRenderer content={feedback.explanation} />
              </div>

              {!feedback.correct && (
                <div className="text-amber-200 text-sm font-bold mb-2">
                  Correct Answer was: <strong>{feedback.correctAnswer}</strong>
                </div>
              )}

              <div className="feedback-rewards-line">
                <span className="feedback-reward-tag">
                  ⭐ +{feedback.pointsEarned} Points
                </span>
                <span className="feedback-reward-tag">
                  🔥 Streak: {currentStreak}
                </span>
                {shieldActive && !feedback.correct && (
                  <span className="feedback-reward-tag text-blue-300">
                    🛡️ Streak Shield Saved Your Combo!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Action Bar */}
          <div className="quiz-footer-actions">
            <div className="keyboard-hints-guide hidden sm:flex">
              <span>Press</span>
              <kbd className="kbd-badge">1</kbd>
              <kbd className="kbd-badge">2</kbd>
              <kbd className="kbd-badge">3</kbd>
              <kbd className="kbd-badge">4</kbd>
              <span>to choose,</span>
              <kbd className="kbd-badge">Enter ↵</kbd>
              <span>to confirm</span>
            </div>

            {gameState === "PLAYING" ? (
              <button
                id="btn-submit-answer"
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="btn-quiz-action submit ml-auto"
              >
                <span>{submitting ? "Checking..." : "Submit Answer"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-next-question"
                onClick={handleNextQuestion}
                className="btn-quiz-action next ml-auto"
              >
                <span>{isLastQuestion ? "View Victory Results 🏆" : "Continue to Next ➔"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================
          TIERED HINT MODAL (PROFESSOR PI)
          ======================================================== */}
      {showHintModal && (
        <div className="modal-overlay" onClick={() => setShowHintModal(false)}>
          <div className="hint-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hint-modal-header">
              <h3 className="hint-modal-title">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Professor Pi's Guided Hints</span>
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* 3 Tier Tabs */}
            <div className="hint-tiers-tabs">
              <button
                onClick={() => setActiveHintTier(1)}
                className={`hint-tier-pill ${unlockedHintTier >= 1 ? "unlocked" : ""} ${activeHintTier === 1 ? "active" : ""}`}
              >
                1. Concept Clue
              </button>
              <button
                onClick={() => unlockedHintTier >= 2 && setActiveHintTier(2)}
                disabled={unlockedHintTier < 2}
                className={`hint-tier-pill ${unlockedHintTier >= 2 ? "unlocked" : ""} ${activeHintTier === 2 ? "active" : ""}`}
              >
                2. Formula Step {unlockedHintTier < 2 ? "🔒" : ""}
              </button>
              <button
                onClick={() => unlockedHintTier >= 3 && setActiveHintTier(3)}
                disabled={unlockedHintTier < 3}
                className={`hint-tier-pill ${unlockedHintTier >= 3 ? "unlocked" : ""} ${activeHintTier === 3 ? "active" : ""}`}
              >
                3. Worked Model {unlockedHintTier < 3 ? "🔒" : ""}
              </button>
            </div>

            {/* Hint Content Box */}
            <div className="hint-content-box">
              <div className="hint-content-text">
                {activeHintTier === 1 && (
                  <p>
                    {currentQuestion?.hints?.clue ||
                      "Look carefully at the dimensions and what quantity is being measured."}
                  </p>
                )}
                {activeHintTier === 2 && (
                  <p>
                    {currentQuestion?.hints?.concept ||
                      "Recall the mathematical equation connecting the known measurements to the target answer."}
                  </p>
                )}
                {activeHintTier === 3 && (
                  <p>
                    {currentQuestion?.hints?.workedExample ||
                      "Break the equation down into simple steps: isolate the unknown and substitute the numbers."}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {unlockedHintTier < 3 ? (
                <button
                  onClick={handleUnlockNextHint}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-fredoka font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reveal Next Tier Hint</span>
                </button>
              ) : (
                <span className="text-xs text-amber-300 font-bold">All hints revealed!</span>
              )}

              <button
                onClick={() => setShowHintModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-fredoka font-bold text-xs"
              >
                Got It!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PAUSE & SETTINGS MODAL
          ======================================================== */}
      {showPauseModal && (
        <div className="modal-overlay" onClick={() => setShowPauseModal(false)}>
          <div className="hint-modal-card text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-fredoka text-2xl font-bold text-white mb-2">Adventure Paused</h3>
            <p className="text-sm text-slate-400 mb-6">Take a breath or adjust your game settings</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  setChallengeMode(!challengeMode);
                  setTimeLeft(30);
                }}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="font-bold text-white text-sm">Mode: {challengeMode ? "Speed Challenge (30s)" : "Practice (Untimed)"}</div>
                    <div className="text-xs text-slate-400">Toggle between timed challenge and learning pace</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${challengeMode ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                  {challengeMode ? "Timed" : "Untimed"}
                </span>
              </button>

              <button
                onClick={toggleSound}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-bold text-white text-sm">Sound Effects</div>
                    <div className="text-xs text-slate-400">Pings, clicks, victory chimes</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-white">{soundOn ? "Enabled" : "Muted"}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Mission</span>
              </button>

              <button
                onClick={() => setShowPauseModal(false)}
                className="px-7 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Resume Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACH BEFORE TESTING MODAL WITH PROFESSOR PI */}
      <TeachBeforeTestingModal
        isOpen={showTeachModal}
        onClose={() => setShowTeachModal(false)}
        onStartMission={() => setShowTeachModal(false)}
        topic={currentQuestion?.topic || realm.name || "Arithmetic"}
        missionTitle={realm.mission || "Practice Challenge"}
      />

      {/* INTERACTIVE MATH VISUALIZER MODAL */}
      {showVisualizerModal && (
        <div className="modal-overlay" onClick={() => setShowVisualizerModal(false)}>
          <div
            className="bg-slate-900 border-2 border-purple-400 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                <h3 className="text-lg font-bold text-white font-fredoka">
                  Interactive Math Lab: {currentQuestion?.topic || realm.name}
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

            <MathVisualizer type="auto" topic={currentQuestion?.topic || realm.name} />

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

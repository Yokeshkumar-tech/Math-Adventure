// client/src/pages/MultiplayerArena.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playVictorySound,
  playCoinSound,
} from "../utils/soundEffects";
import "./MultiplayerArena.css";

const PRACTICE_QUESTIONS = [
  {
    id: "pq1",
    question: "Calculate the value of: 3/4 + 1/2 in simplest fractional form.",
    options: ["4/6", "5/4", "1 and 1/4", "7/8"],
    correctAnswer: "1 and 1/4",
    topic: "Fractions",
    explanation: "3/4 + 1/2 = 3/4 + 2/4 = 5/4 = 1 and 1/4.",
  },
  {
    id: "pq2",
    question: "A book originally costs ₹400 and is on a 25% discount. What is the final sale price?",
    options: ["₹280", "₹300", "₹320", "₹350"],
    correctAnswer: "₹300",
    topic: "Percentages & Discounts",
    explanation: "25% discount of ₹400 = ₹100. Final price = ₹400 − ₹100 = ₹300.",
  },
  {
    id: "pq3",
    question: "What is the area of a right-angled triangle with base 10 cm and height 8 cm?",
    options: ["40 cm²", "80 cm²", "18 cm²", "50 cm²"],
    correctAnswer: "40 cm²",
    topic: "Geometry",
    explanation: "Area = (Base × Height) / 2 = (10 × 8) / 2 = 40 cm².",
  },
  {
    id: "pq4",
    question: "Solve the equation for x: 4x + 12 = 36.",
    options: ["x = 5", "x = 6", "x = 8", "x = 9"],
    correctAnswer: "x = 6",
    topic: "Algebra & Logic",
    explanation: "4x = 36 − 12 = 24 ⇒ x = 24 / 4 = 6.",
  },
  {
    id: "pq5",
    question: "A fair 6-sided dice is rolled. What is the probability of rolling a prime number (2, 3, or 5)?",
    options: ["1/6", "1/3", "1/2", "2/3"],
    correctAnswer: "1/2",
    topic: "Probability",
    explanation: "There are 3 prime numbers {2, 3, 5} out of 6 possible outcomes: 3/6 = 1/2 (50%).",
  },
];

export default function MultiplayerArena() {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();

  // Arena Modes: 'menu' | 'waiting' | 'countdown' | 'in_round' | 'round_summary' | 'finished' | 'practice'
  const [arenaState, setArenaState] = useState("menu");
  const [activeTab, setActiveTab] = useState("multiplayer"); // 'multiplayer' | 'practice'

  // Room State
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Question & Round State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [roundSummary, setRoundSummary] = useState(null);
  const [finalPodium, setFinalPodium] = useState(null);
  const [cheerEmoji, setCheerEmoji] = useState(null);

  // Practice Mode state
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceScore, setPracticeScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socketBase = import.meta.env.VITE_SOCKET_URL || 
      (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");
    const socket = io(socketBase, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("room_created", ({ roomCode, room, you }) => {
      setRoomCode(roomCode);
      setIsHost(true);
      setIsReady(true);
      setParticipants(room.participants || [you]);
      setArenaState("waiting");
    });

    socket.on("room_joined", ({ roomCode, room, you }) => {
      setRoomCode(roomCode);
      setIsHost(false);
      setIsReady(false);
      setParticipants(room.participants || [you]);
      setArenaState("waiting");
    });

    socket.on("participant_update", ({ participants }) => {
      setParticipants(participants);
    });

    socket.on("match_countdown", ({ countdown }) => {
      setCountdown(countdown);
      setArenaState("countdown");
    });

    socket.on("round_started", ({ question, roundNumber, totalRounds, timeLeft, participants }) => {
      setCurrentQuestion(question);
      setRoundNumber(roundNumber);
      setTotalRounds(totalRounds);
      setTimeLeft(timeLeft);
      setSelectedAnswer(null);
      setFeedback(null);
      setRoundSummary(null);
      if (participants) setParticipants(participants);
      setArenaState("in_round");
    });

    socket.on("timer_tick", ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    socket.on("answer_feedback", (data) => {
      setFeedback(data);
      if (data.isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    });

    socket.on("live_scores", ({ participants }) => {
      setParticipants(participants);
    });

    socket.on("round_ended", ({ correctAnswer, explanation, leaderboard }) => {
      setRoundSummary({ correctAnswer, explanation });
      setParticipants(leaderboard);
      setArenaState("round_summary");
    });

    socket.on("match_finished", ({ winner, leaderboard, roomCode }) => {
      setFinalPodium({ winner, leaderboard, roomCode });
      setArenaState("finished");
      playVictorySound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      // Find user rewards
      const myResult = leaderboard.find((p) => p.id === user?._id || p.id === user?.id);
      if (myResult && setUser) {
        setUser((prev) => ({
          ...prev,
          totalCoins: (prev?.totalCoins || 0) + (myResult.rewardCoins || 20),
          totalXP: (prev?.totalXP || 0) + (myResult.rewardXp || 25),
          totalStars: (prev?.totalStars || 0) + (myResult.rewardStars || 0),
        }));
      }
    });

    socket.on("player_cheer", ({ senderName, emoji }) => {
      setCheerEmoji(`${senderName}: ${emoji}`);
      setTimeout(() => setCheerEmoji(null), 2500);
    });

    socket.on("error_message", ({ message }) => {
      alert(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleCreateRoom = () => {
    playClickSound();
    socketRef.current?.emit("create_room", { user, totalRounds: 5 });
  };

  const handleJoinRoom = () => {
    if (!roomCodeInput.trim()) return;
    playClickSound();
    socketRef.current?.emit("join_room", { roomCode: roomCodeInput.trim(), user });
  };

  const handleToggleReady = () => {
    playClickSound();
    setIsReady(!isReady);
    socketRef.current?.emit("toggle_ready");
  };

  const handleStartMatch = () => {
    playClickSound();
    socketRef.current?.emit("start_match");
  };

  const handleSelectAnswer = (opt) => {
    if (selectedAnswer !== null || feedback) return;
    playClickSound();
    setSelectedAnswer(opt);
    socketRef.current?.emit("submit_answer", { answer: opt });
  };

  const handleSendCheer = (emoji) => {
    socketRef.current?.emit("send_cheer", { emoji });
  };

  // Single-player practice handlers
  const handleStartPractice = () => {
    playClickSound();
    setPracticeIndex(0);
    setPracticeScore(0);
    setBotScore(0);
    setPracticeFeedback(null);
    setArenaState("practice");
  };

  const handleSelectPracticeAnswer = (opt) => {
    if (practiceFeedback) return;
    const currentQ = PRACTICE_QUESTIONS[practiceIndex];
    const isCorrect = opt === currentQ.correctAnswer;

    if (isCorrect) {
      playCorrectSound();
      setPracticeScore((prev) => prev + 120);
    } else {
      playWrongSound();
    }

    // Bot randomly scores 70% of the time
    if (Math.random() < 0.75) {
      setBotScore((prev) => prev + Math.floor(Math.random() * 40 + 80));
    }

    setPracticeFeedback({
      isCorrect,
      correctAnswer: currentQ.correctAnswer,
      explanation: currentQ.explanation,
    });
  };

  const handleNextPracticeQuestion = () => {
    playClickSound();
    setPracticeFeedback(null);
    if (practiceIndex + 1 < PRACTICE_QUESTIONS.length) {
      setPracticeIndex((prev) => prev + 1);
    } else {
      // Finished practice
      playVictorySound();
      confetti({ particleCount: 80, spread: 60 });
      alert(`Practice Match Complete! Your Score: ${practiceScore} pts vs MathBot Neo: ${botScore} pts`);
      setArenaState("menu");
    }
  };

  return (
    <div className="arena-page">
      {/* Top Header */}
      <header className="arena-header">
        <div className="arena-nav-row">
          <button
            type="button"
            className="arena-back-btn"
            onClick={() => {
              playClickSound();
              navigate("/map");
            }}
          >
            ← Return to Adventure Map
          </button>

          <div className="arena-badge-live">
            <span className="live-pulse-dot" />
            <span>Multiplayer Arena • Server Synchronized</span>
          </div>
        </div>

        <div className="arena-hero-title">
          <h1>⚔️ Mathematical Challenge Arena</h1>
          <p>
            Compete live against friends and classmates in timed arithmetic and problem-solving duels!
            Earn championship trophies, bonus coins, and climb the royal leaderboards.
          </p>
        </div>
      </header>

      {/* Cheer Emoji Bubble */}
      {cheerEmoji && (
        <div className="fixed top-24 right-8 bg-slate-900 border-2 border-amber-400 px-4 py-2 rounded-2xl shadow-2xl text-amber-300 font-bold text-sm z-50 animate-bounce">
          {cheerEmoji}
        </div>
      )}

      <main className="arena-main">
        {/* VIEW 1: LOBBY & MENU */}
        {arenaState === "menu" && (
          <div className="arena-lobby-card">
            <div className="flex gap-4 border-b border-slate-700/60 pb-4 mb-6">
              <button
                type="button"
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "multiplayer" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("multiplayer")}
              >
                👥 Live Multiplayer Room
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === "practice" ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("practice")}
              >
                🤖 Practice vs MathBot Neo (Solo)
              </button>
            </div>

            {activeTab === "multiplayer" ? (
              <div className="arena-modes-row">
                {/* Create Room */}
                <div className="arena-action-card">
                  <div className="text-3xl">👑</div>
                  <h3>Host a Challenge Room</h3>
                  <p>
                    Create a private match room, invite your friends with a 6-digit code, and battle
                    across 5 synchronized math rounds!
                  </p>
                  <button type="button" className="arena-primary-btn" onClick={handleCreateRoom}>
                    Create Challenge Room
                  </button>
                </div>

                {/* Join Room */}
                <div className="arena-action-card">
                  <div className="text-3xl">🔑</div>
                  <h3>Join with Room Code</h3>
                  <p>Enter the code shared by your friend or teacher to enter the challenge arena!</p>
                  <input
                    type="text"
                    placeholder="e.g. MATH-4X8B"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    className="arena-input-code"
                  />
                  <button
                    type="button"
                    className="arena-gold-btn"
                    disabled={!roomCodeInput.trim()}
                    onClick={handleJoinRoom}
                  >
                    Enter Room ➔
                  </button>
                </div>
              </div>
            ) : (
              /* Practice Mode Tab */
              <div className="arena-action-card max-w-xl mx-auto text-center">
                <div className="text-4xl">🤖</div>
                <h3>Solo Training: Practice Arena</h3>
                <p>
                  Test your calculation speed and accuracy against MathBot Neo before challenging live opponents!
                  5 rounds with real-time score tracking.
                </p>
                <button type="button" className="arena-gold-btn mt-4" onClick={handleStartPractice}>
                  Start Solo Practice Match ⚔️
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ROOM WAITING LOBBY */}
        {arenaState === "waiting" && (
          <div className="arena-lobby-card room-lobby-stage">
            <div className="room-meta-banner">
              <div className="room-code-tag">
                <span className="text-slate-300 font-bold text-sm">Room Code:</span>
                <span className="room-code-val">{roomCode}</span>
                <button
                  type="button"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 rounded-lg font-bold border border-slate-700"
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    alert(`Room code ${roomCode} copied to clipboard!`);
                  }}
                >
                  📋 Copy Code
                </button>
              </div>

              <div className="flex gap-2">
                {["🎉", "🔥", "⚡", "💪", "🏆"].map((e) => (
                  <button
                    key={e}
                    type="button"
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-lg"
                    onClick={() => handleSendCheer(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="font-bold text-slate-300 text-lg">
              Participants ({participants.length}/8 Ready)
            </h3>

            <div className="room-participants-grid">
              {participants.map((p) => (
                <div key={p.socketId || p.id} className={`room-participant-card ${p.isReady ? "ready" : ""}`}>
                  <CharacterSprite
                    characterId={p.avatar || "knight"}
                    costume={p.costume || "default"}
                    accessory={p.accessory || "none"}
                    pet={p.pet || "none"}
                    size="md"
                    showName={true}
                    nickname={p.name}
                    level={p.level || 1}
                  />
                  <div
                    className={`participant-ready-badge ${p.isReady ? "is-ready" : "not-ready"}`}
                  >
                    {p.isReady ? "Ready to Duel ✓" : "Preparing..."}
                  </div>
                  {p.isHost && <span className="text-xs text-amber-400 font-bold">Room Host 👑</span>}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
              <button
                type="button"
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isReady ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
                onClick={handleToggleReady}
              >
                {isReady ? "✓ Ready Status Set" : "Click When Ready"}
              </button>

              {isHost && (
                <button
                  type="button"
                  className="arena-gold-btn px-8"
                  onClick={handleStartMatch}
                  disabled={participants.length === 0}
                >
                  ⚔️ Start Match Countdown!
                </button>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: MATCH COUNTDOWN */}
        {arenaState === "countdown" && (
          <div className="arena-lobby-card arena-countdown-overlay">
            <h2 className="text-2xl font-bold text-slate-300 mb-2">Synchronizing Contestants...</h2>
            <div className="countdown-giant-number">{countdown}</div>
            <p className="text-slate-400 font-semibold mt-2">Get ready to calculate!</p>
          </div>
        )}

        {/* VIEW 4 & 5: IN ROUND & ROUND SUMMARY */}
        {(arenaState === "in_round" || arenaState === "round_summary") && currentQuestion && (
          <div className="arena-match-grid">
            {/* Left Question Pane */}
            <div className="arena-question-card">
              <div className="arena-round-top">
                <span className="font-extrabold text-amber-400">
                  Round {roundNumber} of {totalRounds} • {currentQuestion.topic}
                </span>

                <div className={`arena-timer-pill ${timeLeft <= 5 ? "urgent" : ""}`}>
                  <span>⏱️</span>
                  <span>{timeLeft}s</span>
                </div>
              </div>

              <h2 className="arena-q-title">{currentQuestion.question}</h2>

              {/* Options */}
              <div className="arena-options-grid">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`arena-opt-btn ${isSelected ? "chosen" : ""}`}
                      disabled={selectedAnswer !== null || arenaState === "round_summary"}
                      onClick={() => handleSelectAnswer(opt)}
                    >
                      <span>{opt}</span>
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Feedback box */}
              {feedback && (
                <div
                  className={`p-4 rounded-xl border font-bold text-sm ${
                    feedback.isCorrect
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500 text-rose-300"
                  }`}
                >
                  {feedback.isCorrect ? (
                    <div>
                      🎉 Correct! +{feedback.pointsEarned} Points (Streak: {feedback.streak}🔥)
                    </div>
                  ) : (
                    <div>❌ Incorrect! Streak reset.</div>
                  )}
                </div>
              )}

              {/* Round Summary Card */}
              {arenaState === "round_summary" && roundSummary && (
                <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-300">
                  <div className="font-bold text-amber-400 text-sm mb-1">
                    Correct Answer: {roundSummary.correctAnswer}
                  </div>
                  <p>{roundSummary.explanation}</p>
                  <div className="text-right text-slate-400 mt-2 font-bold">Next round starting in 3s...</div>
                </div>
              )}
            </div>

            {/* Right Live Scoreboard */}
            <aside className="arena-scoreboard-sidebar">
              <h3 className="arena-scoreboard-title">
                <span>🏆 Live Arena Scoreboard</span>
              </h3>

              <div className="scoreboard-list">
                {participants.map((p, idx) => {
                  const isMe = p.socketId === socketRef.current?.id || p.id === user?._id;
                  return (
                    <div key={p.socketId || p.id} className={`scoreboard-item-row ${isMe ? "is-me" : ""}`}>
                      <span className={`scoreboard-rank rank-${idx + 1}`}>#{idx + 1}</span>
                      <div className="scoreboard-user-info">
                        <div>{p.name} {isMe ? "(You)" : ""}</div>
                        {p.streak > 1 && <span className="text-xs text-orange-400 font-bold">{p.streak}🔥 Streak</span>}
                      </div>
                      <div className="scoreboard-score-val">{p.score} pts</div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 6: PRACTICE MODE SCREEN */}
        {arenaState === "practice" && (
          <div className="arena-match-grid">
            <div className="arena-question-card">
              <div className="arena-round-top">
                <span className="font-extrabold text-amber-400">
                  Practice Round {practiceIndex + 1} of {PRACTICE_QUESTIONS.length}
                </span>
                <span className="text-xs text-slate-400 font-bold">Practice Mode (No Timer Limit)</span>
              </div>

              <h2 className="arena-q-title">{PRACTICE_QUESTIONS[practiceIndex].question}</h2>

              <div className="arena-options-grid">
                {PRACTICE_QUESTIONS[practiceIndex].options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="arena-opt-btn"
                    disabled={practiceFeedback !== null}
                    onClick={() => handleSelectPracticeAnswer(opt)}
                  >
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              {practiceFeedback && (
                <div
                  className={`p-4 rounded-xl border font-bold text-sm ${
                    practiceFeedback.isCorrect
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500 text-rose-300"
                  }`}
                >
                  <div>{practiceFeedback.isCorrect ? "🎉 Great Answer!" : "❌ Keep Practicing!"}</div>
                  <p className="mt-1 text-xs text-slate-300 font-normal">{practiceFeedback.explanation}</p>
                  <button
                    type="button"
                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                    onClick={handleNextPracticeQuestion}
                  >
                    Next Practice Question ➔
                  </button>
                </div>
              )}
            </div>

            <aside className="arena-scoreboard-sidebar">
              <h3 className="arena-scoreboard-title">⚔️ Duel Scoreboard</h3>
              <div className="scoreboard-item-row is-me">
                <span className="scoreboard-rank rank-1">#1</span>
                <div className="scoreboard-user-info">You ({user?.name || "Hero"})</div>
                <div className="scoreboard-score-val">{practiceScore} pts</div>
              </div>
              <div className="scoreboard-item-row">
                <span className="scoreboard-rank rank-2">#2</span>
                <div className="scoreboard-user-info">MathBot Neo (AI Rival)</div>
                <div className="scoreboard-score-val">{botScore} pts</div>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 7: FINAL PODIUM */}
        {arenaState === "finished" && finalPodium && (
          <div className="arena-podium-card">
            <h1 className="text-3xl font-extrabold text-amber-400">👑 MATCH CEREMONY COMPLETE!</h1>
            <p className="text-slate-300 mt-1">Room Code: {finalPodium.roomCode}</p>

            <div className="podium-winner-hero">
              <CharacterSprite
                characterId={finalPodium.winner?.avatar || "knight"}
                costume={finalPodium.winner?.costume || "default"}
                accessory={finalPodium.winner?.accessory || "none"}
                pet={finalPodium.winner?.pet || "none"}
                size="xl"
                showName={true}
                nickname={finalPodium.winner?.name || "Champion"}
                level={finalPodium.winner?.level || 1}
              />
              <div className="text-xl font-bold text-amber-300 mt-2">
                Champion: {finalPodium.winner?.name}! ({finalPodium.winner?.score} Points)
              </div>
            </div>

            <div className="podium-rewards-row">
              <div className="podium-chip">🪙 +80 Coins Awarded</div>
              <div className="podium-chip">⚡ +50 XP Awarded</div>
              <div className="podium-chip">⭐ +1 Champion Star</div>
            </div>

            <div className="max-w-md mx-auto my-4 space-y-2">
              {finalPodium.leaderboard.map((p, idx) => (
                <div key={p.socketId || p.id} className="scoreboard-item-row">
                  <span className={`scoreboard-rank rank-${idx + 1}`}>#{idx + 1}</span>
                  <div className="scoreboard-user-info">{p.name}</div>
                  <div className="scoreboard-score-val">{p.score} pts</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="arena-gold-btn px-8 mt-4"
              onClick={() => {
                playClickSound();
                setArenaState("menu");
                setRoomCode("");
                setParticipants([]);
              }}
            >
              Return to Arena Hub
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

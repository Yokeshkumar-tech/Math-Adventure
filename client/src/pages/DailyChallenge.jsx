// client/src/pages/DailyChallenge.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  playClickSound,
  playCorrectSound,
  playVictorySound,
  playCoinSound,
} from "../utils/soundEffects";
import GeometryDiagram from "../components/game/GeometryDiagram";

export default function DailyChallenge() {
  const { user, token, setUser } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedAnswer }
  const [completedToday, setCompletedToday] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDailyChallenge();
  }, [token]);

  const fetchDailyChallenge = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/challenges/daily", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load daily challenge.");

      setChallenge(data.challenge);
      setQuestions(data.questions || []);
      setCompletedToday(data.completedToday);
    } catch (err) {
      setError(err.message || "Could not retrieve today's challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, option) => {
    playClickSound();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitChallenge = async () => {
    if (submitting) return;

    // Verify all questions are answered
    const unanswered = questions.filter((q) => !answers[q._id || q.id]);
    if (unanswered.length > 0) {
      setError("Please answer all 3 questions before submitting your challenge!");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const answersPayload = questions.map((q) => ({
        questionId: q._id || q.id,
        selectedAnswer: answers[q._id || q.id],
      }));

      const res = await fetch("http://localhost:5000/api/challenges/daily/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error submitting challenge.");

      playVictorySound();
      playCoinSound();
      setResults(data);
      setCompletedToday(true);

      // Update auth user coins, streak, stars, XP
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          totalCoins: data.totalCoins ?? ((prev?.totalCoins || 0) + (data.coinsEarned || 50)),
          totalStars: data.totalStars ?? ((prev?.totalStars || 0) + (data.starsEarned || 1)),
          totalXP: data.totalXP ?? ((prev?.totalXP || 0) + (data.xpEarned || 30)),
          streak: data.currentStreak ?? ((prev?.streak || 0) + 1),
        }));
      }
    } catch (err) {
      setError(err.message || "Could not complete daily challenge.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
              🔥
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Daily Quest • {challenge?.dateString}
              </span>
              <h1 className="text-2xl font-black text-white">Daily Mathematics Challenge</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Streak</span>
                <strong className="text-amber-400 font-extrabold">
                  {results ? results.currentStreak : user?.streak || 1} Days
                </strong>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Reward</span>
                <strong className="text-emerald-400 font-extrabold">+50 🪙</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 7-DAY STREAK CALENDAR & REWARD ROADMAP */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 mb-8 backdrop-blur-md shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>🗓️ 7-Day Streak Rewards Calendar</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                Active Streak: {user?.streak || user?.currentStreak || 1} Days
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Resets daily at midnight IST</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {[
              { day: 1, reward: "20 🪙", icon: "🪙" },
              { day: 2, reward: "30 🪙", icon: "🪙" },
              { day: 3, reward: "40 🪙", icon: "🪙" },
              { day: 4, reward: "50 🪙", icon: "⚡" },
              { day: 5, reward: "60 🪙", icon: "🪙" },
              { day: 6, reward: "80 🪙", icon: "⚡" },
              { day: 7, reward: "100 🪙 + ⭐", icon: "👑" },
            ].map((d) => {
              const currentStreak = user?.streak || user?.currentStreak || 1;
              const isPastOrToday = ((currentStreak - 1) % 7) + 1 >= d.day;
              const isToday = ((currentStreak - 1) % 7) + 1 === d.day;
              return (
                <div
                  key={d.day}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isToday
                      ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 scale-105"
                      : isPastOrToday
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-800/40 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-1">Day {d.day}</span>
                  <span className="text-xl block my-0.5">{d.icon}</span>
                  <span className="text-[10px] font-extrabold block truncate">{d.reward}</span>
                  {isPastOrToday && <span className="text-[10px] text-emerald-400 font-bold block">✓ Done</span>}
                </div>
              );
            })}
          </div>

          {/* Daily Quests Multi-Tracker */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>🎯 Solve 5 Math Questions</span>
                <span className="text-emerald-400">3/5</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>🛒 Complete 1 Real-World Task</span>
                <span className="text-indigo-400">1/1 ✓</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <div className="flex justify-between font-bold text-slate-200 mb-1">
                <span>💡 Answer 3 without hints</span>
                <span className="text-amber-400">2/3</span>
              </div>
              <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "66%" }} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p>Loading today's mathematics challenge...</p>
          </div>
        ) : completedToday && !results ? (
          /* Already Completed Banner */
          <div className="bg-slate-900/90 border border-emerald-500/50 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-emerald-400 mb-2">
              Today's Challenge Completed!
            </h2>
            <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm leading-relaxed">
              You've already solved today's daily mathematics questions and claimed your 50 Coins, 30 XP, and +1 Streak! Come back tomorrow for brand new challenges.
            </p>

            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-6 py-3 rounded-2xl font-bold mb-8">
              🔥 Current Learning Streak: {user?.streak || 1} Consecutive Days!
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to="/map"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg"
              >
                🗺️ Continue Adventure Map
              </Link>
              <Link
                to="/revision"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
              >
                📚 Practice in Revision Center
              </Link>
            </div>
          </div>
        ) : results ? (
          /* Completion Summary Screen */
          <div className="bg-slate-900/90 border border-amber-500/50 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="text-6xl mb-3 animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-amber-400 mb-1">Challenge Accomplished!</h2>
            <p className="text-slate-300 text-sm mb-6">
              Score: <strong>{results.score} / {results.totalQuestions}</strong> Correct!
            </p>

            {/* Rewards Won */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center">
                <span className="text-2xl">🪙</span>
                <strong className="block text-amber-400 text-lg font-black mt-1">
                  +{results.coinsEarned}
                </strong>
                <span className="text-xs text-slate-400">Coins</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center">
                <span className="text-2xl">⚡</span>
                <strong className="block text-purple-400 text-lg font-black mt-1">
                  +{results.xpEarned}
                </strong>
                <span className="text-xs text-slate-400">XP</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center">
                <span className="text-2xl">🔥</span>
                <strong className="block text-red-400 text-lg font-black mt-1">
                  {results.currentStreak} Days
                </strong>
                <span className="text-xs text-slate-400">Streak</span>
              </div>
            </div>

            {/* Answer Explanations Review */}
            <div className="text-left mb-8 space-y-4">
              <h3 className="font-bold text-white text-base">Question Review & Explanations:</h3>
              {results.results?.map((res, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border ${
                    res.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/40"
                      : "bg-red-500/10 border-red-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{res.isCorrect ? "✅" : "❌"}</span>
                    <strong className="text-sm text-white">Question {i + 1}</strong>
                    {!res.isCorrect && (
                      <span className="text-xs text-amber-300 ml-auto font-bold">
                        Correct: {res.correctAnswer}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{res.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to="/map"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg"
              >
                🗺️ Return to Adventure Map
              </Link>
            </div>
          </div>
        ) : (
          /* Active Challenge Step View */
          <div className="space-y-6">
            {/* Step navigation tabs */}
            <div className="flex gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = Boolean(answers[q._id || q.id]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCurrentIndex(idx);
                    }}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm border transition flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-md"
                        : isAnswered
                        ? "bg-slate-800 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span>{isAnswered ? "✓" : idx + 1}</span>
                    <span>Question {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Current Question Card */}
            {currentQ && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-sky-300 px-3 py-1 rounded-full border border-slate-700">
                    {currentQ.topic}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                {/* Geometry Diagram if geometric */}
                <GeometryDiagram
                  diagramSvg={currentQ.diagramSvg}
                  topic={currentQ.topic}
                  questionText={currentQ.questionText || currentQ.question}
                />

                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-4 mb-6 leading-relaxed">
                  {currentQ.questionText || currentQ.question}
                </h3>

                {/* Options / Input */}
                {currentQ.options && currentQ.options.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {currentQ.options.map((opt, i) => {
                      const isSelected = answers[currentQ._id || currentQ.id] === opt;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectOption(currentQ._id || currentQ.id, opt)}
                          className={`p-4 rounded-2xl border text-left font-semibold text-base transition flex items-center gap-3 ${
                            isSelected
                              ? "bg-amber-500/20 border-amber-500 text-amber-200 shadow-lg ring-1 ring-amber-500"
                              : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isSelected
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {["A", "B", "C", "D"][i]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mb-8">
                    <input
                      type="text"
                      placeholder="Type your numerical answer..."
                      value={answers[currentQ._id || currentQ.id] || ""}
                      onChange={(e) => handleSelectOption(currentQ._id || currentQ.id, e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold text-lg focus:border-amber-500 outline-none"
                    />
                  </div>
                )}

                {/* Stepper Controls */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => {
                      playClickSound();
                      setCurrentIndex((prev) => Math.max(0, prev - 1));
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-sm border border-slate-700 transition"
                  >
                    ⬅️ Previous
                  </button>

                  {currentIndex + 1 < questions.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setCurrentIndex((prev) => prev + 1);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-md"
                    >
                      Next Question ➡️
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleSubmitChallenge}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-xl transition transform hover:-translate-y-0.5"
                    >
                      {submitting ? "Casting Answers..." : "⚔️ Submit Daily Quest"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

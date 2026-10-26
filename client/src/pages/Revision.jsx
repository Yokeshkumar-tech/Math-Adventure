// client/src/pages/Revision.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playCoinSound,
  playVictorySound,
} from "../utils/soundEffects";
import GeometryDiagram from "../components/game/GeometryDiagram";
import { API_BASE_URL } from "../services/api";

export default function Revision() {
  const { token, setUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [masteredCount, setMasteredCount] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);

  useEffect(() => {
    fetchRevisionQuestions();
  }, [token]);

  const fetchRevisionQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/revision`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load revision questions.");

      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setMasteredCount(0);
      setTotalCoinsEarned(0);
      setFeedback(null);
      setSelectedAnswer("");
    } catch (err) {
      setError(err.message || "Could not retrieve revision questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer.trim() || submitting || feedback) return;

    const currentQ = questions[currentIndex];
    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/revision/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId: currentQ._id || currentQ.id,
          selectedAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error validating answer.");

      if (data.isCorrect) {
        playCorrectSound();
        playCoinSound();
        setMasteredCount((prev) => prev + 1);
        setTotalCoinsEarned((prev) => prev + (data.coinsAwarded || 10));

        if (setUser) {
          setUser((prev) => ({
            ...prev,
            totalCoins: (prev?.totalCoins || 0) + (data.coinsAwarded || 10),
            totalXP: (prev?.totalXP || 0) + (data.xpAwarded || 5),
          }));
        }
      } else {
        playWrongSound();
      }

      setFeedback(data);
    } catch (err) {
      setError(err.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    playClickSound();
    setFeedback(null);
    setSelectedAnswer("");
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      playVictorySound();
      setCurrentIndex(questions.length); // trigger completion screen
    }
  };

  const currentQ = questions[currentIndex];
  const isFinished = currentIndex >= questions.length && questions.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-3xl shadow-inner">
              📖
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Practice & Mastery
              </span>
              <h1 className="text-2xl font-black text-white">Revision Center</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Mastered</span>
                <strong className="text-amber-400 font-extrabold">{masteredCount}</strong>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Earned</span>
                <strong className="text-amber-400 font-extrabold">+{totalCoinsEarned}</strong>
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
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p>Gathering your revision questions...</p>
          </div>
        ) : isFinished ? (
          /* Completion Screen */
          <div className="bg-slate-900/90 border border-indigo-500/50 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-3xl font-black text-indigo-400 mb-2">Revision Complete!</h2>
            <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm leading-relaxed">
              Fantastic work reviewing! You mastered <strong>{masteredCount}</strong> of{" "}
              {questions.length} questions and collected <strong>+{totalCoinsEarned} Coins</strong>.
            </p>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={fetchRevisionQuestions}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg"
              >
                🔄 Practice More Questions
              </button>
              <Link
                to="/map"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition"
              >
                🗺️ Return to Adventure Map
              </Link>
            </div>
          </div>
        ) : currentQ ? (
          /* Active Question Card */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-sky-300 px-3 py-1 rounded-full border border-slate-700">
                {currentQ.topic}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Geometry Diagram if applicable */}
            <GeometryDiagram
              diagramSvg={currentQ.diagramSvg}
              topic={currentQ.topic}
              questionText={currentQ.questionText || currentQ.question}
            />

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-4 mb-6 leading-relaxed">
              {currentQ.questionText || currentQ.question}
            </h3>

            {/* Options or text input */}
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={feedback !== null || submitting}
                      onClick={() => {
                        playClickSound();
                        setSelectedAnswer(opt);
                      }}
                      className={`p-4 rounded-2xl border text-left font-semibold text-base transition flex items-center gap-3 ${
                        isSelected
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-lg ring-1 ring-indigo-500"
                          : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? "bg-indigo-500 text-white"
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
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  disabled={feedback !== null || submitting}
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-white font-bold text-lg focus:border-indigo-500 outline-none"
                />
              </div>
            )}

            {/* Submit or Feedback */}
            {!feedback ? (
              <button
                type="button"
                disabled={!selectedAnswer.trim() || submitting}
                onClick={handleSubmitAnswer}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 text-white font-bold text-base shadow-xl transition"
              >
                {submitting ? "Checking..." : "⚡ Check Answer"}
              </button>
            ) : (
              <div
                className={`p-5 rounded-2xl border ${
                  feedback.isCorrect
                    ? "bg-emerald-500/15 border-emerald-500"
                    : "bg-red-500/15 border-red-500"
                } flex flex-col gap-4 animate-fadeIn`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{feedback.isCorrect ? "🎉" : "💡"}</span>
                    <strong className="text-base text-white">
                      {feedback.isCorrect ? "Correct! Concept Mastered!" : "Not quite yet!"}
                    </strong>
                    {feedback.isCorrect && (
                      <span className="ml-auto text-xs font-black text-amber-300">
                        +10 🪙 Coins • +5 ⚡ XP
                      </span>
                    )}
                  </div>
                  {!feedback.isCorrect && feedback.correctAnswer && (
                    <p className="text-xs font-bold text-amber-300 mb-1">
                      Correct Answer: {feedback.correctAnswer}
                    </p>
                  )}
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {feedback.explanation}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition"
                  >
                    {currentIndex + 1 < questions.length ? "Next Question ➡️" : "Finish Revision 🎓"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            No revision questions found right now. You are doing fantastic!
          </div>
        )}
      </div>
    </div>
  );
}

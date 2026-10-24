// client/src/pages/Results.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import confetti from "canvas-confetti";
import Loader from "../components/Loader.jsx";
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";

export default function Results() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [newBadges, setNewBadges] = useState(location.state?.newBadges || []);
  const [recommendation, setRecommendation] = useState(location.state?.recommendation || null);
  const [loading, setLoading] = useState(!attempt);

  useEffect(() => {
    // Fire confetti for celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    if (!attempt) {
      async function fetchAttempt() {
        try {
          const res = await api.get("/progress");
          const found = (res.data.recentAttempts || []).find((a) => a.id === attemptId);
          if (found) {
            setAttempt(found);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      fetchAttempt();
    }
  }, [attemptId]);

  if (loading) {
    return <Loader message="Compiling your score report..." />;
  }

  const accuracy = attempt?.accuracy || 0;
  const correct = attempt?.correctAnswers || 0;
  const total = attempt?.totalQuestions || 10;
  const wrong = total - correct;
  const points = attempt?.pointsEarned || 0;
  const starsEarned = attempt?.starsEarned ?? (accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1);
  const coinsEarned = attempt?.coinsEarned ?? (points > 0 ? Math.floor(points / 3) + 15 : 20);
  const [showReview, setShowReview] = useState(false);
  const historyList = attempt?.history || location.state?.history || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-center">
      
      {/* Trophy and Header */}
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-300 animate-bounce-gentle">
          🏆
        </div>
        <h1 className="font-fredoka text-3xl sm:text-5xl font-bold text-slate-900">
          Adventure Mission Completed!
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Awesome work tackling <strong>{attempt?.topic || "Math"}</strong> challenges today!
        </p>

        {/* Stars Earned Rating */}
        <div className="flex items-center justify-center gap-2 pt-2 text-3xl">
          {[1, 2, 3].map((starIdx) => (
            <span
              key={starIdx}
              className={`transition-all duration-500 ${
                starIdx <= starsEarned
                  ? "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] scale-110"
                  : "text-slate-300 opacity-40"
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Accuracy */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Accuracy</span>
          <div className="font-fredoka text-3xl font-bold text-emerald-600 mt-1">
            {accuracy}%
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {accuracy >= 80 ? "Mastery reached! 🌟" : "Keep going!"}
          </span>
        </div>

        {/* Correct Answers */}
        <div className="bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Questions Solved</span>
          <div className="font-fredoka text-3xl font-bold text-indigo-600 mt-1">
            {correct} <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{wrong} need review</span>
        </div>

        {/* Points & XP */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">XP & Stars</span>
          <div className="font-fredoka text-3xl font-bold text-amber-600 mt-1">
            +{points} XP
          </div>
          <span className="text-[11px] text-amber-700 font-bold">⭐ {starsEarned} Stars Earned</span>
        </div>

        {/* Coins Won */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Coins Awarded</span>
          <div className="font-fredoka text-3xl font-bold text-purple-600 mt-1">
            🪙 +{coinsEarned}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Banked to Profile</span>
        </div>

      </div>

      {/* Topics Understood Well vs Practice Again */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-5">
          <h4 className="font-fredoka font-bold text-emerald-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Topics Understood Well</span>
          </h4>
          <p className="text-xs text-emerald-700 mt-1">
            {accuracy >= 70
              ? `Strong grasp of ${attempt?.topic || "Arithmetic"} foundations and step-by-step logic!`
              : `Solid effort on first-step recognition and mathematical calculation!`}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            ✓ {attempt?.topic || "Foundational Math"} Mastery
          </div>
        </div>

        <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-5">
          <h4 className="font-fredoka font-bold text-amber-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Topics to Practice Again</span>
          </h4>
          <p className="text-xs text-amber-700 mt-1">
            {wrong > 0
              ? `Review the ${wrong} missed questions or use Professor Pi's visual manipulatives to build confidence.`
              : `No weak spots found! You aced this trial—ready for harder missions or boss battles!`}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            {wrong > 0 ? `Target: Multi-step calculations` : `Ready for Challenger Mode`}
          </div>
        </div>
      </div>

      {/* Difficulty Progression Timeline */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-left shadow-xs space-y-3">
        <h3 className="font-fredoka text-lg font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Difficulty Progression Timeline</span>
        </h3>
        <p className="text-xs text-slate-500">
          See how your questions adapted dynamically based on your consecutive answers:
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          {progression.map((lvl, idx) => {
            const colors = {
              easy: "bg-emerald-100 text-emerald-800 border-emerald-300",
              medium: "bg-amber-100 text-amber-800 border-amber-300",
              hard: "bg-rose-100 text-rose-800 border-rose-300",
            };
            return (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase ${colors[lvl] || colors.easy}`}
              >
                Q{idx + 1}: {lvl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlocked Badges Celebration */}
      {newBadges && newBadges.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-300 shadow-sm text-left">
          <h3 className="font-fredoka text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Newly Unlocked Badges!</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newBadges.map((badge) => (
              <div
                key={badge._id || badge.key}
                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-amber-200 shadow-xs"
              >
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <h4 className="font-fredoka font-bold text-slate-800 text-sm">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-slate-600">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Question Review Drawer */}
      {historyList.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 text-left shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Step-by-Step Answer Review ({historyList.length} Questions)</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowReview(!showReview)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-lg bg-indigo-50"
            >
              {showReview ? "Hide Details ▲" : "Review Answers ▼"}
            </button>
          </div>

          {showReview && (
            <div className="space-y-3 pt-2">
              {historyList.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    item.isCorrect
                      ? "bg-emerald-50/60 border-emerald-200"
                      : "bg-rose-50/60 border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">Question {idx + 1}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isCorrect
                          ? "bg-emerald-200 text-emerald-900"
                          : "bg-rose-200 text-rose-900"
                      }`}
                    >
                      {item.isCorrect ? "Correct ✓" : "Needs Review ✗"}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 mt-1">{item.question}</p>
                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <div>
                      Your Choice:{" "}
                      <strong className={item.isCorrect ? "text-emerald-700" : "text-rose-600"}>
                        {item.userSelected || "None"}
                      </strong>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        Correct Answer:{" "}
                        <strong className="text-emerald-700">{item.correctAnswer}</strong>
                      </div>
                    )}
                    {item.explanation && (
                      <div className="text-slate-500 italic mt-1 bg-white/70 p-2 rounded-xl">
                        💡 {item.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Action Buttons */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-200 text-center space-y-4">
        <h3 className="font-fredoka text-xl font-bold text-indigo-950">
          Where would you like to explore next?
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {historyList.length > 0 && !showReview && (
            <button
              id="btn-review-answers"
              type="button"
              onClick={() => setShowReview(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-700 font-fredoka font-bold text-sm border-2 border-indigo-200 shadow-xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Review Answers</span>
            </button>
          )}

          <Link
            id="btn-retry-quiz"
            to={`/practice/${encodeURIComponent(attempt?.topic || "Fractions")}`}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-fredoka font-bold text-sm border-2 border-slate-200 shadow-xs transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </Link>

          {wrong > 0 && (
            <Link
              id="btn-easier-mission"
              to="/practice/counting"
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-fredoka font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Try an Easier Mission</span>
            </Link>
          )}

          <Link
            id="btn-continue-adventure"
            to="/map"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-fredoka font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Continue Adventure</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            id="btn-return-map"
            to="/map"
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-fredoka font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Return to Map</span>
          </Link>
        </div>
      </div>

    </div>
  );
}

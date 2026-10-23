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
  const progression = attempt?.difficultyProgression || ["easy", "medium"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-center">
      
      {/* Trophy and Header */}
      <div className="space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-300 animate-bounce-gentle">
          🏆
        </div>
        <h1 className="font-fredoka text-3xl sm:text-5xl font-bold text-slate-900">
          Adventure Quiz Completed!
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          Awesome work tackling {attempt?.topic || "Math"} challenges today!
        </p>
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
          <span className="text-xs font-bold text-slate-500 uppercase">Correct</span>
          <div className="font-fredoka text-3xl font-bold text-indigo-600 mt-1">
            {correct} <span className="text-sm font-normal text-slate-400">/ {total}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">{wrong} need review</span>
        </div>

        {/* Points Earned */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Points Earned</span>
          <div className="font-fredoka text-3xl font-bold text-amber-600 mt-1">
            +{points}
          </div>
          <span className="text-[11px] text-amber-700 font-bold">Added to total XP</span>
        </div>

        {/* Peak Difficulty */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Peak Level</span>
          <div className="font-fredoka text-3xl font-bold text-purple-600 mt-1 capitalize">
            {attempt?.difficultyReached || "Medium"}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Adaptive peak</span>
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

      {/* Recommended Next Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-200 text-center space-y-4">
        <h3 className="font-fredoka text-xl font-bold text-indigo-950">
          Where would you like to explore next?
        </h3>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            id="btn-retry-quiz"
            to={`/practice/${encodeURIComponent(attempt?.topic || "Fractions")}`}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-fredoka font-bold text-sm border-2 border-slate-200 shadow-xs transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </Link>

          {wrong > 0 && (
            <Link
              id="btn-revision-mode"
              to="/practice/revision"
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-fredoka font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Revise Missed Questions ({wrong})</span>
              <Sparkles className="w-4 h-4" />
            </Link>
          )}

          <Link
            id="btn-back-dashboard"
            to="/dashboard"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}

// client/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";
import {
  Compass,
  Sparkles,
  Trophy,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const { user, updateProfile, t } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [progRes, recRes] = await Promise.all([
          api.get("/progress"),
          api.get("/recommendations"),
        ]);
        setProgressData(progRes.data);
        setRecommendation(recRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user?.grade]);

  const handleGradeChange = async (newGrade) => {
    if (user && user.grade !== newGrade) {
      await updateProfile({ grade: newGrade });
    }
  };

  if (loading) {
    return <Loader message="Setting up your dashboard..." />;
  }

  const stats = progressData?.stats || {
    totalQuestions: 0,
    overallAccuracy: 0,
    lessonsCompleted: 0,
    totalLessons: 5,
    dailyGoal: 5,
    dailyGoalProgress: 1,
  };

  const chartData = progressData?.recentAttempts || [
    { index: 1, accuracy: 70, topic: "Intro" },
    { index: 2, accuracy: 80, topic: "Fractions" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Greeting Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grade {user?.grade || 5} Math Adventure</span>
          </div>
          <h1 className="font-fredoka text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Hello, {user?.name || "Student"}! 🚀
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl font-medium">
            Ready to become a Math Champion today? Let's solve puzzles, level up, and earn shiny new badges!
          </p>

          {/* Grade selection toggle buttons */}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-200">Current Grade:</span>
            <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-xs">
              <button
                id="btn-grade-toggle-5"
                onClick={() => handleGradeChange(5)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  user?.grade === 5
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Grade 5
              </button>
              <button
                id="btn-grade-toggle-6"
                onClick={() => handleGradeChange(6)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  user?.grade === 6
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Grade 6
              </button>
            </div>
          </div>

          {/* Quick Adventure Links */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              id="btn-dash-open-map"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm shadow-md transition-all hover:scale-105"
            >
              <span>🗺️</span>
              <span>Enter Adventure Map</span>
            </Link>
            <Link
              to="/shop"
              id="btn-dash-open-shop"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-sm backdrop-blur-xs transition-all"
            >
              <span>🛒</span>
              <span>Royal Armory</span>
            </Link>
          </div>
        </div>

        {/* Level badge badge circle */}
        <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-center w-full md:w-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Adventure Rank
          </span>
          <div className="font-fredoka text-3xl sm:text-4xl font-bold text-white mt-1">
            Level {user?.levelInfo?.level || 1}
          </div>
          <p className="text-xs text-indigo-200 mt-0.5">
            {user?.totalPoints || 0} Total XP
          </p>
          <div className="w-36 sm:w-44 bg-white/20 h-2 rounded-full mt-2.5 mx-auto overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${user?.levelInfo?.progressPercent || 25}%` }}
            ></div>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl"></div>
      </div>

      {/* 2. Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Points */}
        <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
            ⭐
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {t("points")}
            </span>
            <h4 id="stat-points" className="font-fredoka text-2xl font-bold text-slate-800">
              {user?.totalPoints || 0}
            </h4>
          </div>
        </div>

        {/* Day Streak */}
        <div className="bg-white rounded-3xl p-5 border-2 border-orange-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl shrink-0">
            🔥
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {t("streak")}
            </span>
            <h4 id="stat-streak" className="font-fredoka text-2xl font-bold text-slate-800">
              {user?.currentStreak || 0} <span className="text-xs font-normal text-slate-500">Days</span>
            </h4>
          </div>
        </div>

        {/* Badges Unlocked */}
        <div className="bg-white rounded-3xl p-5 border-2 border-purple-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-2xl shrink-0">
            👑
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {t("badges")}
            </span>
            <h4 id="stat-badges" className="font-fredoka text-2xl font-bold text-slate-800">
              {user?.badgesCount || 3} <span className="text-xs font-normal text-slate-500">Earned</span>
            </h4>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
            🎯
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Quiz Accuracy
            </span>
            <h4 id="stat-accuracy" className="font-fredoka text-2xl font-bold text-slate-800">
              {stats.overallAccuracy}%
            </h4>
          </div>
        </div>

      </div>

      {/* 3. Continue Learning & Daily Goal Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended / Continue Learning Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Recommended Next Adventure</span>
            </div>
            <h3 className="font-fredoka text-2xl sm:text-3xl font-bold leading-tight">
              {recommendation?.topic ? `${recommendation.topic}` : "Fractions & Decimals"}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-amber-100 font-medium max-w-lg">
              {recommendation?.message || "Practise with interactive visuals and adaptive quiz questions to boost your mastery!"}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              id="btn-continue-learning"
              to={recommendation?.lessonId ? `/lessons/${recommendation.lessonId}` : `/grades/${user?.grade || 5}/topics`}
              className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 font-fredoka font-bold text-base hover:bg-amber-50 shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-900" />
              <span>Start Activity Now</span>
            </Link>

            <Link
              to={`/practice/${recommendation?.topic ? encodeURIComponent(recommendation.topic) : "Fractions"}`}
              className="px-5 py-3 rounded-2xl bg-amber-400/30 hover:bg-amber-400/40 text-white font-fredoka font-bold text-sm border border-white/30 transition-colors"
            >
              Jump to Practice Quiz 🎯
            </Link>
          </div>
        </div>

        {/* Daily Goal Progress Ring / Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>{t("dailyGoal")}</span>
              </h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {stats.dailyGoalProgress}/{stats.dailyGoal} Completed
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete {stats.dailyGoal} math activities every day to protect your streak flame!
            </p>
          </div>

          {/* Progress Visual */}
          <div className="my-4">
            <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Today's Progress</span>
              <span>{Math.round((stats.dailyGoalProgress / stats.dailyGoal) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((stats.dailyGoalProgress / stats.dailyGoal) * 100))}%` }}
              ></div>
            </div>
          </div>

          <Link
            id="btn-daily-challenge"
            to="/practice/daily"
            className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs text-center border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Play Date Challenge (5 Questions)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* 4. Performance Chart & Topics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Performance Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>{t("recentPerformance")}</span>
              </h3>
              <p className="text-xs text-slate-500">Accuracy percentage across your last quiz attempts</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Target: 80%+
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="topic" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "12px",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val}% Accuracy`, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#F59E0B", stroke: "#4F46E5", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Studied & Quick Navigation */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Topics for Grade {user?.grade || 5}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Explore lessons with worked examples and practice tests:
            </p>

            <div className="space-y-2">
              {(progressData?.topicBreakdown || []).slice(0, 4).map((topic) => (
                <Link
                  key={topic.topic}
                  to={`/practice/${encodeURIComponent(topic.topic)}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 transition-colors group"
                >
                  <div className="text-left">
                    <span className="font-fredoka text-sm font-bold text-slate-800 group-hover:text-indigo-700">
                      {topic.topic}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {topic.attempts > 0 ? `${topic.accuracy}% Accuracy` : "Ready to start"}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-white border border-slate-200 font-bold text-indigo-600">
                    Play
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            id="btn-view-all-topics"
            to={`/grades/${user?.grade || 5}/topics`}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 font-bold text-xs text-center border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View All Topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}

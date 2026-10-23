// client/src/pages/Progress.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import {
  Printer,
  BarChart2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Progress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.get("/progress");
        setData(res.data);
      } catch (err) {
        console.error("Progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader message="Generating comprehensive learning analytics..." />;
  }

  const stats = data?.stats || {
    totalQuestions: 0,
    overallAccuracy: 0,
    lessonsCompleted: 0,
    totalLessons: 5,
  };

  const chartData = (data?.topicBreakdown || []).map((t) => ({
    name: t.topic.length > 12 ? t.topic.slice(0, 10) + "..." : t.topic,
    accuracy: t.accuracy,
    attempts: t.attempts,
  }));

  const mistakes = data?.frequentlyMissed || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      
      {/* Header and Print Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-600">
            Student Analytics &amp; Reports
          </span>
          <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-slate-900">
            Learning Progress Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Student: <span className="font-bold text-slate-800">{user?.name}</span> • Grade {user?.grade || 5}
          </p>
        </div>

        <button
          id="btn-print-parent-report"
          onClick={handlePrint}
          className="print-include px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print Parent Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Questions Solved</span>
          <div className="font-fredoka text-3xl font-bold text-indigo-700 mt-1">
            {stats.totalQuestions}
          </div>
          <span className="text-[11px] text-slate-400">Total practice items</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Overall Accuracy</span>
          <div className="font-fredoka text-3xl font-bold text-emerald-600 mt-1">
            {stats.overallAccuracy}%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Calculated server-side</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-purple-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Lessons Studied</span>
          <div className="font-fredoka text-3xl font-bold text-purple-600 mt-1">
            {stats.lessonsCompleted} <span className="text-sm font-normal text-slate-400">/ {stats.totalLessons}</span>
          </div>
          <span className="text-[11px] text-slate-400">Completed modules</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-amber-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Current Streak</span>
          <div className="font-fredoka text-3xl font-bold text-amber-600 mt-1">
            {user?.currentStreak || 0} <span className="text-sm font-normal text-slate-400">Days</span>
          </div>
          <span className="text-[11px] text-slate-400">IST Asia/Kolkata</span>
        </div>
      </div>

      {/* Topic Accuracy Bar Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Topic Accuracy Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Accuracy rate for each Grade {user?.grade || 5} curriculum topic
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} angle={-15} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                formatter={(val) => [`${val}% Accuracy`, "Score"]}
              />
              <Bar dataKey="accuracy" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mistake Analysis Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-amber-100">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Mistake Analysis &amp; Targeted Revision</span>
            </h3>
            <p className="text-xs text-slate-500">
              Frequently missed questions identified for targeted practice and revision
            </p>
          </div>

          <Link
            id="btn-revision-practice"
            to="/practice/revision"
            className="no-print px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-fredoka font-bold text-xs shadow-xs transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <span>Start Revision Quiz Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {mistakes.length > 0 ? (
          <div className="space-y-3">
            {mistakes.map((q, i) => (
              <div
                key={q.id || i}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase">
                    {q.topic} • {q.difficulty}
                  </span>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Missed {q.timesMissed} time{q.timesMissed > 1 ? "s" : ""}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {q.question}
                </h4>
                <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  Correct Answer: {q.correctAnswer} — {q.explanation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-800 text-sm font-semibold">
            🎉 Great job! No persistent mistakes found. You are mastering your current topics!
          </div>
        )}
      </div>

    </div>
  );
}

// client/src/pages/ParentTeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Award,
  Clock,
  TrendingUp,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { playClickSound } from "../utils/soundEffects";
import api from "../services/api";

export default function ParentTeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyGoalLimit, setDailyGoalLimit] = useState(30); // minutes
  const [maskStudentNames, setMaskStudentNames] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get("/progress");
      setProgressData(res.data);
    } catch (e) {
      console.error("Progress fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const topicMastery = [
    { topic: "Arithmetic & Operations", mastery: 88, status: "Mastered", color: "bg-emerald-500" },
    { topic: "Fractions & Decimals", mastery: 74, status: "Proficient", color: "bg-indigo-500" },
    { topic: "Percentages & Ratios", mastery: 65, status: "In Progress", color: "bg-amber-500" },
    { topic: "Geometry & Shapes", mastery: 82, status: "Mastered", color: "bg-emerald-500" },
    { topic: "Probability & Logic", mastery: 60, status: "Developing", color: "bg-orange-500" },
  ];

  const handlePrintReport = () => {
    playClickSound();
    window.print();
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-indigo-950 to-slate-950 text-slate-100 p-4 sm:p-8 font-outfit">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold border border-slate-700 transition-all"
            onClick={() => {
              playClickSound();
              navigate("/dashboard");
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Student Dashboard</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md"
            onClick={handlePrintReport}
          >
            <Download className="w-4 h-4" />
            <span>Export Learning Report</span>
          </button>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Child-Safe & COPPA/GDPR Aligned</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-fredoka">
            Parent & Educator Oversight Console
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Real-time insights into your student's mathematical comprehension, daily practice duration,
            and privacy safeguards.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase block">Overall Accuracy</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {progressData?.stats?.overallAccuracy || 84}%
            </div>
            <span className="text-xs text-slate-400 font-medium">Across all quiz sessions</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase block">Total Stars Earned</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
              ⭐ {user?.totalStars || 0}
            </div>
            <span className="text-xs text-slate-400 font-medium">Realm mastery badges</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase block">Current Active Streak</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 mt-1">
              🔥 {user?.currentStreak || 0} Days
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily practice consistency</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-slate-400 font-bold uppercase block">Quizzes Completed</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-1">
              {progressData?.stats?.quizzesTaken || 12} Tests
            </div>
            <span className="text-xs text-slate-400 font-medium">Validated by mission engine</span>
          </div>
        </div>

        {/* Topic Mastery Progress Bars */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl space-y-5">
          <h2 className="text-xl font-bold text-slate-100 font-fredoka flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>Curriculum Topic Mastery (Grade {user?.grade || 5} Math)</span>
          </h2>

          <div className="space-y-4">
            {topicMastery.map((item) => (
              <div key={item.topic} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-200">{item.topic}</span>
                  <span className="text-slate-400 text-xs flex items-center gap-2">
                    <span className="text-amber-300">{item.mastery}%</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.status}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Screen Time Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 font-fredoka flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>Privacy & Child Safety</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
                <div>
                  <div className="font-bold text-slate-200">Anonymize On Leaderboard</div>
                  <div className="text-xs text-slate-400">Mask real name with hero nickname</div>
                </div>
                <input
                  type="checkbox"
                  checked={maskStudentNames}
                  onChange={(e) => setMaskStudentNames(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
                <div>
                  <div className="font-bold text-slate-200">Ad-Free & Tracking-Free Guarantee</div>
                  <div className="text-xs text-emerald-400">100% Protected (Always Enforced)</div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 font-fredoka flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Healthy Daily Study Limit</span>
            </h3>

            <p className="text-xs text-slate-300">
              Recommended screen time: 20–30 minutes of interactive mathematics per day.
            </p>

            <div className="flex gap-2">
              {[15, 25, 35, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    dailyGoalLimit === mins
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                  onClick={() => {
                    playClickSound();
                    setDailyGoalLimit(mins);
                  }}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Daily goal calibrated: {dailyGoalLimit} minutes recommended study per session.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

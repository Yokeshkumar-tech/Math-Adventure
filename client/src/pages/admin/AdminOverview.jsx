// client/src/pages/admin/AdminOverview.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminDashboard } from "../../services/adminApi.js";
import {
  Users,
  HelpCircle,
  Trophy,
  Compass,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminOverview() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumRes, chartRes] = await Promise.all([
          adminDashboard.getSummary(),
          adminDashboard.getCharts(),
        ]);
        setSummary(sumRes);
        setCharts(chartRes);
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Registered Players",
      value: summary?.totalPlayers ?? 0,
      sub: `${summary?.activeToday ?? 0} active today`,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      accent: "#38bdf8",
    },
    {
      label: "Question Bank Pool",
      value: summary?.totalQuestions ?? 0,
      sub: `${summary?.publishedQuestions ?? 0} published • ${summary?.draftQuestions ?? 0} draft`,
      icon: HelpCircle,
      color: "from-purple-500 to-pink-600",
      accent: "#a855f7",
    },
    {
      label: "Total Quiz Attempts",
      value: summary?.totalAttempts ?? 0,
      sub: `${summary?.totalPointsAwarded ?? 0} total XP awarded`,
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
      accent: "#fbbf24",
    },
    {
      label: "Average Accuracy",
      value: `${summary?.avgAccuracy ?? 84}%`,
      sub: "Mastery benchmark: 75%",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-600",
      accent: "#34d399",
    },
    {
      label: "Available Realms",
      value: summary?.totalRealms ?? 5,
      sub: `${summary?.totalMissions ?? 20} adventure missions`,
      icon: Compass,
      color: "from-sky-500 to-cyan-600",
      accent: "#06b6d4",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 p-6 rounded-3xl border border-indigo-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Kingdom Analytics &amp; Control Center</span>
            <span className="text-xl">🏰</span>
          </h1>
          <p className="text-xs text-slate-300">
            Real-time curriculum health, question bank integrity, and player progression
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/questions/upload"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>+ Upload Questions</span>
          </Link>
          <Link
            to="/admin/ai-generator"
            className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Generator</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="admin-kpi-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-sm`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="font-fredoka text-2xl font-bold text-white">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 7-Day Quiz Attempts & Accuracy */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>7-Day Quiz Activity Timeline</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Past 7 days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.chartTimeline || []}>
                <defs>
                  <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#attemptsGrad)"
                  name="Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Question Difficulty Breakdown */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Difficulty Balance</span>
          </h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.difficultyDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {(charts?.difficultyDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {(charts?.difficultyDistribution || []).map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 font-medium">{d.name}:</span>
                <span className="font-bold text-white ml-auto">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Accuracy Bar Chart & High Failure Diagnostic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance Bar Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Topic Mastery Accuracy (%)</span>
            </h3>
            <span className="text-[11px] text-slate-400">By curriculum topic</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.topicPerformance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="topic" type="category" width={110} stroke="#cbd5e1" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="accuracy" fill="#10b981" radius={[0, 6, 6, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic: Questions with High Failure Rates */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Question Diagnostic: Highest Misses</span>
            </h3>
            <Link
              to="/admin/questions"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>Manage Bank</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {charts?.diagnosticQuestions && charts.diagnosticQuestions.length > 0 ? (
              charts.diagnosticQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-200 truncate">{q.question}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {q.topic} • <span className="capitalize">{q.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                      {q.failureCount} misses
                    </span>
                    <span className="block text-[10px] text-amber-400 font-semibold mt-0.5">
                      {q.flag}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No problematic questions flagged at this time. All questions within healthy variance.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Student Activity Table */}
      <div className="admin-table-container">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-fredoka text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Student Adventure Activity</span>
          </h3>
          <Link
            to="/admin/players"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            View All Students &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Topic</th>
                <th>Accuracy</th>
                <th>XP Gained</th>
                <th>Level</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recentActivity && summary.recentActivity.length > 0 ? (
                summary.recentActivity.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <div className="font-bold text-white">{act.playerName}</div>
                      <div className="text-[11px] text-slate-400">@{act.username}</div>
                    </td>
                    <td>
                      <span className="font-medium text-slate-300">{act.topic}</span>
                    </td>
                    <td>
                      <span
                        className={`font-bold ${
                          act.accuracy >= 80
                            ? "text-emerald-400"
                            : act.accuracy >= 60
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {act.accuracy}%
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-amber-300">+{act.points} XP</span>
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-bold text-xs border border-slate-700">
                        Lv. {act.level}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">
                      {act.completedAt
                        ? new Date(act.completedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recent"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-slate-500">
                    No recent attempts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

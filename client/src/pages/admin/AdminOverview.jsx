// client/src/pages/admin/AdminOverview.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminDashboard } from "../../services/adminApi.js";
import { subscribeAdminSocket } from "../../services/socket.js";
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
  Coins,
  Star,
  Bot,
  Layers,
  Activity,
  Flame,
  Radio,
  Filter,
  Check,
  Shield,
  ExternalLink,
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
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Activity Feed State
  const [activityFeed, setActivityFeed] = useState([]);
  const [activityFilter, setActivityFilter] = useState("all");
  const [onlinePlayersList, setOnlinePlayersList] = useState([]);
  const [isSocketConnected, setIsSocketConnected] = useState(true);

  // Fetch initial summary & charts
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
        setActivityFeed(sumRes.activityFeed || []);
        setOnlinePlayersList(sumRes.onlinePlayersList || []);
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Subscribe to real-time Socket.IO events
  useEffect(() => {
    const unsubscribe = subscribeAdminSocket((event, data) => {
      setIsSocketConnected(true);

      if (event === "activity") {
        setActivityFeed((prev) => [data, ...prev.slice(0, 39)]);

        // Live increment counters if relevant
        if (data.eventType === "quiz_complete") {
          setSummary((prev) =>
            prev
              ? {
                  ...prev,
                  totalAttempts: (prev.totalAttempts || 0) + 1,
                  totalPointsAwarded: (prev.totalPointsAwarded || 0) + (data.xpGained || 0),
                  totalCoinsInCirculation: (prev.totalCoinsInCirculation || 0) + (data.coinsGained || 0),
                }
              : prev
          );
        } else if (data.eventType === "tutor_query") {
          setSummary((prev) =>
            prev ? { ...prev, tutorRequests: (prev.tutorRequests || 0) + 1 } : prev
          );
        } else if (data.eventType === "admin_publish") {
          setSummary((prev) =>
            prev
              ? {
                  ...prev,
                  publishedQuestions: (prev.publishedQuestions || 0) + 1,
                  draftQuestions: Math.max(0, (prev.draftQuestions || 1) - 1),
                }
              : prev
          );
        }
      } else if (event === "presence") {
        if (data.type === "online") {
          setSummary((prev) => (prev ? { ...prev, onlinePlayers: data.onlineCount } : prev));
          setOnlinePlayersList((prev) => {
            const exists = prev.find((p) => p.userId === data.player.userId);
            if (exists) return prev.map((p) => (p.userId === data.player.userId ? data.player : p));
            return [data.player, ...prev];
          });
        } else if (data.type === "offline") {
          setSummary((prev) => (prev ? { ...prev, onlinePlayers: data.onlineCount } : prev));
          setOnlinePlayersList((prev) => prev.filter((p) => p.userId !== data.userId));
        }
      } else if (event === "presence:sync") {
        setOnlinePlayersList(data || []);
        setSummary((prev) => (prev ? { ...prev, onlinePlayers: (data || []).length } : prev));
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter activity feed
  const filteredActivities = activityFeed.filter((act) => {
    if (activityFilter === "all") return true;
    if (activityFilter === "login") return act.category === "login" || act.eventType === "login";
    if (activityFilter === "quiz") return act.category === "quiz" || act.eventType === "quiz_complete";
    if (activityFilter === "mission") return act.category === "mission" || act.eventType === "mission_complete";
    if (activityFilter === "reward") return act.category === "reward" || act.eventType === "reward_earned";
    if (activityFilter === "realworld") return act.category === "realworld" || act.eventType === "realworld_complete";
    if (activityFilter === "tutor") return act.category === "tutor" || act.eventType === "tutor_query";
    if (activityFilter === "admin") return act.category === "admin" || act.eventType === "admin_publish";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading Real-Time Control Center...</p>
        </div>
      </div>
    );
  }

  // 14 Live KPI Cards
  const kpis = [
    {
      id: "players",
      label: "Registered Players",
      value: summary?.totalPlayers ?? 0,
      sub: `${summary?.activeToday ?? 0} active today`,
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      accent: "#38bdf8",
      link: "/admin/players",
    },
    {
      id: "online",
      label: "Live Online Now",
      value: summary?.onlinePlayers ?? 0,
      sub: "Real-time presence",
      icon: Radio,
      color: "from-emerald-500 to-teal-600",
      accent: "#10b981",
      pulse: true,
      link: "/admin/players?online=true",
    },
    {
      id: "active-today",
      label: "Active Today",
      value: summary?.activeToday ?? 0,
      sub: "Daily active students",
      icon: Flame,
      color: "from-amber-500 to-orange-600",
      accent: "#f59e0b",
      link: "/admin/players",
    },
    {
      id: "questions-total",
      label: "Total Questions",
      value: summary?.totalQuestions ?? 0,
      sub: `${summary?.publishedQuestions ?? 0} published`,
      icon: HelpCircle,
      color: "from-purple-600 to-pink-600",
      accent: "#a855f7",
      link: "/admin/questions",
    },
    {
      id: "questions-published",
      label: "Published Questions",
      value: summary?.publishedQuestions ?? 0,
      sub: "Available in student quizzes",
      icon: CheckCircle2,
      color: "from-cyan-600 to-blue-600",
      accent: "#06b6d4",
      link: "/admin/questions?status=published",
    },
    {
      id: "questions-draft",
      label: "Draft Questions",
      value: summary?.draftQuestions ?? 0,
      sub: `${summary?.reviewQuestions ?? 0} in review`,
      icon: BookOpen,
      color: "from-slate-600 to-slate-700",
      accent: "#94a3b8",
      link: "/admin/questions?status=draft",
    },
    {
      id: "quiz-attempts",
      label: "Quiz Attempts",
      value: summary?.totalAttempts ?? 0,
      sub: "Recorded evaluations",
      icon: Trophy,
      color: "from-violet-600 to-purple-700",
      accent: "#8b5cf6",
      link: "/admin/analytics",
    },
    {
      id: "avg-accuracy",
      label: "Average Accuracy",
      value: `${summary?.avgAccuracy ?? 0}%`,
      sub: "Benchmark target: 75%",
      icon: TrendingUp,
      color: "from-teal-600 to-emerald-700",
      accent: "#14b8a6",
      link: "/admin/analytics",
    },
    {
      id: "xp-awarded",
      label: "Total XP Awarded",
      value: summary?.totalPointsAwarded?.toLocaleString() ?? "0",
      sub: "Experience ledger",
      icon: Sparkles,
      color: "from-yellow-500 to-amber-600",
      accent: "#eab308",
      link: "/admin/economy",
    },
    {
      id: "coins-circ",
      label: "Coins In Economy",
      value: `🪙 ${summary?.totalCoinsInCirculation?.toLocaleString() ?? "0"}`,
      sub: "Player wallets total",
      icon: Coins,
      color: "from-amber-600 to-yellow-700",
      accent: "#d97706",
      link: "/admin/economy",
    },
    {
      id: "stars-circ",
      label: "Stars Awarded",
      value: `⭐ ${summary?.totalStarsAwarded?.toLocaleString() ?? "0"}`,
      sub: "Mastery star rewards",
      icon: Star,
      color: "from-pink-500 to-rose-600",
      accent: "#ec4899",
      link: "/admin/economy",
    },
    {
      id: "realms",
      label: "Active Realms",
      value: summary?.totalRealms ?? 5,
      sub: `${summary?.totalMissions ?? 20} missions mapped`,
      icon: Compass,
      color: "from-sky-600 to-indigo-600",
      accent: "#0284c7",
      link: "/admin/realms",
    },
    {
      id: "completed-missions",
      label: "Completed Missions",
      value: summary?.completedMissions ?? 0,
      sub: "Student quests beaten",
      icon: Layers,
      color: "from-indigo-600 to-purple-600",
      accent: "#6366f1",
      link: "/admin/realms",
    },
    {
      id: "tutor-queries",
      label: "Professor Pi Requests",
      value: summary?.tutorRequests ?? 0,
      sub: "AI math resolutions",
      icon: Bot,
      color: "from-fuchsia-600 to-pink-600",
      accent: "#d946ef",
      link: "/admin/analytics",
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. Top Control Center Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="font-fredoka text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Real-Time Admin Control Center</span>
              <span>⚡</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Socket.IO Live
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Real-time live telemetry, question pool curation, player monitoring, and game ecosystem management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <Link
            to="/admin/questions/new"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Create Question</span>
          </Link>
          <Link
            to="/admin/questions/upload"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Bulk Upload</span>
          </Link>
          <Link
            to="/admin/ai-generator"
            className="px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Generator</span>
          </Link>
        </div>

        {/* Ambient background aura */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Fourteen Live KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Live Kingdom Key Performance Indicators (Actual DB Records)</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">Click any card to filter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                onClick={() => navigate(kpi.link)}
                className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 shadow-md cursor-pointer transition-all duration-200 active:scale-95 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {kpi.label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shrink-0 shadow-xs relative`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {kpi.pulse && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-fredoka text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {kpi.value}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                    {kpi.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Real-Time Activity Feed & Online Players Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Game Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-fredoka text-base font-bold text-white">
                Live Game Activity Feed
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                {filteredActivities.length} events
              </span>
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { key: "all", label: "All" },
                { key: "quiz", label: "Quizzes" },
                { key: "login", label: "Logins" },
                { key: "tutor", label: "AI Tutor" },
                { key: "admin", label: "Admin" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActivityFilter(f.key)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    activityFilter === f.key
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Timeline List */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No activity events recorded for this category yet. Student actions will stream here live!
              </div>
            ) : (
              filteredActivities.map((act, idx) => {
                const isQuiz = act.category === "quiz" || act.eventType === "quiz_complete";
                const isLogin = act.category === "login" || act.eventType === "login";
                const isTutor = act.category === "tutor" || act.eventType === "tutor_query";
                const isAdmin = act.category === "admin" || act.eventType === "admin_publish";

                return (
                  <div
                    key={act._id || idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 text-xs flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar icon badge */}
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm shrink-0 border border-slate-700">
                        {isQuiz ? "🎯" : isLogin ? "👤" : isTutor ? "🦉" : isAdmin ? "🧙‍♂️" : "⚔️"}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-200 flex items-center gap-2 truncate">
                          <span>{act.playerName}</span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {act.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {act.description || act.topic || "Completed task"}
                        </div>
                      </div>
                    </div>

                    {/* Rewards & Timestamp */}
                    <div className="text-right shrink-0">
                      {act.xpGained > 0 && (
                        <span className="text-[11px] font-bold text-amber-400 block">
                          +{act.xpGained} XP
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {act.createdAt
                          ? new Date(act.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Online Players Presence */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Live Active Adventurers</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                {onlinePlayersList.length} Online
              </span>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {onlinePlayersList.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                  <div className="text-2xl opacity-40">🌙</div>
                  <p>All student heroes are resting.</p>
                  <p className="text-[10px] text-slate-600">Students logging into the game will appear here in real time via Socket.IO heartbeat.</p>
                </div>
              ) : (
                onlinePlayersList.map((p, idx) => (
                  <div
                    key={p.userId || idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Grade {p.grade} • {p.realm || "Number Forest"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-bold shrink-0">
                      {p.currentActivity || "Active"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/admin/players"
            className="w-full py-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs text-center block transition-all"
          >
            Open Player Monitoring Center &rarr;
          </Link>
        </div>
      </div>

      {/* 4. Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 7-Day Quiz Attempts & Accuracy Timeline */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>7-Day Quiz Activity Timeline</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Past 7 days activity</span>
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
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#attemptsGrad)"
                  name="Quiz Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Question Difficulty Breakdown Pie Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Question Difficulty Pool</span>
            </h3>
          </div>

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
                    borderRadius: "12px",
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

      {/* 5. Topic Mastery Bar Chart & Diagnostic Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topic Accuracy Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="accuracy" fill="#10b981" radius={[0, 8, 8, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnostic: High Failure Questions Alert */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Diagnostic: Questions Requiring Attention</span>
            </h3>
            <Link
              to="/admin/questions"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              <span>Manage Bank</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {charts?.diagnosticQuestions && charts.diagnosticQuestions.length > 0 ? (
              charts.diagnosticQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between gap-3"
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
              <div className="py-12 text-center text-slate-500 text-xs">
                All questions in the active curriculum are performing within normal variance!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

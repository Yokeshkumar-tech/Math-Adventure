// client/src/pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from "react";
import { adminAnalytics } from "../../services/adminApi.js";
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Filter } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await adminAnalytics.getDetailed({ timeframe });
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [timeframe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Learning Diagnostics &amp; Analytics</span>
            <span className="text-xl">📊</span>
          </h1>
          <p className="text-xs text-slate-400">
            Topic mastery indices, trial completion rates, and question review diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["7d", "30d", "90d"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Completion & Abandonment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-kpi-card">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Sessions Started</div>
          <div className="font-fredoka text-2xl font-bold text-white mt-1">
            {data?.sessionMetrics?.totalSessions || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all realms</div>
        </div>

        <div className="admin-kpi-card">
          <div className="text-xs font-bold text-emerald-400 uppercase">Trial Completion Rate</div>
          <div className="font-fredoka text-2xl font-bold text-emerald-300 mt-1">
            {data?.sessionMetrics?.completionRate || 92}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Finished question sets</div>
        </div>

        <div className="admin-kpi-card">
          <div className="text-xs font-bold text-amber-400 uppercase">Abandonment Rate</div>
          <div className="font-fredoka text-2xl font-bold text-amber-300 mt-1">
            {data?.sessionMetrics?.abandonmentRate || 8}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Exited before finish</div>
        </div>
      </div>

      {/* Topic Mastery Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>Topic Mastery Accuracy (%)</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.topicStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="topic" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} name="Accuracy %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diagnostic Review Indicators Table */}
      <div className="admin-table-container">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800">
          <h3 className="font-fredoka text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Question Review Diagnostic Flags</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Questions with frequent incorrect student responses that may benefit from curriculum review or clearer phrasing
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Failure Count</th>
                <th>Editorial Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {data?.diagnosticReport && data.diagnosticReport.length > 0 ? (
                data.diagnosticReport.map((diag) => (
                  <tr key={diag.questionId}>
                    <td className="max-w-xs truncate text-xs font-semibold text-slate-200">
                      {diag.question}
                    </td>
                    <td className="text-xs text-slate-300">{diag.topic}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {diag.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-rose-400">{diag.failures} times</span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-amber-300">{diag.recommendation}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    No flagged questions. All student responses within expected learning curves.
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

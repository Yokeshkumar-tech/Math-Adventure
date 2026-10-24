// client/src/pages/admin/AdminPlayerManagement.jsx
import React, { useState, useEffect } from "react";
import { adminPlayers } from "../../services/adminApi.js";
import {
  Users,
  Search,
  Shield,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Coins,
  Star,
  Flame,
} from "lucide-react";

export default function AdminPlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status & Reset Modals
  const [suspendModalPlayer, setSuspendModalPlayer] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [resetModalPlayer, setResetModalPlayer] = useState(null);
  const [resetReason, setResetReason] = useState("");

  const loadPlayers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminPlayers.list({ page, limit: 15, search, grade, status });
      setPlayers(res.players || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers(1);
  }, [grade, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPlayers(1);
  };

  const handleViewDetails = async (player) => {
    setSelectedPlayer(player);
    try {
      setDetailLoading(true);
      const res = await adminPlayers.get(player._id);
      setPlayerDetails(res);
    } catch (err) {
      alert("Failed to load player details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!suspendModalPlayer) return;
    const nextStatus = suspendModalPlayer.status === "suspended" ? "active" : "suspended";
    try {
      await adminPlayers.updateStatus(suspendModalPlayer._id, nextStatus, suspendReason);
      setSuspendModalPlayer(null);
      setSuspendReason("");
      loadPlayers(pagination.page);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleResetProgress = async () => {
    if (!resetModalPlayer || !resetReason.trim()) {
      alert("Please provide a reason for resetting player progress.");
      return;
    }
    try {
      await adminPlayers.resetProgress(resetModalPlayer._id, resetReason);
      setResetModalPlayer(null);
      setResetReason("");
      loadPlayers(pagination.page);
      alert("Player progress has been reset.");
    } catch (err) {
      alert("Failed to reset progress: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Student Adventurers Directory</span>
            <span className="text-xl">🛡️</span>
          </h1>
          <p className="text-xs text-slate-400">
            {pagination.total} registered student heroes in the kingdom
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, username, or hero alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
          >
            <option value="all">All Grades</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Players Data Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Hero</th>
                <th>Grade</th>
                <th>Level &amp; XP</th>
                <th>Coins &amp; Stars</th>
                <th>Streak</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Loading players...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No players found.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="font-bold text-white text-sm">{p.name}</div>
                      <div className="text-xs text-slate-400">@{p.username} • {p.nickname}</div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-300">Grade {p.grade || 5}</span>
                    </td>
                    <td>
                      <div className="font-bold text-indigo-300 text-xs">Level {p.currentLevel || 1}</div>
                      <div className="text-[11px] text-slate-400">{p.totalXP || 0} XP</div>
                    </td>
                    <td>
                      <div className="text-xs text-amber-300 font-bold">🪙 {p.totalCoins || 0}</div>
                      <div className="text-[11px] text-yellow-400 font-semibold">⭐ {p.totalStars || 0} Stars</div>
                    </td>
                    <td>
                      <span className="text-xs font-bold text-orange-400">🔥 {p.currentStreak || 0}x</span>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === "suspended"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="View student profile & history"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSuspendModalPlayer(p)}
                          className={`p-1.5 rounded-lg ${
                            p.status === "suspended"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                          title={p.status === "suspended" ? "Reactivate student" : "Suspend student"}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setResetModalPlayer(p)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white"
                          title="Reset student progress"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-fredoka text-xl font-bold text-white">{selectedPlayer.name}</h3>
                <span className="text-xs text-slate-400">@{selectedPlayer.username} • Hero Profile</span>
              </div>
              <button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading hero profile...</div>
            ) : (
              <div className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Level</span>
                    <div className="font-fredoka text-lg font-bold text-indigo-400">{selectedPlayer.currentLevel || 1}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Coins</span>
                    <div className="font-fredoka text-lg font-bold text-amber-400">🪙 {selectedPlayer.totalCoins || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Stars</span>
                    <div className="font-fredoka text-lg font-bold text-yellow-400">⭐ {selectedPlayer.totalStars || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
                    <div className="font-fredoka text-lg font-bold text-orange-400">🔥 {selectedPlayer.currentStreak || 0}</div>
                  </div>
                </div>

                {/* Recent Quiz Attempts */}
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Recent Quiz Attempts ({playerDetails?.attempts?.length || 0})
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {playerDetails?.attempts?.map((att) => (
                      <div
                        key={att._id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-200">{att.topic}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-emerald-400">{att.accuracy}% Accuracy</span>
                          <span className="text-amber-300 font-semibold">+{att.pointsEarned} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {suspendModalPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-fredoka text-lg font-bold text-white">
              {suspendModalPlayer.status === "suspended" ? "Reactivate Student Account" : "Suspend Student Account"}
            </h3>
            <p className="text-xs text-slate-400">
              {suspendModalPlayer.status === "suspended"
                ? "This will restore the student's access to all game features."
                : "This will temporarily prevent the student from logging in and answering questions."}
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Reason (Optional)</label>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="e.g. Parental request, disciplinary pause"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendModalPlayer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Modal */}
      {resetModalPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="text-3xl text-rose-500 text-center">⚠️</div>
            <h3 className="font-fredoka text-lg font-bold text-white text-center">
              Reset Progress for {resetModalPlayer.name}?
            </h3>
            <p className="text-xs text-slate-300 text-center">
              This will reset the student's level to 1, XP to 0, coins to 100, and clear all past attempts. This action is recorded in the audit log.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Documented Reason (Required)
              </label>
              <input
                type="text"
                required
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder="e.g. Student requested clean start for new school term"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setResetModalPlayer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

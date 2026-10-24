// client/src/pages/admin/AdminPlayerManagement.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminPlayers } from "../../services/adminApi.js";
import { subscribeAdminSocket } from "../../services/socket.js";
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
  Radio,
  Compass,
  Layers,
  Award,
  Clock,
  Check,
  X,
  Target,
} from "lucide-react";

export default function AdminPlayerManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOnlineFilter = searchParams.get("online") === "true";

  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("all");
  const [status, setStatus] = useState("all");
  const [onlineOnly, setOnlineOnly] = useState(initialOnlineFilter);
  const [sortBy, setSortBy] = useState("totalXP");
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
      const res = await adminPlayers.list({
        page,
        limit: 15,
        search,
        grade,
        status,
        online: onlineOnly ? "true" : undefined,
        sortBy,
      });
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
  }, [grade, status, onlineOnly, sortBy]);

  // Real-time presence updates
  useEffect(() => {
    const unsubscribe = subscribeAdminSocket((event, data) => {
      if (event === "presence") {
        setPlayers((prev) =>
          prev.map((p) => {
            if (p._id === data.userId || (data.player && p._id === data.player.userId)) {
              return {
                ...p,
                isOnline: data.type === "online",
                currentActivity: data.type === "online" ? (data.player?.currentActivity || "Active") : "Offline",
              };
            }
            return p;
          })
        );
      }
    });
    return () => unsubscribe();
  }, []);

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
      alert("Please provide a documented reason for resetting player progress.");
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
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Player Activity Center &amp; Directory</span>
            <span className="text-xl">🛡️</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time monitoring of {pagination.total} registered student adventurers in the kingdom
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              onlineOnly
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlineOnly ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span>Online Only</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row gap-3 shadow-md">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, username, hero alias, or unique player ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <option value="all">All Grades</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <option value="totalXP">Sort: Total XP</option>
            <option value="totalCoins">Sort: Coins</option>
            <option value="currentLevel">Sort: Level</option>
            <option value="currentStreak">Sort: Streak</option>
            <option value="createdAt">Sort: Registration Date</option>
          </select>
        </div>
      </div>

      {/* 3. Comprehensive Player Monitoring Table */}
      <div className="admin-table-container shadow-xl">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student Hero &amp; ID</th>
                <th>Presence</th>
                <th>Grade &amp; Realm</th>
                <th>Quiz Accuracy</th>
                <th>Currency &amp; Badges</th>
                <th>Streak</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Loading student adventurers...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No players found matching your filters.
                  </td>
                </tr>
              ) : (
                players.map((p) => (
                  <tr key={p._id}>
                    {/* Student Hero & ID */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm border border-slate-700 shrink-0">
                          {p.avatar === "mage" ? "🧙" : p.avatar === "archer" ? "🏹" : p.avatar === "explorer" ? "🧭" : "🛡️"}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            @{p.username} • ID: {String(p._id).slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Online / Presence status */}
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            p.isOnline ? "text-emerald-300" : "text-slate-400"
                          }`}
                        >
                          {p.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                        {p.currentActivity || "Resting"}
                      </div>
                    </td>

                    {/* Grade & Realm */}
                    <td>
                      <div className="text-xs font-medium text-slate-300">Grade {p.grade || 5}</div>
                      <div className="text-[10px] text-indigo-400 font-semibold truncate flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        <span>{p.currentRealm || "Number Forest"}</span>
                      </div>
                    </td>

                    {/* Quiz Accuracy & Questions Attempted */}
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs ${
                            p.quizAccuracy >= 80
                              ? "text-emerald-400"
                              : p.quizAccuracy >= 50
                              ? "text-amber-400"
                              : "text-slate-400"
                          }`}
                        >
                          {p.quizAccuracy || 0}% Acc
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({p.correctAnswers || 0}/{p.questionsAttempted || 0})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.completedMissions || 0} missions completed
                      </div>
                    </td>

                    {/* Currency & Badges */}
                    <td>
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <span>🪙 {p.totalCoins?.toLocaleString() || 0}</span>
                        <span className="text-indigo-300 ml-1 font-semibold">({p.totalXP || 0} XP)</span>
                      </div>
                      <div className="text-[10px] text-yellow-400 font-semibold flex items-center gap-1">
                        <span>⭐ {p.totalStars || 0}</span>
                        <span className="text-purple-300 ml-1">🎖️ {p.badgesCount || 0} badges</span>
                      </div>
                    </td>

                    {/* Level & Streak */}
                    <td>
                      <div className="text-xs font-bold text-indigo-300">
                        Level {p.currentLevel || 1}
                      </div>
                      <div className="text-[10px] font-bold text-orange-400">
                        🔥 {p.currentStreak || 0}d streak
                      </div>
                    </td>

                    {/* Account Status */}
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

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                          title="View complete student telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSuspendModalPlayer(p)}
                          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                            p.status === "suspended"
                              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          }`}
                          title={p.status === "suspended" ? "Reactivate student" : "Suspend student"}
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setResetModalPlayer(p)}
                          className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
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

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing {players.length} of {pagination.total} registered heroes
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadPlayers(pagination.page - 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadPlayers(pagination.page + 1)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 4. Complete Student Telemetry Drawer Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl">
                  {selectedPlayer.avatar === "mage" ? "🧙" : selectedPlayer.avatar === "archer" ? "🏹" : "🛡️"}
                </div>
                <div>
                  <h3 className="font-fredoka text-xl font-bold text-white flex items-center gap-2">
                    <span>{selectedPlayer.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedPlayer.isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                      }`}
                    />
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    @{selectedPlayer.username} • ID: {selectedPlayer._id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading hero profile data...</div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Level</span>
                    <div className="font-fredoka text-lg font-bold text-indigo-400">
                      Level {selectedPlayer.currentLevel || 1}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Coins</span>
                    <div className="font-fredoka text-lg font-bold text-amber-400">
                      🪙 {selectedPlayer.totalCoins?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Stars</span>
                    <div className="font-fredoka text-lg font-bold text-yellow-400">
                      ⭐ {selectedPlayer.totalStars || 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Streak</span>
                    <div className="font-fredoka text-lg font-bold text-orange-400">
                      🔥 {selectedPlayer.currentStreak || 0}d
                    </div>
                  </div>
                </div>

                {/* Additional Telemetry Details */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Grade</span>
                    <span className="text-white font-semibold">Grade {selectedPlayer.grade || 5}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Total XP</span>
                    <span className="text-indigo-300 font-semibold">{selectedPlayer.totalXP || 0} XP</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Activity</span>
                    <span className="text-emerald-400 font-semibold">{selectedPlayer.currentActivity || "Exploring"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Realm</span>
                    <span className="text-cyan-400 font-semibold">{selectedPlayer.currentRealm || "Number Forest"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Questions Attempted</span>
                    <span className="text-white font-semibold">{selectedPlayer.questionsAttempted || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Quiz Accuracy</span>
                    <span className="text-emerald-400 font-semibold">{selectedPlayer.quizAccuracy || 0}%</span>
                  </div>
                </div>

                {/* Recent Quiz Attempts */}
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Recent Quiz Attempts ({playerDetails?.attempts?.length || 0})</span>
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {playerDetails?.attempts && playerDetails.attempts.length > 0 ? (
                      playerDetails.attempts.map((att) => (
                        <div
                          key={att._id}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-200 block">{att.topic}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(att.completedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold ${
                                att.accuracy >= 80
                                  ? "text-emerald-400"
                                  : att.accuracy >= 60
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {att.accuracy}% Accuracy
                            </span>
                            <span className="text-amber-300 font-semibold">+{att.pointsEarned} XP</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 py-4 text-center">No quiz attempts recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Suspend Modal */}
      {suspendModalPlayer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Reset Progress Modal */}
      {resetModalPlayer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="text-3xl text-rose-500 text-center">⚠️</div>
            <h3 className="font-fredoka text-lg font-bold text-white text-center">
              Reset Progress for {resetModalPlayer.name}?
            </h3>
            <p className="text-xs text-slate-300 text-center">
              This will reset the student's level to 1, XP to 0, coins to 100, and clear all past attempts. This action is permanently recorded in the audit log.
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetProgress}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
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

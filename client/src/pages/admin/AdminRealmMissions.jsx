// client/src/pages/admin/AdminRealmMissions.jsx
import React, { useState, useEffect } from "react";
import { adminRealms } from "../../services/adminApi.js";
import { Compass, Swords, Star, Edit2, Plus, CheckCircle2 } from "lucide-react";

export default function AdminRealmMissions() {
  const [realms, setRealms] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedRealm, setSelectedRealm] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editRealm, setEditRealm] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, mRes] = await Promise.all([
        adminRealms.listRealms(),
        adminRealms.listMissions("all"),
      ]);
      setRealms(rRes.realms || []);
      setMissions(mRes.missions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateRealmStars = async (realmId, minStars) => {
    try {
      await adminRealms.updateRealm(realmId, {
        unlockRequirements: { minStars: Number(minStars) },
      });
      loadData();
      setEditRealm(null);
    } catch (err) {
      alert("Failed to update realm unlock requirements.");
    }
  };

  const filteredMissions = selectedRealm === "all"
    ? missions
    : missions.filter((m) => m.worldSlug === selectedRealm);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Realm Map &amp; Mission Architecture</span>
            <span className="text-xl">🗺️</span>
          </h1>
          <p className="text-xs text-slate-400">
            Control adventure realm progression, star unlock thresholds, and mission trials
          </p>
        </div>
      </div>

      {/* Realms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {realms.map((r) => (
          <div
            key={r._id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden"
            style={{ borderTop: `3px solid ${r.themeColor || "#10b981"}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{r.icon}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{r.unlockRequirements?.minStars || 0} Stars</span>
              </span>
            </div>

            <div>
              <h3 className="font-fredoka text-sm font-bold text-white">{r.name}</h3>
              <p className="text-[11px] text-slate-400 truncate">{r.topic}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{r.missionCount} Missions</span>
              <button
                onClick={() => setEditRealm(r)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold"
              >
                Edit Stars
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Missions Management Table */}
      <div className="admin-table-container">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Realm Missions ({filteredMissions.length})
            </span>
            <select
              value={selectedRealm}
              onChange={(e) => setSelectedRealm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="all">All Realms</option>
              {realms.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mission</th>
                <th>Realm</th>
                <th>Type</th>
                <th>Objective</th>
                <th>Questions Attached</th>
                <th>Rewards</th>
              </tr>
            </thead>
            <tbody>
              {filteredMissions.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="font-bold text-white text-xs">{m.title}</div>
                    <div className="text-[11px] text-slate-400">Mission #{m.missionNumber}</div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">{m.worldSlug}</span>
                  </td>
                  <td>
                    {m.isBoss ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                        ⚔️ Boss Battle
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                        Mission Quiz
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs truncate text-xs text-slate-300">{m.objective}</td>
                  <td>
                    <span className="font-bold text-indigo-300 text-xs">
                      {m.questionIds?.length || 0} Questions
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-amber-300 font-bold">
                      +{m.rewardRules?.bonusCoinsOnComplete || 50} 🪙 Coins
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Realm Modal */}
      {editRealm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-fredoka text-lg font-bold text-white">
              Configure {editRealm.name}
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Required Stars to Unlock
              </label>
              <input
                type="number"
                id="realm-stars-input"
                defaultValue={editRealm.unlockRequirements?.minStars || 0}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditRealm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById("realm-stars-input").value;
                  handleUpdateRealmStars(editRealm._id, val);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save Requirements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

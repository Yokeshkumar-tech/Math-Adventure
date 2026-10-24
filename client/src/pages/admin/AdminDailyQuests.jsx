// client/src/pages/admin/AdminDailyQuests.jsx
import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Flame,
  Coins,
  Sparkles,
  Save,
  CheckCircle2,
  Trophy,
  Target,
  Shield,
  HelpCircle,
} from "lucide-react";
import { adminEconomy } from "../../services/adminApi.js";

export default function AdminDailyQuests() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await adminEconomy.get();
      setConfig(res.config);
    } catch (err) {
      alert("Failed to load daily quest settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg("");
      await adminEconomy.update(config);
      setSuccessMsg("Daily quest & streak economy parameters updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium">
        Loading Daily Quest & Streak Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">Daily Quests & Streak Rules</h1>
            <p className="text-xs text-slate-400">
              Configure daily mathematics mission quotas, streak progression tiers, and completion rewards
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Quota Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-fredoka">
              <Target className="w-4 h-4 text-indigo-400" />
              Daily Quest Quota & Rewards
            </h2>
            <p className="text-xs text-slate-400">
              Students must complete this number of problems every calendar day to unlock the daily treasure chest.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Daily Questions
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={config.dailyGoalQuestions || 5}
                  onChange={(e) =>
                    setConfig({ ...config, dailyGoalQuestions: Number(e.target.value) })
                  }
                  className="admin-input w-full"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Recommended: 5 questions per day for optimal student retention
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Mission Completion Coins
                </label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={config.bonusCoinsOnComplete || 50}
                  onChange={(e) =>
                    setConfig({ ...config, bonusCoinsOnComplete: Number(e.target.value) })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Base XP Per Correct Answer
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.xpPerCorrect || 10}
                  onChange={(e) =>
                    setConfig({ ...config, xpPerCorrect: Number(e.target.value) })
                  }
                  className="admin-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Streak Multipliers Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-fredoka">
              <Flame className="w-4 h-4 text-amber-400" />
              Daily Streak Thresholds
            </h2>
            <p className="text-xs text-slate-400">
              Days of continuous practice required to unlock ascending coin & XP multipliers.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Tier 1 Streak (1.25x Multiplier)</span>
                  <span className="text-amber-400 font-bold">
                    {config.streakThresholds?.tier1 || 3} Consecutive Days
                  </span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={config.streakThresholds?.tier1 || 3}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      streakThresholds: {
                        ...config.streakThresholds,
                        tier1: Number(e.target.value),
                      },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Tier 2 Streak (1.50x Multiplier)</span>
                  <span className="text-amber-400 font-bold">
                    {config.streakThresholds?.tier2 || 5} Consecutive Days
                  </span>
                </div>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={config.streakThresholds?.tier2 || 5}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      streakThresholds: {
                        ...config.streakThresholds,
                        tier2: Number(e.target.value),
                      },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Tier 3 Streak (2.00x Epic Multiplier)</span>
                  <span className="text-amber-400 font-bold">
                    {config.streakThresholds?.tier3 || 8} Consecutive Days
                  </span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={config.streakThresholds?.tier3 || 8}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      streakThresholds: {
                        ...config.streakThresholds,
                        tier3: Number(e.target.value),
                      },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Student Preview Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white mb-2 font-fredoka flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Live Student Game Preview
          </h2>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl">
                🔥
              </div>
              <div>
                <p className="text-sm font-bold text-white">Daily Mathematical Quest</p>
                <p className="text-xs text-slate-400">
                  Solve {config.dailyGoalQuestions || 5} problems to earn +{config.bonusCoinsOnComplete || 50} bonus coins & maintain streak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                +{config.xpPerCorrect || 10} XP / Problem
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Up to 2.0x Streak Bonus
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Daily Quest Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

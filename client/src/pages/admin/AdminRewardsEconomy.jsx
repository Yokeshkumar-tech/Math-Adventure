// client/src/pages/admin/AdminRewardsEconomy.jsx
import React, { useState, useEffect } from "react";
import { adminEconomy } from "../../services/adminApi.js";
import { Coins, Sparkles, Flame, Shield, Clock, Lightbulb, Scissors, Save, CheckCircle2 } from "lucide-react";

export default function AdminRewardsEconomy() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await adminEconomy.get();
        setConfig(res.config);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccess("");
      const res = await adminEconomy.update(config);
      setConfig(res.config);
      setSuccess("Economy rules and pricing updated across the kingdom!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert("Failed to update economy configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Kingdom Economy &amp; Rewards Engine</span>
            <span className="text-xl">🪙</span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure XP reward rates, streak multipliers, power-up armory pricing, and completion bonuses
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Economy Rules"}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Progression Rates */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Core Mathematical XP &amp; Coin Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Base XP per Correct Solution
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.xpPerCorrect || 10}
                onChange={(e) => setConfig({ ...config, xpPerCorrect: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Standard easy question reward</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Bonus Coins on Mission Completion
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={config.bonusCoinsOnComplete || 50}
                onChange={(e) => setConfig({ ...config, bonusCoinsOnComplete: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Awarded to student wallet upon victory</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Daily Goal Target (Questions)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={config.dailyGoalQuestions || 5}
                onChange={(e) => setConfig({ ...config, dailyGoalQuestions: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Required to maintain daily streak</span>
            </div>
          </div>
        </div>

        {/* Combo Multiplier Thresholds */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Combo Streak Multipliers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                1.25x Multiplier Threshold
              </label>
              <input
                type="number"
                min={2}
                max={10}
                value={config.streakThresholds?.tier1 || 3}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    streakThresholds: { ...config.streakThresholds, tier1: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Consecutive correct answers required</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                1.5x Multiplier Threshold
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={config.streakThresholds?.tier2 || 5}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    streakThresholds: { ...config.streakThresholds, tier2: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Consecutive correct answers required</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                2.0x Multiplier Threshold (Max Flame)
              </label>
              <input
                type="number"
                min={5}
                max={25}
                value={config.streakThresholds?.tier3 || 8}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    streakThresholds: { ...config.streakThresholds, tier3: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Supercharged points multiplier</span>
            </div>
          </div>
        </div>

        {/* Power-Up Armory Shop Pricing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>Power-Up Armory Pricing (Coins 🪙)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>50/50 Card</span>
              </div>
              <input
                type="number"
                value={config.powerUpPricing?.fiftyFifty || 30}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    powerUpPricing: { ...config.powerUpPricing, fiftyFifty: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 block">Eliminates 2 wrong choices</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Streak Shield</span>
              </div>
              <input
                type="number"
                value={config.powerUpPricing?.streakShield || 50}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    powerUpPricing: { ...config.powerUpPricing, streakShield: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 block">Absorbs 1 mistake</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                <span>Hint Crystal</span>
              </div>
              <input
                type="number"
                value={config.powerUpPricing?.hintCrystal || 20}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    powerUpPricing: { ...config.powerUpPricing, hintCrystal: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 block">Unlocks formula &amp; clue</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Time Boost (+15s)</span>
              </div>
              <input
                type="number"
                value={config.powerUpPricing?.timeBoost || 20}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    powerUpPricing: { ...config.powerUpPricing, timeBoost: Number(e.target.value) },
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 block">Challenge Mode timer booster</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// client/src/pages/Achievements.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import { Trophy, Award, Lock, CheckCircle2, Sparkles, Flame, Shield, Star } from "lucide-react";

export default function Achievements() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [badgeRes, leadRes] = await Promise.all([
          api.get("/achievements"),
          api.get("/leaderboard"),
        ]);
        setBadges(badgeRes.data);
        setLeaderboard(leadRes.data);
      } catch (err) {
        console.error("Error loading achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <Loader message="Polishing your adventure badges..." />;
  }

  const levelInfo = user?.levelInfo || { level: 1, points: 250, progressPercent: 50 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Level Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-1">
          <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
            Explorer Level Status
          </span>
          <h1 className="font-fredoka text-3xl sm:text-5xl font-bold">
            Level {levelInfo.level} Champion!
          </h1>
          <p className="text-sm text-amber-100 font-medium">
            {user?.totalPoints || 0} Total Adventure XP Points Earned
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center w-full md:w-72">
          <div className="flex justify-between text-xs font-bold text-amber-100 mb-1.5">
            <span>Next Rank: Level {levelInfo.level + 1}</span>
            <span>{levelInfo.progressPercent}%</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[11px] text-amber-200 mt-1 block">
            {levelInfo.nextThreshold - levelInfo.points} XP needed to level up
          </span>
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-fredoka text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Badge Collection ({badges.filter((b) => b.unlocked).length} / {badges.length} Unlocked)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge._id || badge.key}
              className={`rounded-3xl p-6 border-2 transition-all flex items-start gap-4 ${
                badge.unlocked
                  ? "bg-white border-amber-300 shadow-sm hover:shadow-md"
                  : "bg-slate-50/70 border-slate-200 opacity-60"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-xs ${
                  badge.unlocked ? "bg-amber-100 border border-amber-300" : "bg-slate-200"
                }`}
              >
                {badge.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-fredoka font-bold text-lg text-slate-800">
                    {badge.name}
                  </h4>
                  {badge.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {badge.description}
                </p>
                {badge.unlocked ? (
                  <span className="inline-block text-[11px] font-bold text-emerald-600 pt-1">
                    ✓ Unlocked! +{badge.xpBonus || 50} XP
                  </span>
                ) : (
                  <span className="inline-block text-[11px] font-bold text-slate-400 pt-1">
                    Locked • Keep practising!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Table (Child-Safe Opt-In) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Adventurers Hall of Fame</span>
            </h3>
            <p className="text-xs text-slate-500">
              Weekly top learners (opt-in child-safe nicknames only)
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Personal Progress is #1! 🌟
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-bold">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Adventurer</th>
                <th className="py-3 px-4">Day Streak</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-fredoka font-bold text-base text-indigo-700">
                    {item.rank === 1 ? "🥇 1" : item.rank === 2 ? "🥈 2" : item.rank === 3 ? "🥉 3" : `#${item.rank}`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                    <span className="text-lg">⭐</span>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-orange-600">
                    🔥 {item.streak} days
                  </td>
                  <td className="py-3.5 px-4 text-right font-fredoka font-bold text-base text-slate-900">
                    {item.points} pts
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400 text-xs">
                    Join the leaderboard in Settings to see your friendly ranking!
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

// client/src/pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Flame, Star, Zap, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CharacterSprite from "../components/game/CharacterSprite";
import { playClickSound } from "../utils/soundEffects";
import api from "../services/api";

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all-time"); // 'all-time' | 'streak' | 'stars'

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leaderboard");
      setLeaderboard(res.data || []);
    } catch (e) {
      console.error("Leaderboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (filter === "streak") return (b.streak || 0) - (a.streak || 0);
    if (filter === "stars") return (b.stars || 0) - (a.stars || 0);
    return (b.points || b.xp || 0) - (a.points || a.xp || 0);
  });

  const top3 = sortedLeaderboard.slice(0, 3);
  const restList = sortedLeaderboard.slice(3);

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-indigo-950 to-slate-950 text-slate-100 p-4 sm:p-8 font-outfit">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold border border-slate-700 transition-all"
            onClick={() => {
              playClickSound();
              navigate("/map");
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Adventure Map</span>
          </button>

          <button
            type="button"
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-extrabold rounded-xl text-sm shadow-md hover:scale-105 transition-all"
            onClick={() => {
              playClickSound();
              navigate("/arena");
            }}
          >
            ⚔️ Duel in Arena
          </button>
        </div>

        {/* Title & Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Hall of Mathematics Legends</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-fredoka">
            Kingdom Leaderboard
          </h1>
          <p className="text-slate-300 text-sm max-w-md mx-auto">
            The greatest math champions across all realms. Solve quests, defeat bosses, and build streaks to claim the throne!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2">
          {[
            { id: "all-time", label: "⚡ All-Time XP" },
            { id: "stars", label: "⭐ Star Masters" },
            { id: "streak", label: "🔥 Streak Blazes" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                  : "bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700"
              }`}
              onClick={() => {
                playClickSound();
                setFilter(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold">Gathering Kingdom Scores...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 pb-2 items-end max-w-xl mx-auto">
                {/* 2nd Place */}
                {top3[1] && (
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-center space-y-2 order-1 shadow-lg">
                    <span className="text-xl sm:text-2xl font-black text-slate-300">🥈 2nd</span>
                    <div className="flex justify-center">
                      <CharacterSprite
                        characterId={top3[1].avatar || "archer"}
                        costume={top3[1].costume || "default"}
                        accessory={top3[1].accessory || "none"}
                        pet={top3[1].pet || "none"}
                        size="md"
                      />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">{top3[1].name}</div>
                    <div className="text-xs font-black text-slate-300">{top3[1].points} pts</div>
                  </div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <div className="bg-gradient-to-b from-amber-500/20 to-slate-800/90 border-2 border-amber-400 rounded-2xl p-4 sm:p-6 text-center space-y-2 order-2 shadow-2xl scale-105">
                    <span className="text-3xl font-black text-amber-400 block animate-bounce">👑 1st</span>
                    <div className="flex justify-center">
                      <CharacterSprite
                        characterId={top3[0].avatar || "knight"}
                        costume={top3[0].costume || "default"}
                        accessory={top3[0].accessory || "none"}
                        pet={top3[0].pet || "none"}
                        size="lg"
                      />
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-amber-300 truncate">{top3[0].name}</div>
                    <div className="text-sm font-black text-amber-400">{top3[0].points} pts</div>
                    <div className="text-xs text-amber-300 font-bold">⭐ {top3[0].stars} Stars</div>
                  </div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-3 sm:p-4 text-center space-y-2 order-3 shadow-lg">
                    <span className="text-xl sm:text-2xl font-black text-amber-600">🥉 3rd</span>
                    <div className="flex justify-center">
                      <CharacterSprite
                        characterId={top3[2].avatar || "mage"}
                        costume={top3[2].costume || "default"}
                        accessory={top3[2].accessory || "none"}
                        pet={top3[2].pet || "none"}
                        size="md"
                      />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">{top3[2].name}</div>
                    <div className="text-xs font-black text-amber-500">{top3[2].points} pts</div>
                  </div>
                )}
              </div>
            )}

            {/* List 4 to 15 */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur shadow-xl space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                All Ranked Adventurers
              </h3>

              {sortedLeaderboard.map((item, idx) => {
                const isMe = item.isCurrentUser || item.id === user?._id || item.id === user?.id;
                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isMe
                        ? "bg-indigo-600/30 border-amber-400 shadow-md shadow-indigo-900/40"
                        : "bg-slate-800/50 border-slate-700/60 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 font-black text-center text-sm text-slate-400">
                        #{idx + 1}
                      </span>
                      <CharacterSprite
                        characterId={item.avatar || "knight"}
                        costume={item.costume || "default"}
                        accessory={item.accessory || "none"}
                        pet={item.pet || "none"}
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-0.5 text-amber-400">
                            ⭐ {item.stars}
                          </span>
                          <span className="flex items-center gap-0.5 text-orange-400">
                            🔥 {item.streak}d
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="font-black text-sm text-amber-400">
                      {item.points || item.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

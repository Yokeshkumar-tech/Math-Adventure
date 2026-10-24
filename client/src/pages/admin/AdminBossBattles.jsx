// client/src/pages/admin/AdminBossBattles.jsx
import React, { useState, useEffect } from "react";
import {
  Swords,
  Heart,
  Shield,
  Edit2,
  Trophy,
  Coins,
  Star,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { adminRealms } from "../../services/adminApi.js";

const DEFAULT_BOSSES = [
  {
    _id: "treant_boss",
    name: "Ancient Treant of Prime Woods",
    realm: "number-forest",
    realmName: "Number Forest",
    avatar: "🌲",
    hp: 100,
    attackPower: 20,
    topic: "Multiplication & Prime Factors",
    greeting: "Who disturbs the slumber of the Prime Roots? Prove your arithmetic mastery!",
    defeatDialogue: "Your knowledge outshines the ancient trees... The forest yields to you!",
    rewardCoins: 150,
    rewardStars: 3,
  },
  {
    _id: "fraction_dragon",
    name: "Pyros the Fraction Dragon",
    realm: "fraction-kingdom",
    realmName: "Fraction Kingdom",
    avatar: "🐉",
    hp: 150,
    attackPower: 25,
    topic: "Fractions & Common Denominators",
    greeting: "My scales are forged from impenetrable fractions! Can you reduce my flames?",
    defeatDialogue: "Impossible! You have simplified my blazing inferno into mere sparks!",
    rewardCoins: 250,
    rewardStars: 3,
  },
  {
    _id: "geometry_titan",
    name: "Colossus of Angles",
    realm: "ocean-of-geometry",
    realmName: "Ocean of Geometry",
    avatar: "🗿",
    hp: 200,
    attackPower: 30,
    topic: "Area, Perimeter & Pythagorean Angles",
    greeting: "Every side and angle of my fortress is calculated to crush invaders!",
    defeatDialogue: "The symmetry... broken! You have conquered the sacred theorems!",
    rewardCoins: 350,
    rewardStars: 3,
  },
  {
    _id: "sphinx_prob",
    name: "Sphinx of Absolute Chance",
    realm: "dragons-castle",
    realmName: "Probability Galaxy",
    avatar: "🌌",
    hp: 250,
    attackPower: 35,
    topic: "Probability & Permutations",
    greeting: "The odds are stacked infinitely against you, mortal! Gamble your stars!",
    defeatDialogue: "You have defied all mathematical probability... The Cosmos is yours!",
    rewardCoins: 500,
    rewardStars: 5,
  },
];

export default function AdminBossBattles() {
  const [bosses, setBosses] = useState(DEFAULT_BOSSES);
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleEdit = (boss) => {
    setSelectedBoss({ ...boss });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setBosses((prev) =>
      prev.map((b) => (b._id === selectedBoss._id ? selectedBoss : b))
    );
    setShowModal(false);
    setSuccessMsg(`Boss encounter "${selectedBoss.name}" updated successfully!`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">
              Realm Boss Encounters
            </h1>
            <p className="text-xs text-slate-400">
              Configure health pools, attack penalties, narrative dialogues, and epic victory drops for realm climaxes
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

      {/* Boss Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bosses.map((boss) => (
          <div
            key={boss._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                    {boss.avatar}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wide">
                      {boss.realmName}
                    </span>
                    <h3 className="text-lg font-bold text-white font-fredoka mt-0.5">
                      {boss.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(boss)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
                  title="Edit Boss Specs"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Combat Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Health Pool</p>
                    <p className="text-sm font-bold text-white">{boss.hp} HP</p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center gap-2.5">
                  <Swords className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Attack Damage</p>
                    <p className="text-sm font-bold text-white">{boss.attackPower} DMG</p>
                  </div>
                </div>
              </div>

              {/* Narrative Dialogue */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-3 space-y-2 mb-4 text-xs">
                <div className="flex items-start gap-2 text-slate-300">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                  <p className="italic">"{boss.greeting}"</p>
                </div>
              </div>
            </div>

            {/* Victory Drops */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Victory Drops:</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Coins className="w-3.5 h-3.5" />+{boss.rewardCoins} Coins
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                  <Star className="w-3.5 h-3.5" />+{boss.rewardStars} Stars
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Boss Modal */}
      {showModal && selectedBoss && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-fredoka flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-400" />
              Configure {selectedBoss.name}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Boss Title & Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedBoss.name}
                  onChange={(e) =>
                    setSelectedBoss({ ...selectedBoss, name: e.target.value })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar</label>
                  <input
                    type="text"
                    value={selectedBoss.avatar}
                    onChange={(e) =>
                      setSelectedBoss({ ...selectedBoss, avatar: e.target.value })
                    }
                    className="admin-input w-full text-center text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total HP</label>
                  <input
                    type="number"
                    min={50}
                    max={1000}
                    value={selectedBoss.hp}
                    onChange={(e) =>
                      setSelectedBoss({ ...selectedBoss, hp: Number(e.target.value) })
                    }
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Attack DMG</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={selectedBoss.attackPower}
                    onChange={(e) =>
                      setSelectedBoss({
                        ...selectedBoss,
                        attackPower: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Encounter Greeting Dialogue
                </label>
                <textarea
                  rows={2}
                  value={selectedBoss.greeting}
                  onChange={(e) =>
                    setSelectedBoss({ ...selectedBoss, greeting: e.target.value })
                  }
                  className="admin-textarea w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Defeat Dialogue
                </label>
                <textarea
                  rows={2}
                  value={selectedBoss.defeatDialogue}
                  onChange={(e) =>
                    setSelectedBoss({ ...selectedBoss, defeatDialogue: e.target.value })
                  }
                  className="admin-textarea w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Victory Coin Drop
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={2000}
                    value={selectedBoss.rewardCoins}
                    onChange={(e) =>
                      setSelectedBoss({
                        ...selectedBoss,
                        rewardCoins: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Victory Star Drop
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedBoss.rewardStars}
                    onChange={(e) =>
                      setSelectedBoss({
                        ...selectedBoss,
                        rewardStars: Number(e.target.value),
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary text-xs">
                  Save Boss Specs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

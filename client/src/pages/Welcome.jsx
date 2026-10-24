// client/src/pages/Welcome.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Sparkles,
  Rocket,
  Compass,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  Flame,
  CheckCircle2,
  Smile,
  GraduationCap,
} from "lucide-react";
import { CHARACTER_CLASSES } from "../components/game/CharacterSprite.jsx";

const LEARNING_LEVELS = [
  { level: 1, name: "Number Recognition & Counting", topic: "counting", icon: "🍎", grade: "Grades 1-2", desc: "Count objects, learn numbers, and build visual quantity sense." },
  { level: 2, name: "Addition Adventures", topic: "addition", icon: "➕", grade: "Grades 2-3", desc: "Put groups together, use number lines, and find totals." },
  { level: 3, name: "Subtraction Trails", topic: "subtraction", icon: "➖", grade: "Grades 2-3", desc: "Take away, find differences, and count backwards safely." },
  { level: 4, name: "Multiplication Arrays", topic: "multiplication", icon: "✖️", grade: "Grades 3-4", desc: "Equal groups, repeated addition, and multiplication arrays." },
  { level: 5, name: "Division Sharing", topic: "division", icon: "➗", grade: "Grades 3-4", desc: "Share items equally into treasure chests with remainders." },
  { level: 6, name: "Fractions Kingdom", topic: "fractions", icon: "🍕", grade: "Grades 4-5", desc: "Pizza slices, chocolate bars, and equivalent fractions." },
  { level: 7, name: "Decimals & Scale", topic: "decimals", icon: "📏", grade: "Grade 5", desc: "Tenths, hundredths, money prices, and number lines." },
  { level: 8, name: "Percentages & Deals", topic: "percentages", icon: "🏷️", grade: "Grades 5-6", desc: "Discounts, 100-grids, and everyday savings." },
  { level: 9, name: "Ratio & Proportion", topic: "ratios", icon: "⚪", grade: "Grade 6", desc: "Comparing quantities, ratio tables, and unit rates." },
  { level: 10, name: "Basic Algebra Balance", topic: "algebra", icon: "⚖️", grade: "Grades 6-7", desc: "Balance scales, finding unknown mystery x, and equations." },
  { level: 11, name: "Geometry, Area & Perimeter", topic: "geometry", icon: "📐", grade: "Grades 5-7", desc: "Borders, unit grids, triangles, and angle discovery." },
  { level: 12, name: "Real-World Shopping & Time", topic: "real_world", icon: "🛒", grade: "Grades 5-8", desc: "Budget planning, change calculations, and travel distance." },
  { level: 13, name: "Advanced Mixed Challenges", topic: "advanced", icon: "🏆", grade: "Challenger", desc: "Epic boss puzzles, multi-step word problems, and logic." },
];

export default function Welcome() {
  const { guestLogin, user, setUser, token } = useAuth();
  const navigate = useNavigate();
  const [guestLoading, setGuestLoading] = useState(false);
  const [selectedCharId, setSelectedCharId] = useState(user?.selectedCharacter?.id || "knight");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLevelModal, setShowLevelModal] = useState(false);

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate("/map");
    } catch (e) {
      console.error(e);
      alert("Could not start guest mode. Please check connection.");
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSelectCharacter = async (charKey) => {
    setSelectedCharId(charKey);
    if (user && setUser) {
      setUser((prev) => ({
        ...prev,
        selectedCharacter: {
          id: charKey,
          costume: prev?.selectedCharacter?.costume || "default",
          accessory: prev?.selectedCharacter?.accessory || "none",
          pet: prev?.selectedCharacter?.pet || "none",
        },
      }));

      // Persist to backend if token is available
      if (token) {
        try {
          await fetch("http://localhost:5000/api/game/character", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ characterId: charKey }),
          });
        } catch {
          // Fallback handled locally in state
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-slate-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Background ambient glowing orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/60 border border-purple-500/40 text-amber-300 text-xs sm:text-sm font-bold mb-6 shadow-lg shadow-purple-900/30">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin-slow" />
            <span>Magical Math Adventures • Teach Before Testing • Friendly for Beginners</span>
          </div>

          <h1 className="font-fredoka text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Learn Mathematics <br />
            <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Like Playing an Epic Game!
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Begin with absolute basics—count apples, slice pizzas, balance scales, and defeat magical math bosses alongside your friendly mentor <strong>Professor Pi</strong>!
          </p>

          {/* Professor Pi Animated Introduction Box */}
          <div className="mt-8 max-w-2xl mx-auto bg-gradient-to-r from-indigo-900/80 via-purple-900/70 to-slate-900/90 border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400/40 flex items-center justify-center text-4xl shrink-0 shadow-inner animate-bounce-subtle">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-fredoka uppercase">
                  Professor Pi
                </span>
                <span className="text-xs text-indigo-300 font-semibold">Your Cheerful Math Guide</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                "Hoo-ray! Don't worry if calculations felt scary before. Here, we teach every concept step by step with pictures, pizza slices, and zero penalties for asking for help!"
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 max-w-2xl mx-auto">
            {user ? (
              <>
                <Link
                  to="/map"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-fredoka text-lg font-extrabold shadow-lg shadow-amber-400/25 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>🗺️ Continue Adventure</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLevelModal(true)}
                  className="px-6 py-4 rounded-2xl bg-purple-700/80 hover:bg-purple-600 text-white font-fredoka text-base font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-105 flex items-center gap-2 border border-purple-500/40"
                >
                  <span>📚 Choose Learning Level</span>
                </button>
                <Link
                  to="/challenges/daily"
                  className="px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-fredoka text-base font-bold border border-slate-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Daily Quests</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-fredoka text-base font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>📊 My Progress</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={handleGuest}
                  disabled={guestLoading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-fredoka text-lg font-extrabold shadow-lg shadow-amber-400/25 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>{guestLoading ? "Summoning Hero..." : "🎮 Instant Play (No Login Required)"}</span>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLevelModal(true)}
                  className="px-6 py-4 rounded-2xl bg-purple-700/80 hover:bg-purple-600 text-white font-fredoka text-base font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-105 flex items-center gap-2 border border-purple-500/40"
                >
                  <span>📚 Choose Learning Level</span>
                </button>
                <Link
                  to="/login"
                  className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-fredoka text-base font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Student Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Character Selector Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900/80 border-2 border-purple-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Step 2: Choose Your Math Hero
            </span>
            <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-white mt-2">
              Select Your Adventure Champion
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Your chosen hero accompanies you into realms, boss fights, and multiplayer arenas!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {Object.values(CHARACTER_CLASSES).map((char) => {
              const isSelected = selectedCharId === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => handleSelectCharacter(char.id)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? "bg-gradient-to-b from-purple-800/80 to-indigo-900/90 border-amber-400 shadow-xl shadow-amber-400/20 scale-105"
                      : "bg-slate-800/40 border-slate-700/60 hover:border-slate-500 text-slate-300"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-950/60 border border-slate-700 flex items-center justify-center text-3xl shadow-inner mb-2">
                    {char.baseEmoji}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-fredoka">{char.name}</h3>
                    <p className="text-[10px] text-amber-300 font-semibold">{char.role}</p>
                    <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-2">
                      "{char.quote}"
                    </p>
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isSelected ? "Active Hero ✓" : "Select"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13 Beginner-Friendly Learning Levels Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Step 3: Structured 13-Level Learning Path
          </span>
          <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-white mt-2">
            Mathematics from Absolute Basics to Mastery
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Pick any level to start practicing right now—no forced locks for eager learners!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEARNING_LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
                    {lvl.icon}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      Level {lvl.level}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{lvl.grade}</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white font-fredoka">{lvl.name}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{lvl.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-amber-400">
                  Visual Interactive Available
                </span>
                <Link
                  to={`/practice/${lvl.topic}`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Level Picker Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h3 className="text-lg font-bold text-white font-fredoka">
                  Choose Your Learning Level
                </h3>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white font-bold"
                onClick={() => setShowLevelModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {LEARNING_LEVELS.map((lvl) => (
                <Link
                  key={lvl.level}
                  to={`/practice/${lvl.topic}`}
                  onClick={() => setShowLevelModal(false)}
                  className="p-3 rounded-xl bg-slate-800/70 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-400 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lvl.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-300">
                        Level {lvl.level}: {lvl.name}
                      </p>
                      <p className="text-xs text-slate-400">{lvl.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Start →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Math Adventure • Gamified Math Learning Platform for Beginners &amp; Explorers</p>
        <p className="mt-1">
          Server Source of Truth • Deterministic Fallbacks • 100% Child-Safe &amp; Ad-Free
        </p>
      </footer>
    </div>
  );
}

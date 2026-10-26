// client/src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Compass,
  BookOpen,
  Sparkles,
  Trophy,
  BarChart2,
  Bot,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Flame,
  Award,
} from "lucide-react";

export default function Navbar({ isAdventure = false }) {
  const { user, logout, t, language, toggleLanguage, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleGradeChange = async (newGrade) => {
    if (user && user.grade !== newGrade) {
      await updateProfile({ grade: newGrade });
      navigate(`/grades/${newGrade}/topics`);
    }
  };

  const navLinks = [
    { name: "Map", path: "/map", icon: Compass, id: "nav-map" },
    { name: "Real-World", path: "/real-world", icon: Sparkles, id: "nav-real-world" },
    { name: "Arena", path: "/arena", icon: Trophy, id: "nav-arena" },
    { name: "Daily", path: "/challenges/daily", icon: Flame, id: "nav-daily" },
    { name: "Armory", path: "/shop", icon: Sparkles, id: "nav-shop" },
    { name: "Ranks", path: "/leaderboard", icon: Award, id: "nav-leaderboard" },
    { name: "Formulas", path: "/learning-center", icon: BookOpen, id: "nav-learning", wideOnly: true },
    { name: t("tutor") || "AI Tutor", path: "/tutor", icon: Bot, id: "nav-tutor" },
    { name: t("dashboard") || "Dashboard", path: "/dashboard", icon: BarChart2, id: "nav-dashboard", wideOnly: true },
  ];

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur border-b transition-colors ${
        isAdventure
          ? "bg-slate-900/95 border-slate-800 text-slate-100 shadow-md"
          : "bg-white/95 border-indigo-100 text-slate-800 shadow-xs"
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 xl:gap-4">
          
          {/* Left: Brand Logo + Nav Links */}
          <div className="flex items-center gap-2 xl:gap-4 min-w-0">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center font-fredoka text-amber-400 text-base font-bold">
                  ∑★
                </div>
              </div>
              <span className={`font-fredoka text-base sm:text-lg xl:text-xl font-bold bg-clip-text text-transparent whitespace-nowrap ${
                isAdventure
                  ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400"
                  : "bg-gradient-to-r from-indigo-700 via-indigo-600 to-amber-600"
              }`}>
                Math Adventure
              </span>
            </Link>

            {/* Desktop Nav Items */}
            {user && (
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.id}
                      id={item.id}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all ${
                        item.wideOnly ? "hidden xl:flex" : ""
                      } ${
                        active
                          ? isAdventure
                            ? "bg-slate-800 text-amber-300 border border-slate-700 shadow-xs"
                            : "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200"
                          : isAdventure
                            ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                            : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? (isAdventure ? "text-amber-400" : "text-indigo-600") : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {user ? (
            <>
              {/* Stats Bar and User Pill */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                
                {/* Grade Switcher */}
                <div className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${
                  isAdventure ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                }`}>
                  <button
                    id="btn-nav-grade-5"
                    onClick={() => handleGradeChange(5)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      user.grade === 5
                        ? "bg-indigo-600 text-white shadow-xs"
                        : isAdventure ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-indigo-600"
                    }`}
                  >
                    G5
                  </button>
                  <button
                    id="btn-nav-grade-6"
                    onClick={() => handleGradeChange(6)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      user.grade === 6
                        ? "bg-indigo-600 text-white shadow-xs"
                        : isAdventure ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-indigo-600"
                    }`}
                  >
                    G6
                  </button>
                </div>

                {/* Coins Pill */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold shadow-xs ${
                  isAdventure
                    ? "bg-amber-950/70 border-amber-500/40 text-amber-300"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}>
                  <span>🪙</span>
                  <span id="nav-user-coins">{user.totalCoins || 0}</span>
                </div>

                {/* Points / Stars Pill */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold shadow-xs ${
                  isAdventure
                    ? "bg-yellow-950/70 border-yellow-500/40 text-yellow-300"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <span className="text-amber-400">⭐</span>
                  <span id="nav-user-points">{user.totalStars || user.totalPoints || 0}</span>
                </div>

                {/* Streak Pill */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold shadow-xs ${
                  isAdventure
                    ? "bg-orange-950/70 border-orange-500/40 text-orange-300"
                    : "bg-orange-50 border-orange-200 text-orange-800"
                }`}>
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
                  <span id="nav-user-streak">{user.currentStreak || 0}d</span>
                </div>

                {/* Language Switcher */}
                <button
                  id="btn-nav-language"
                  onClick={() => toggleLanguage()}
                  className={`px-2 py-1 rounded-xl border text-xs font-bold transition-colors ${
                    isAdventure
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Switch Language"
                >
                  {language === "en" ? "தமிழ்" : "EN"}
                </button>

                {/* Settings & Avatar */}
                <Link
                  id="nav-settings"
                  to="/settings"
                  className={`p-1.5 rounded-xl transition-colors ${
                    isAdventure
                      ? "text-slate-300 hover:text-white hover:bg-slate-800"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                  title="Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Link>

                <div className={`flex items-center gap-2 pl-2 border-l ${isAdventure ? "border-slate-800" : "border-slate-200"}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <button
                    id="btn-nav-logout"
                    onClick={logout}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-2 lg:hidden">
                {/* Mobile Points */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                  <span>⭐</span>
                  <span>{user.totalPoints || 0}</span>
                </div>

                <button
                  id="btn-mobile-menu-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          ) : (
            /* Guest / Visitor Header */
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLanguage()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                {language === "en" ? "தமிழ்" : "English"}
              </button>
              <Link
                id="btn-nav-login"
                to="/login"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                {t("login")}
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => {
                handleGradeChange(5);
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center font-bold text-sm ${
                user.grade === 5 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Grade 5
            </button>
            <button
              onClick={() => {
                handleGradeChange(6);
                setMobileMenuOpen(false);
              }}
              className={`py-2 rounded-xl text-center font-bold text-sm ${
                user.grade === 6 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              Grade 6
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold ${
                    isActive(item.path)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5 text-indigo-600" />
                  {item.name}
                </Link>
              );
            })}
            <Link
              to="/parent-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Award className="w-5 h-5 text-emerald-600" />
              <span>🛡️ Parent/Teacher Console</span>
            </Link>
            <Link
              to="/placement"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>⭐ Placement Quiz</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50"
            >
              <SettingsIcon className="w-5 h-5 text-indigo-600" />
              {t("settings")}
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="font-bold text-sm text-slate-800">{user.name}</span>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="text-red-500 font-bold text-sm flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

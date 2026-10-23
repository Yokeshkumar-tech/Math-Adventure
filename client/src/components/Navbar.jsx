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

export default function Navbar() {
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
    { name: t("dashboard"), path: "/dashboard", icon: Compass, id: "nav-dashboard" },
    { name: t("topics"), path: user ? `/grades/${user.grade || 5}/topics` : "/grades", icon: BookOpen, id: "nav-topics" },
    { name: t("achievements"), path: "/achievements", icon: Trophy, id: "nav-achievements" },
    { name: t("progress"), path: "/progress", icon: BarChart2, id: "nav-progress" },
    { name: t("tutor"), path: "/tutor", icon: Bot, id: "nav-tutor" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-indigo-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center font-fredoka text-indigo-600 text-xl font-bold">
                ∑★
              </div>
            </div>
            <div>
              <span className="font-fredoka text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                Math Adventure
              </span>
              <span className="hidden sm:block text-[11px] font-medium text-indigo-400 tracking-wide uppercase">
                Grades 5 &amp; 6
              </span>
            </div>
          </Link>

          {/* User Logged In Header Elements */}
          {user ? (
            <>
              {/* Desktop Nav Items */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.id}
                      id={item.id}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200"
                          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Stats Bar and User Pill */}
              <div className="hidden md:flex items-center gap-3">
                
                {/* Grade Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    id="btn-nav-grade-5"
                    onClick={() => handleGradeChange(5)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      user.grade === 5
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-indigo-600"
                    }`}
                  >
                    G5
                  </button>
                  <button
                    id="btn-nav-grade-6"
                    onClick={() => handleGradeChange(6)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      user.grade === 6
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-indigo-600"
                    }`}
                  >
                    G6
                  </button>
                </div>

                {/* Points Pill */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs sm:text-sm shadow-xs">
                  <span className="text-amber-500">⭐</span>
                  <span id="nav-user-points">{user.totalPoints || 0}</span>
                  <span className="hidden xl:inline text-amber-600 font-normal">pts</span>
                </div>

                {/* Streak Pill */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs sm:text-sm shadow-xs">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                  <span id="nav-user-streak">{user.currentStreak || 0}</span>
                  <span className="hidden xl:inline text-orange-600 font-normal">d</span>
                </div>

                {/* Language Switcher */}
                <button
                  id="btn-nav-language"
                  onClick={() => toggleLanguage()}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Switch Language"
                >
                  {language === "en" ? "தமிழ்" : "EN"}
                </button>

                {/* Settings & Avatar */}
                <Link
                  id="nav-settings"
                  to="/settings"
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  title="Settings"
                >
                  <SettingsIcon className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-xs border-2 border-white">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <button
                    id="btn-nav-logout"
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Log Out"
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

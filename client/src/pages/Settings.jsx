// client/src/pages/Settings.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Settings as SettingsIcon, Eye, Globe, User, Shield, Check, LogOut } from "lucide-react";

const AVATARS = [
  { id: "math-explorer", emoji: "🧭", label: "Explorer" },
  { id: "rocket-math", emoji: "🚀", label: "Rocket" },
  { id: "wizard", emoji: "🧙‍♂️", label: "Wizard" },
  { id: "dino-genius", emoji: "🦖", label: "Dino" },
  { id: "star-counter", emoji: "⭐", label: "Star" },
  { id: "robot-calc", emoji: "🤖", label: "Robot" },
];

export default function Settings() {
  const { user, updateProfile, toggleLanguage, logout, t } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "math-explorer");
  const [grade, setGrade] = useState(user?.grade || 5);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user?.showOnLeaderboard || false);
  const [fontScale, setFontScale] = useState(user?.settings?.fontScale || 1);
  const [highContrast, setHighContrast] = useState(user?.settings?.highContrast || false);
  const [language, setLanguage] = useState(user?.settings?.language || "en");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        displayName,
        avatar,
        grade: Number(grade),
        showOnLeaderboard,
        settings: {
          fontScale,
          highContrast,
          language,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error updating settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="font-fredoka text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-600" />
          <span>Profile &amp; Accessibility Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your character, adjust contrast and text sizing, and set your preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Adventurer Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Leaderboard Nickname (Child Safe)
              </label>
              <input
                id="input-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. StarChampion"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Active Grade Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGrade(5)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    grade === 5
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Grade 5
                </button>
                <button
                  type="button"
                  onClick={() => setGrade(6)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    grade === 6
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Grade 6
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Character Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.id)}
                  className={`h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                    avatar === av.id
                      ? "bg-indigo-100 border-2 border-indigo-600 scale-105 shadow-xs"
                      : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
                  }`}
                  title={av.label}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Opt-In Checkbox */}
          <div className="pt-2 flex items-center gap-3">
            <input
              id="checkbox-leaderboard"
              type="checkbox"
              checked={showOnLeaderboard}
              onChange={(e) => setShowOnLeaderboard(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="checkbox-leaderboard" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Show my nickname and avatar on the friendly weekly leaderboard (Opt-in)
            </label>
          </div>
        </div>

        {/* Accessibility & Display Settings */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>Accessibility &amp; Visual Comfort</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Font Scale Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Text Size (Font Scale):</span>
                <span>{fontScale === 1 ? "Normal (16px)" : fontScale === 1.15 ? "Large (18px)" : "Extra Large (21px)"}</span>
              </div>
              <input
                id="slider-font-scale"
                type="range"
                min="1"
                max="1.3"
                step="0.15"
                value={fontScale}
                onChange={(e) => setFontScale(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>Normal</span>
                <span>Large</span>
                <span>Extra Large</span>
              </div>
            </div>

            {/* High Contrast Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-xs text-slate-800 block">
                  High Contrast Mode
                </span>
                <span className="text-[11px] text-slate-500">
                  Enhanced border &amp; text visibility
                </span>
              </div>
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                  highContrast ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200/90 shadow-xs space-y-3">
          <h3 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <span>Multilingual Language Setting</span>
          </h3>
          <p className="text-xs text-slate-500">
            Choose your preferred platform language:
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                toggleLanguage("en");
              }}
              className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                language === "en"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("ta");
                toggleLanguage("ta");
              }}
              className={`py-3 rounded-2xl text-xs font-bold border transition-all font-tamil ${
                language === "ta"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <button
            id="btn-save-settings"
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-base shadow-md shadow-indigo-300 transition-all hover:scale-102"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>

    </div>
  );
}

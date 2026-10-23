// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, ArrowRight, ShieldCheck, Check } from "lucide-react";

const AVATARS = [
  { id: "math-explorer", emoji: "🧭", label: "Explorer" },
  { id: "rocket-math", emoji: "🚀", label: "Rocket" },
  { id: "wizard", emoji: "🧙‍♂️", label: "Wizard" },
  { id: "dino-genius", emoji: "🦖", label: "Dino" },
  { id: "star-counter", emoji: "⭐", label: "Star" },
  { id: "robot-calc", emoji: "🤖", label: "Robot" },
];

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState(5);
  const [avatar, setAvatar] = useState("math-explorer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, guestLogin, t } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, username, password, grade, avatar });
      } else {
        await login(username, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Oops! Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setLoading(true);
    try {
      await guestLogin();
      navigate("/dashboard");
    } catch (err) {
      setError("Could not launch demo guest session.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoPriya = () => {
    setIsRegister(false);
    setUsername("priya");
    setPassword("champion123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl max-w-md w-full p-6 sm:p-8 relative">
        
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-400 text-white font-fredoka font-bold text-xl flex items-center justify-center shadow-md">
              ∑
            </span>
            <span className="font-fredoka text-2xl font-bold text-slate-800">
              Math Adventure
            </span>
          </Link>
          <h2 className="font-fredoka text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {isRegister ? "Join the Adventure!" : "Welcome Back, Champion!"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegister ? "Create your math profile to start earning badges" : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            id="tab-login"
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError("");
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              !isRegister
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError("");
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isRegister
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username
            </label>
            <input
              id="input-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. priya or mathstar"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              id="input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          {isRegister && (
            <>
              {/* Grade Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Grade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGrade(5)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      grade === 5
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Grade 5
                  </button>
                  <button
                    type="button"
                    onClick={() => setGrade(6)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      grade === 6
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Grade 6
                  </button>
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Your Character Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
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
            </>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka text-base font-bold shadow-md shadow-indigo-300 transition-all hover:scale-102 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Connecting..." : isRegister ? "Create Adventure Account" : "Sign In to Adventure"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Demo Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
          <button
            id="btn-login-guest"
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-fredoka font-bold text-sm shadow-xs transition-all hover:scale-102 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try as Guest (Instant Reviewer Demo)</span>
          </button>

          {!isRegister && (
            <button
              id="btn-prefill-priya"
              type="button"
              onClick={fillDemoPriya}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              Prefill Student Demo Account (Priya: champion123)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

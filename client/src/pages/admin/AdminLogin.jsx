// client/src/pages/admin/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuth } from "../../services/adminApi.js";
import { Shield, Lock, User, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function AdminLogin() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please provide username/email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await adminAuth.login(identifier, password);
      localStorage.setItem("math_admin_token", res.token);
      localStorage.setItem("math_admin_user", JSON.stringify(res.admin));
      navigate("/admin/overview");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-slate-950 to-black text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-3 mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30">
            🛡️
          </div>
          <h1 className="font-fredoka text-2xl font-bold text-white">
            Math Adventure Admin Console
          </h1>
          <p className="text-xs text-slate-400">
            Secure curriculum, game engine, and player management system
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-login-id"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="superadmin or admin@mathadventure.com"
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-login-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            id="btn-admin-submit-login"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-fredoka font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Authenticating..." : "Enter Admin Console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Credentials Autofill */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Quick Fill Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => autofill("superadmin", "AdminMaster2026!")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-indigo-300 border border-slate-700 transition-all"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => autofill("contentadmin", "ContentPro2026!")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-purple-300 border border-slate-700 transition-all"
            >
              Content Admin
            </button>
            <button
              type="button"
              onClick={() => autofill("teachermath", "TeacherStar2026!")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 border border-slate-700 transition-all"
            >
              Teacher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

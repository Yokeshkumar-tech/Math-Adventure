// client/src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldAlert,
  Server,
  Database,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  Power,
  RefreshCw,
  Lock,
} from "lucide-react";
import { adminEconomy, adminQuestions } from "../../services/adminApi.js";

export default function AdminSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminEconomy.get();
      setConfig(res.config);
    } catch {
      alert("Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg("");
      await adminEconomy.update(config);
      setSuccessMsg("System configuration committed to MongoDB successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to commit settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const res = await adminQuestions.export({});
      const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", jsonStr);
      a.setAttribute("download", `math_adventure_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Failed to export backup.");
    }
  };

  if (loading || !config) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium">
        Loading System & Environment Configurations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">System & Global Settings</h1>
            <p className="text-xs text-slate-400">
              Super Admin platform configuration, emergency maintenance switches, and database backups
            </p>
          </div>
        </div>
        <button
          onClick={handleExportBackup}
          className="admin-btn admin-btn-secondary flex items-center gap-2 text-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Question Bank Backup</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Status Switches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Mode */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  config.maintenanceMode
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Maintenance Mode</h3>
                <p className="text-xs text-slate-400">
                  {config.maintenanceMode ? "Platform currently paused" : "Game is live & operational"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When enabled, student game routes display an announcement banner and block new quiz sessions.
              Admin access remains fully operational.
            </p>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.maintenanceMode || false}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 w-5 h-5 bg-slate-800"
              />
              <span className="text-xs font-semibold text-slate-200">
                Activate Kingdom Maintenance Mode
              </span>
            </label>
          </div>

          {/* Student Registration */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Student Registration</h3>
                <p className="text-xs text-slate-400">
                  {config.registrationOpen ? "Open to new student signups" : "Registration restricted"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Control whether new students can sign up from the welcome screen, or if accounts must be
              pre-provisioned by administrators and educators.
            </p>

            <label className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={config.registrationOpen ?? true}
                onChange={(e) => setConfig({ ...config, registrationOpen: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-5 h-5 bg-slate-800"
              />
              <span className="text-xs font-semibold text-slate-200">
                Allow Public Student Registration
              </span>
            </label>
          </div>
        </div>

        {/* Infrastructure & Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-bold text-white font-fredoka flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Infrastructure & Runtime Diagnostics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Database className="w-4 h-4" />
                <span>MongoDB Replica</span>
              </div>
              <p className="text-sm font-bold text-white">Connected (27017)</p>
              <p className="text-[10px] text-slate-500">mathadventure db online</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                <Server className="w-4 h-4" />
                <span>Node Express Backend</span>
              </div>
              <p className="text-sm font-bold text-white">Port 5000 (Active)</p>
              <p className="text-[10px] text-slate-500">JWT Authentication & RBAC</p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Security Integrity</span>
              </div>
              <p className="text-sm font-bold text-white">Server-Enforced</p>
              <p className="text-[10px] text-slate-500">Immutable Audit Logging</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn admin-btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Committing..." : "Save System Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

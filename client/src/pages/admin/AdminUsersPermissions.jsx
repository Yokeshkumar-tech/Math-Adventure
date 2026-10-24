// client/src/pages/admin/AdminUsersPermissions.jsx
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  Mail,
  User,
  AlertTriangle,
} from "lucide-react";
import { adminUsers } from "../../services/adminApi.js";

const ALL_PERMISSIONS = [
  { key: "manage_questions", label: "Manage Questions", desc: "Create, edit, and duplicate questions" },
  { key: "publish_content", label: "Publish Content", desc: "Publish questions and quizzes to live game" },
  { key: "manage_quizzes", label: "Manage Quizzes", desc: "Assemble and configure quizzes" },
  { key: "manage_realms", label: "Manage Realms & Missions", desc: "Edit star requirements and boss battles" },
  { key: "manage_players", label: "Manage Players", desc: "View student directory and suspend accounts" },
  { key: "manage_economy", label: "Manage Economy", desc: "Adjust coin rewards, XP rules, and shop pricing" },
  { key: "view_analytics", label: "View Analytics", desc: "Access dashboards, diagnosis, and reports" },
  { key: "manage_announcements", label: "Manage Announcements", desc: "Broadcast kingdom notices" },
];

export default function AdminUsersPermissions() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "content_admin",
    permissions: ["manage_questions", "publish_content", "view_analytics"],
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUsers.list();
      setAdmins(res.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTogglePerm = (permKey) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permKey)
          : [...prev.permissions, permKey],
      };
    });
  };

  const handleRoleChange = (newRole) => {
    let perms = [];
    if (newRole === "superadmin") {
      perms = ALL_PERMISSIONS.map((p) => p.key);
    } else if (newRole === "content_admin") {
      perms = ["manage_questions", "publish_content", "manage_quizzes", "manage_realms", "view_analytics"];
    } else if (newRole === "reviewer" || newRole === "teacher") {
      perms = ["manage_questions", "view_analytics"];
    }
    setForm({ ...form, role: newRole, permissions: perms });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminUsers.create(form);
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create administrator.");
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === "active" ? "suspended" : "active";
    if (!window.confirm(`Are you sure you want to mark this admin account as ${newStatus}?`)) {
      return;
    }
    try {
      await adminUsers.update(admin._id, { status: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update account status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">
              Admin Users & Access Control
            </h1>
            <p className="text-xs text-slate-400">
              Manage administrative staff, configure role-based access permissions, and revoke privileges
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="admin-btn admin-btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Administrator</span>
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Loading administrative accounts...
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full text-left">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Last Login</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                          {u.username?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.username}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {u.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase ${
                          u.role === "superadmin"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : u.role === "content_admin"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="whitespace-nowrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 w-fit ${
                          u.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {u.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span className="capitalize">{u.status || "active"}</span>
                      </span>
                    </td>

                    <td className="text-xs text-slate-300 max-w-xs">
                      {u.role === "superadmin" ? (
                        <span className="text-purple-300 font-semibold">
                          ★ Full Unrestricted Authority
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(u.permissions || []).map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap text-xs text-slate-400">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never logged in"}
                    </td>

                    <td className="whitespace-nowrap text-right">
                      {u.role !== "superadmin" && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            u.status === "active"
                              ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                              : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Administrator Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-fredoka">
                  Create Administrator Account
                </h2>
                <p className="text-xs text-slate-400">
                  Provision new credentials and assign role-based permissions
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. math_curator"
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@school.org"
                    className="admin-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrative Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="admin-select w-full"
                  >
                    <option value="content_admin">Content Admin (Author & Publish)</option>
                    <option value="reviewer">Reviewer / Teacher (Review & Edit)</option>
                    <option value="superadmin">Super Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Granular Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          form.role === "superadmin" || form.permissions.includes(perm.key)
                        }
                        disabled={form.role === "superadmin"}
                        onChange={() => handleTogglePerm(perm.key)}
                        className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5 bg-slate-800"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{perm.label}</p>
                        <p className="text-[10px] text-slate-400">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
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
                  Create Admin User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

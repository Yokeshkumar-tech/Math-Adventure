// client/src/pages/admin/AdminAnnouncements.jsx
import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { adminAnnouncements } from "../../services/adminApi.js";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "general",
    priority: "normal",
    active: true,
    expiresAt: "",
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await adminAnnouncements.list();
      setAnnouncements(res.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      message: "",
      category: "general",
      priority: "normal",
      active: true,
      expiresAt: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingId(ann._id);
    setForm({
      title: ann.title,
      message: ann.message,
      category: ann.category || "general",
      priority: ann.priority || "normal",
      active: ann.active ?? true,
      expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminAnnouncements.update(editingId, form);
      } else {
        await adminAnnouncements.create(form);
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await adminAnnouncements.delete(id);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  const filtered = announcements.filter((a) => {
    const matchesCat = filterCategory === "all" || a.category === filterCategory;
    const matchesSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.message?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">Kingdom Announcements</h1>
            <p className="text-xs text-slate-400">
              Broadcast realm news, tournament updates, maintenance notices, and events to players
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="admin-btn admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcement titles or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-select w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="event">Event / Tournament</option>
            <option value="reward">Rewards & Drops</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Loading broadcasts...</div>
      ) : error ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-bold mb-1">No announcements found</p>
          <p className="text-xs text-slate-500 mb-4">Create your first broadcast to notify students</p>
          <button onClick={handleOpenCreate} className="admin-btn admin-btn-secondary text-xs">
            Create Announcement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      item.priority === "urgent"
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        : item.priority === "high"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-blue-500/20 text-blue-400 border-blue-500/40"
                    }`}
                  >
                    {item.priority} priority • {item.category}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      item.active
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {item.active ? "● Active in Game" : "○ Inactive"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {item.message}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white font-fredoka">
              {editingId ? "Edit Announcement" : "Create Kingdom Announcement"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Geometry Titan Arena Opens This Weekend!"
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter the broadcast message that players will see on their dashboard..."
                  className="admin-textarea w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="admin-select w-full"
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="reward">Reward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="admin-select w-full"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-800"
                />
                <label htmlFor="activeCheck" className="text-xs text-slate-300 font-medium">
                  Publish announcement immediately to student feed
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn admin-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary text-xs">
                  {editingId ? "Save Changes" : "Create Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

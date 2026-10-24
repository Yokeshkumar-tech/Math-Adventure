// client/src/pages/admin/AdminQuestionBank.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminQuestions } from "../../services/adminApi.js";
import MathRenderer from "../../components/MathRenderer.jsx";
import GeometryDiagram from "../../components/game/GeometryDiagram.jsx";
import {
  Search,
  Filter,
  Plus,
  Upload,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ topics: [], realms: [] });

  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedRealm, setSelectedRealm] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  const loadQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminQuestions.list({
        page,
        limit: 15,
        search,
        topic: selectedTopic,
        realm: selectedRealm,
        difficulty: selectedDifficulty,
        status: selectedStatus,
      });
      setQuestions(res.questions || []);
      setPagination(res.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      if (res.filters) setFilters(res.filters);
    } catch (err) {
      console.error("Error loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
  }, [selectedTopic, selectedRealm, selectedDifficulty, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQuestions(1);
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminQuestions.togglePublish(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: res.question.status } : q))
      );
    } catch (err) {
      alert("Failed to toggle publication status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminQuestions.delete(id);
      setDeleteConfirmId(null);
      loadQuestions(pagination.page);
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  const handleDuplicate = async (q) => {
    try {
      const copyData = {
        title: `${q.title || q.topic} (Copy)`,
        question: `${q.question} (Copy)`,
        topic: q.topic,
        realm: q.realm,
        grade: q.grade,
        difficulty: q.difficulty,
        answerType: q.answerType || "multiple_choice",
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        hint: q.hint,
        hints: q.hints,
        points: q.points,
        status: "draft",
      };
      await adminQuestions.create(copyData);
      loadQuestions(1);
    } catch (err) {
      alert("Failed to duplicate question.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Question Bank &amp; Curriculum</span>
            <span className="text-xl">📚</span>
          </h1>
          <p className="text-xs text-slate-400">
            {pagination.total} total mathematical challenges in the game bank
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/questions/upload"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload</span>
          </Link>
          <Link
            to="/admin/questions/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question text, topic, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Topic filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="all">All Topics</option>
              {filters.topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy (10 XP)</option>
              <option value="medium">Medium (20 XP)</option>
              <option value="hard">Hard (30 XP)</option>
              <option value="boss">Boss Challenge</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published (In-Game)</option>
              <option value="draft">Draft</option>
              <option value="review">Under Review</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedTopic("all");
                setSelectedRealm("all");
                setSelectedDifficulty("all");
                setSelectedStatus("all");
              }}
              className="w-full p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Question</th>
                <th>Topic &amp; Realm</th>
                <th>Difficulty</th>
                <th>Options &amp; Key</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading question bank...</span>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No questions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isPublished = q.status === "published";
                  return (
                    <tr key={q._id}>
                      {/* Question Text */}
                      <td>
                        <div className="font-semibold text-slate-100 line-clamp-2">
                          <MathRenderer content={q.question} />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Grade {q.grade || 5}</span>
                          <span>•</span>
                          <span>v{q.version || 1}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-bold">⭐ {q.points || 10} XP</span>
                        </div>
                      </td>

                      {/* Topic & Realm */}
                      <td>
                        <div className="font-bold text-slate-200 text-xs">{q.topic}</div>
                        <div className="text-[11px] text-slate-400">{q.realm || "General Pool"}</div>
                      </td>

                      {/* Difficulty Badge */}
                      <td>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.difficulty === "hard"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : q.difficulty === "medium"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>

                      {/* Answer Key */}
                      <td>
                        <div className="text-xs font-semibold text-emerald-400">
                          Key: {q.correctAnswer}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {q.options?.length || 0} choices
                        </div>
                      </td>

                      {/* Publication Status */}
                      <td>
                        <button
                          onClick={() => handleTogglePublish(q._id)}
                          className={`badge-status cursor-pointer ${q.status || "published"}`}
                          title="Click to toggle published / draft state"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                          />
                          <span>{q.status || "published"}</span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Student Preview Modal trigger */}
                          <button
                            onClick={() => setPreviewQuestion(q)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Preview question as student"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(q)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Duplicate question"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <Link
                            to={`/admin/questions/edit/${q._id}`}
                            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white"
                            title="Edit question"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmId(q._id)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white"
                            title="Delete question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
            {pagination.total} questions)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadQuestions(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => loadQuestions(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          STUDENT PREVIEW MODAL
          ======================================================== */}
      {previewQuestion && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewQuestion(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Student Arena Preview</span>
                <span className="text-slate-500">•</span>
                <span>{previewQuestion.topic}</span>
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Question Text */}
            <h3 className="font-fredoka text-xl font-bold text-white">
              <MathRenderer content={previewQuestion.question} />
            </h3>

            {/* Diagram */}
            <GeometryDiagram
              diagramSvg={previewQuestion.diagramSvg}
              topic={previewQuestion.topic}
              questionText={previewQuestion.question}
            />

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {previewQuestion.options?.map((opt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between ${
                    opt === previewQuestion.correctAnswer
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-950 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>
                      <MathRenderer content={opt} />
                    </span>
                  </div>
                  {opt === previewQuestion.correctAnswer && (
                    <span className="text-xs text-emerald-400 font-bold">✓ Correct Key</span>
                  )}
                </div>
              ))}
            </div>

            {/* Explanation & Hint */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-amber-300">💡 Step-by-Step Explanation:</div>
              <p className="text-slate-300 leading-relaxed font-sans">
                <MathRenderer content={previewQuestion.explanation} />
              </p>
              {previewQuestion.hint && (
                <div className="text-slate-400 pt-1 border-t border-slate-800/80">
                  <strong>Hint Clue:</strong> {previewQuestion.hint}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl text-rose-500">⚠️</div>
            <h3 className="font-fredoka text-lg font-bold text-white">Delete Question?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this question? This action will remove it from future quizzes.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

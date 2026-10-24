// client/src/pages/admin/AdminQuizBuilder.jsx
import React, { useState, useEffect } from "react";
import { adminQuizzes, adminQuestions } from "../../services/adminApi.js";
import {
  BookOpenCheck,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Shuffle,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdminQuizBuilder() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "Fractions",
    realm: "Fraction Kingdom",
    grade: 5,
    difficulty: "medium",
    durationMinutes: 15,
    passThresholdPercent: 60,
    randomizeOrder: true,
    questionIds: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, qRes] = await Promise.all([
        adminQuizzes.list(),
        adminQuestions.list({ limit: 50 }),
      ]);
      setQuizzes(quizRes.quizzes || []);
      setQuestions(qRes.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await adminQuizzes.create(formData);
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      alert("Failed to create quiz: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleQuestionSelection = (qId) => {
    setFormData((prev) => {
      const exists = prev.questionIds.includes(qId);
      const updated = exists ? prev.questionIds.filter((id) => id !== qId) : [...prev.questionIds, qId];
      return { ...prev, questionIds: updated };
    });
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      await adminQuizzes.delete(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fredoka text-2xl font-bold text-white flex items-center gap-2">
            <span>Quiz &amp; Trial Builder</span>
            <span className="text-xl">🏆</span>
          </h1>
          <p className="text-xs text-slate-400">
            Construct tailored quizzes, assign questions, set time limits and pass criteria
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assemble New Quiz</span>
        </button>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-bold">
                  {quiz.topic}
                </span>
                <span className="text-slate-400 font-semibold">{quiz.realm}</span>
              </div>
              <h3 className="font-fredoka text-lg font-bold text-white">{quiz.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{quiz.description || "Mathematics trial"}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>{quiz.questionIds?.length || 0} Questions</span>
              <span>{quiz.durationMinutes} Mins</span>
              <span>Pass: {quiz.passThresholdPercent}%</span>
              <button
                onClick={() => handleDeleteQuiz(quiz._id)}
                className="text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-fredoka text-xl font-bold text-white">Assemble New Quiz</h3>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Fraction Fortress Mastery Trial"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Realm</label>
                  <input
                    type="text"
                    value={formData.realm}
                    onChange={(e) => setFormData({ ...formData, realm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pass %</label>
                  <input
                    type="number"
                    value={formData.passThresholdPercent}
                    onChange={(e) => setFormData({ ...formData, passThresholdPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Order</label>
                  <select
                    value={formData.randomizeOrder}
                    onChange={(e) => setFormData({ ...formData, randomizeOrder: e.target.value === "true" })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="true">Randomized</option>
                    <option value="false">Fixed Order</option>
                  </select>
                </div>
              </div>

              {/* Question Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Assign Questions ({formData.questionIds.length} Selected)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950">
                  {questions.map((q) => {
                    const isSelected = formData.questionIds.includes(q._id);
                    return (
                      <div
                        key={q._id}
                        onClick={() => toggleQuestionSelection(q._id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                          isSelected ? "bg-indigo-600/20 border-indigo-500 text-white" : "border-slate-800 text-slate-400"
                        }`}
                      >
                        <span className="truncate pr-2">{q.question}</span>
                        <span className="shrink-0 font-bold">{isSelected ? "✓ Added" : "+ Add"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// client/src/pages/admin/AdminAiQuestionGenerator.jsx
import React, { useState } from "react";
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  RefreshCw,
  Plus,
  BookOpen,
  Send,
  HelpCircle,
  Lightbulb,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer.jsx";
import { adminAi, adminQuestions } from "../../services/adminApi.js";

export default function AdminAiQuestionGenerator() {
  const [topic, setTopic] = useState("fractions");
  const [gradeLevel, setGradeLevel] = useState("Grade 5");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(3);
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [scenarioContext, setScenarioContext] = useState(
    "Fantasy kingdom quest with wizard potion ingredients and dragon hoard gold"
  );
  const [learningObjective, setLearningObjective] = useState(
    "Finding common denominators and adding improper fractions with real-world context"
  );

  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedStatus({});

    try {
      const res = await adminAi.generate({
        topic,
        gradeLevel,
        difficulty,
        count: Number(questionCount),
        questionType,
        scenarioContext,
        learningObjective,
      });

      if (res && res.questions) {
        setGeneratedQuestions(res.questions);
      } else {
        setError("No questions generated. Please try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "AI generation encountered an issue. Using deterministic math generator fallback."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = async (q, index, status = "draft") => {
    try {
      setSavedStatus((prev) => ({ ...prev, [index]: "saving" }));

      const payload = {
        title: q.title || `${topic.toUpperCase()} AI Challenge`,
        questionText: q.questionText || q.question,
        topic,
        realm: q.realm || "Number Forest",
        difficulty,
        gradeLevel,
        questionType,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Step-by-step mathematical reasoning.",
        hint: q.hint || "Think about the foundational formula.",
        formula: q.formula || "",
        stepByStep: q.stepByStep || [],
        points: q.points || 15,
        xpReward: q.xpReward || 10,
        status, // 'draft' or 'published'
      };

      await adminQuestions.create(payload);
      setSavedStatus((prev) => ({ ...prev, [index]: status }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save question to bank.");
      setSavedStatus((prev) => ({ ...prev, [index]: "error" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-fredoka">
                AI Question Forge
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase tracking-wide">
                GPT-4o & Deterministic Verification
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Generate curriculum-aligned math problems with fantasy RPG scenarios, LaTeX equations, and validated answer keys.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg h-fit space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-fredoka">
            <Wand2 className="w-4 h-4 text-purple-400" />
            Generation Parameters
          </h2>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mathematics Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="admin-select w-full"
              >
                <option value="fractions">Fractions & Mixed Numbers</option>
                <option value="algebra">Pre-Algebra & Equations</option>
                <option value="geometry">Geometry, Area & Angles</option>
                <option value="percentages">Percentages & Ratios</option>
                <option value="decimals">Decimals & Measurement</option>
                <option value="probability">Probability & Statistics</option>
                <option value="real_world">Real-World Financial Math</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="admin-select w-full"
                >
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="admin-select w-full"
                >
                  <option value="easy">Easy (Foundations)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="hard">Hard (Challenger)</option>
                  <option value="boss">Boss Level (Epic)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Question Format
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  className="admin-select w-full"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="numeric">Numeric Answer</option>
                  <option value="true_false">True / False</option>
                  <option value="word_problem">Word Problem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Batch Quantity
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="admin-select w-full"
                >
                  <option value="1">1 Question</option>
                  <option value="2">2 Questions</option>
                  <option value="3">3 Questions</option>
                  <option value="5">5 Questions</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                World / Fantasy Scenario Context
              </label>
              <textarea
                rows={2}
                value={scenarioContext}
                onChange={(e) => setScenarioContext(e.target.value)}
                placeholder="e.g. Enchanted forest shopkeeper selling elixirs"
                className="admin-textarea w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curriculum Learning Objective
              </label>
              <textarea
                rows={2}
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="e.g. Master least common multiples for fraction addition"
                className="admin-textarea w-full text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Math Problems...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Forge Questions with AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-fredoka">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Generated Problems ({generatedQuestions.length})
            </h2>
            {generatedQuestions.length > 0 && (
              <span className="text-xs text-slate-400">
                Review equations & verify answers before publishing
              </span>
            )}
          </div>

          {error && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Generating Mathematical Rigor...</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Validating fraction operations, formatting KaTeX notation, and drafting step-by-step explanations.
              </p>
            </div>
          ) : generatedQuestions.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No AI Questions Generated Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Configure your grade, topic, and fantasy scenario parameters on the left, then click
                "Forge Questions with AI".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {q.title || `${topic.toUpperCase()} Challenge`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        15 XP
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <p className="text-sm text-slate-100 font-medium leading-relaxed">
                      {q.questionText || q.question}
                    </p>
                  </div>

                  {/* KaTeX formula preview if provided */}
                  {q.formula && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-center text-indigo-300">
                      <MathRenderer content={`$$${q.formula}$$`} />
                    </div>
                  )}

                  {/* Options */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = String(opt) === String(q.correctAnswer);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold"
                                : "bg-slate-950/40 border-slate-800 text-slate-300"
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400">
                                Correct Answer ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation & Hint */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 space-y-1.5 text-xs">
                    {q.hint && (
                      <div className="flex items-start gap-2 text-amber-400/90">
                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-amber-300">Hint:</strong> {q.hint}
                        </span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
                        <span>
                          <strong className="text-slate-200">Solution:</strong> {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800">
                    {savedStatus[idx] === "published" ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Published to Game
                      </span>
                    ) : savedStatus[idx] === "draft" ? (
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <FileCheck className="w-4 h-4" /> Saved as Draft
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={savedStatus[idx] === "saving"}
                          onClick={() => handleSaveToBank(q, idx, "draft")}
                          className="admin-btn admin-btn-secondary text-xs flex items-center gap-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Save as Draft</span>
                        </button>
                        <button
                          type="button"
                          disabled={savedStatus[idx] === "saving"}
                          onClick={() => handleSaveToBank(q, idx, "published")}
                          className="admin-btn admin-btn-primary text-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Publish Immediately</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

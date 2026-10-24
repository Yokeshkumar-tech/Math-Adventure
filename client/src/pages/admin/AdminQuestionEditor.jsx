// client/src/pages/admin/AdminQuestionEditor.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { adminQuestions } from "../../services/adminApi.js";
import MathRenderer from "../../components/MathRenderer.jsx";
import GeometryDiagram from "../../components/game/GeometryDiagram.jsx";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  BookOpen,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function AdminQuestionEditor() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    topic: "Fractions",
    realm: "Fraction Kingdom",
    grade: 5,
    difficulty: "easy",
    answerType: "multiple_choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    hint: "",
    hints: { clue: "", concept: "", workedExample: "" },
    points: 10,
    estimatedTimeSeconds: 45,
    formula: "",
    stepByStep: ["", ""],
    commonMistakes: "",
    realLifeExample: "",
    diagramSvg: "",
    status: "published",
  });

  useEffect(() => {
    if (isEditing) {
      async function fetchQ() {
        try {
          setLoading(true);
          const res = await adminQuestions.get(id);
          const q = res.question;
          setFormData({
            title: q.title || "",
            question: q.question || "",
            topic: q.topic || "Fractions",
            realm: q.realm || "Number Forest",
            grade: q.grade || 5,
            difficulty: q.difficulty || "easy",
            answerType: q.answerType || "multiple_choice",
            options: q.options?.length ? q.options : ["", "", "", ""],
            correctAnswer: q.correctAnswer || "",
            explanation: q.explanation || "",
            hint: q.hint || "",
            hints: q.hints || { clue: "", concept: "", workedExample: "" },
            points: q.points || 10,
            estimatedTimeSeconds: q.estimatedTimeSeconds || 45,
            formula: q.formula || "",
            stepByStep: q.stepByStep?.length ? q.stepByStep : ["", ""],
            commonMistakes: q.commonMistakes || "",
            realLifeExample: q.realLifeExample || "",
            diagramSvg: q.diagramSvg || "",
            status: q.status || "published",
          });
        } catch (err) {
          setError("Failed to load question details.");
        } finally {
          setLoading(false);
        }
      }
      fetchQ();
    }
  }, [id, isEditing]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...formData.options];
    updated[idx] = value;
    setFormData((prev) => ({ ...prev, options: updated }));
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  const removeOption = (idx) => {
    if (formData.options.length > 2) {
      const updated = formData.options.filter((_, i) => i !== idx);
      setFormData((prev) => ({
        ...prev,
        options: updated,
        correctAnswer: prev.correctAnswer === prev.options[idx] ? "" : prev.correctAnswer,
      }));
    }
  };

  const handleSave = async (overrideStatus) => {
    // Validation
    if (!formData.question.trim()) {
      setError("Please enter the question statement in Step 2.");
      setActiveStep(2);
      return;
    }

    if (formData.answerType === "multiple_choice") {
      const trimmedOpts = formData.options.map((o) => o.trim()).filter(Boolean);
      if (trimmedOpts.length < 2) {
        setError("Please define at least two non-empty answer options in Step 3.");
        setActiveStep(3);
        return;
      }
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size !== trimmedOpts.length) {
        setError("Duplicate answer options found in Step 3. Each option must be distinct.");
        setActiveStep(3);
        return;
      }
      if (!formData.correctAnswer.trim() || !trimmedOpts.includes(formData.correctAnswer.trim())) {
        setError("Please mark which option is the correct answer key in Step 3.");
        setActiveStep(3);
        return;
      }
    }

    if (!formData.explanation.trim()) {
      setError("Please provide a step-by-step mathematical explanation in Step 4.");
      setActiveStep(4);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        status: overrideStatus || formData.status,
      };

      if (isEditing) {
        await adminQuestions.update(id, payload);
        setSuccessMsg("Question updated successfully!");
      } else {
        await adminQuestions.create(payload);
        setSuccessMsg("Question created and saved to bank!");
      }

      setTimeout(() => {
        navigate("/admin/questions");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save question.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Basic Details" },
    { number: 2, title: "Question Content" },
    { number: 3, title: "Answer Keys" },
    { number: 4, title: "Learning Content" },
    { number: 5, title: "XP & Rewards" },
    { number: 6, title: "Student Preview" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/questions"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Bank</span>
        </Link>
        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
          {isEditing ? "Editing Question" : "New Question Wizard"}
        </span>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        {steps.map((s) => (
          <button
            key={s.number}
            type="button"
            onClick={() => setActiveStep(s.number)}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              activeStep === s.number
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "bg-slate-950/60 text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-[10px] opacity-75">Step {s.number}</span>
            <span className="truncate w-full">{s.title}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================
          STEP 1: BASIC DETAILS
          ======================================================== */}
      {activeStep === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-white mb-2">Step 1: Problem Classification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Title / Tagline</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Garden Perimeter Fence"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Curriculum Topic</label>
              <select
                value={formData.topic}
                onChange={(e) => handleChange("topic", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="Fractions">Fractions</option>
                <option value="Decimals">Decimals</option>
                <option value="Area and Perimeter">Area and Perimeter</option>
                <option value="Basic Geometry">Basic Geometry</option>
                <option value="Factors and Multiples">Factors and Multiples</option>
                <option value="Integers">Integers</option>
                <option value="Ratios and Proportions">Ratios and Proportions</option>
                <option value="Real-World Math">Real-World Math</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Assigned Realm</label>
              <select
                value={formData.realm}
                onChange={(e) => handleChange("realm", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="Number Forest">Number Forest (Forest Realm)</option>
                <option value="Fraction Kingdom">Fraction Kingdom (Pizza Golem)</option>
                <option value="Desert of Numbers">Desert of Numbers (Prime Sphinx)</option>
                <option value="Geometry Mountains">Geometry Mountains (Broken Bridge)</option>
                <option value="Dragon's Math Castle">Dragon's Math Castle (Volcanic Trials)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Grade Level</label>
              <select
                value={formData.grade}
                onChange={(e) => handleChange("grade", Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value={5}>Grade 5</option>
                <option value={6}>Grade 6</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Difficulty Tier</label>
              <select
                value={formData.difficulty}
                onChange={(e) => {
                  const diff = e.target.value;
                  const pts = diff === "hard" ? 30 : diff === "medium" ? 20 : 10;
                  setFormData((prev) => ({ ...prev, difficulty: diff, points: pts }));
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="easy">Easy (10 XP)</option>
                <option value="medium">Medium (20 XP)</option>
                <option value="hard">Hard (30 XP)</option>
                <option value="boss">Boss Challenge (50 XP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Question Engine Type</label>
              <select
                value={formData.answerType}
                onChange={(e) => handleChange("answerType", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="multiple_choice">Multiple Choice (4 Options)</option>
                <option value="numerical">Numerical / Exact Input</option>
                <option value="true_false">True / False</option>
                <option value="geometry_svg">Geometric Diagram Problem</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: QUESTION STATEMENT & LATEX
          ======================================================== */}
      {activeStep === 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-white mb-2">Step 2: Mathematical Question Content</h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Question Statement (Supports KaTeX $...$ and $$...$$ equations)
            </label>
            <textarea
              rows={4}
              value={formData.question}
              onChange={(e) => handleChange("question", e.target.value)}
              placeholder="e.g. What is the perimeter of a square with side $6\text{ cm}$?"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono"
            />
          </div>

          {/* Live KaTeX Render Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              Live KaTeX Render Preview
            </span>
            <div className="font-fredoka text-base text-white">
              {formData.question ? (
                <MathRenderer content={formData.question} />
              ) : (
                <span className="text-slate-600 italic">Equation preview will appear here...</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Optional Geometric Diagram Context
            </label>
            <input
              type="text"
              value={formData.diagramSvg}
              onChange={(e) => handleChange("diagramSvg", e.target.value)}
              placeholder="e.g. square 6 cm or rectangle 8 cm by 5 cm (or raw <svg>)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Auto-renders dynamic SVG diagrams for geometric questions (squares, rectangles, circles, angles).
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: ANSWER CONFIGURATION
          ======================================================== */}
      {activeStep === 3 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-fredoka text-lg font-bold text-white">Step 3: Answer Options &amp; Correct Key</h3>
            {formData.answerType === "multiple_choice" && (
              <button
                type="button"
                onClick={addOption}
                disabled={formData.options.length >= 6}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Choice</span>
              </button>
            )}
          </div>

          {formData.answerType === "multiple_choice" ? (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block">
                Enter options below and click the radio circle to mark the official correct answer.
              </span>
              {formData.options.map((opt, idx) => {
                const isCorrect = formData.correctAnswer === opt && opt.trim() !== "";
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isCorrect ? "bg-emerald-500/10 border-emerald-500/40" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="correctAnswerKey"
                      checked={isCorrect}
                      onChange={() => opt.trim() && handleChange("correctAnswer", opt.trim())}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-hidden"
                    />
                    {isCorrect && (
                      <span className="text-xs font-bold text-emerald-400 mr-2">✓ Correct Answer</span>
                    )}
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Expected Correct Value
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => handleChange("correctAnswer", e.target.value)}
                placeholder="e.g. 24 or 3/4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          STEP 4: STEP-BY-STEP REASONING & HINTS
          ======================================================== */}
      {activeStep === 4 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-white mb-2">Step 4: Explanations &amp; Tiered Hints</h3>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
              Full Step-by-Step Mathematical Explanation (Required)
            </label>
            <textarea
              rows={4}
              value={formData.explanation}
              onChange={(e) => handleChange("explanation", e.target.value)}
              placeholder="e.g. A square has four equal sides. Perimeter = 4 × side = 4 × 6 = 24 cm."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Tier 1 Hint: Conceptual Clue
              </label>
              <input
                type="text"
                value={formData.hint}
                onChange={(e) => handleChange("hint", e.target.value)}
                placeholder="e.g. Think of the total distance around the border."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Formula Used
              </label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => handleChange("formula", e.target.value)}
                placeholder="e.g. Perimeter = 4 × side"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 5: REWARDS & TIME
          ======================================================== */}
      {activeStep === 5 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-fredoka text-lg font-bold text-white mb-2">Step 5: Gamified Rewards &amp; Time</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Base Points / XP
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => handleChange("points", Number(e.target.value))}
                min={5}
                max={100}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Estimated Solving Time (Seconds)
              </label>
              <input
                type="number"
                value={formData.estimatedTimeSeconds}
                onChange={(e) => handleChange("estimatedTimeSeconds", Number(e.target.value))}
                min={15}
                max={300}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                Publication State
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="published">Published (Live in Student Game)</option>
                <option value="draft">Draft (Admin Only)</option>
                <option value="review">Under Review (Teachers / Admins)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 6: LIVE STUDENT PREVIEW
          ======================================================== */}
      {activeStep === 6 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="font-fredoka text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            <span>Step 6: Live Student Interactive Card Preview</span>
          </h3>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-indigo-400 uppercase tracking-wider">{formData.topic}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                ⭐ +{formData.points} XP
              </span>
            </div>

            <h2 className="font-fredoka text-2xl font-bold text-white">
              <MathRenderer content={formData.question || "No question entered"} />
            </h2>

            <GeometryDiagram questionText={formData.question} topic={formData.topic} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-between ${
                    opt === formData.correctAnswer && opt.trim()
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                      : "bg-slate-900 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span>
                      <MathRenderer content={opt || `Option ${idx + 1}`} />
                    </span>
                  </div>
                  {opt === formData.correctAnswer && opt.trim() && (
                    <span className="text-xs text-emerald-400 font-bold">✓ Key</span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400">Explanation:</div>
              <p>{formData.explanation || "No explanation provided"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Tray */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
          disabled={activeStep <= 1}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-bold"
        >
          &larr; Previous Step
        </button>

        <div className="flex items-center gap-2">
          {activeStep < 6 && (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              Next Step &rarr;
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
          >
            Save as Draft
          </button>

          <button
            id="btn-publish-question"
            type="button"
            onClick={() => handleSave("published")}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Update & Publish" : "Publish to Game 🚀"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

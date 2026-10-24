// client/src/pages/admin/AdminTopics.jsx
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminQuestions } from "../../services/adminApi.js";

const CURRICULUM_DOMAINS = [
  {
    id: "numbers",
    title: "Numbers & Operations",
    gradeSpan: "Grades 3 - 5",
    realm: "Number Forest",
    description: "Multiplication, division, prime factors, multiples, order of operations, and place value.",
    icon: "🌲",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    keyConcepts: ["Prime Factorization", "Greatest Common Divisor", "Multi-digit Multiplication", "Long Division"],
  },
  {
    id: "fractions",
    title: "Fractions & Decimals",
    gradeSpan: "Grades 4 - 6",
    realm: "Fraction Kingdom",
    description: "Equivalent fractions, common denominators, mixed operations, improper conversions, and decimal places.",
    icon: "🏰",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    keyConcepts: ["Common Denominators", "Adding Mixed Numbers", "Multiplying Fractions", "Decimal Conversion"],
  },
  {
    id: "algebra",
    title: "Pre-Algebra & Equations",
    gradeSpan: "Grades 6 - 8",
    realm: "Desert of Numbers",
    description: "Solving linear equations, algebraic expressions, combining like terms, variables, and inequalities.",
    icon: "🏜️",
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
    keyConcepts: ["One-Step Equations", "Two-Step Equations", "Variables & Constants", "Distribution Property"],
  },
  {
    id: "geometry",
    title: "Geometry & Spatial Reasoning",
    gradeSpan: "Grades 4 - 7",
    realm: "Ocean of Geometry",
    description: "Perimeter, surface area, volume, Pythagorean theorem, angle types, and geometric proofs.",
    icon: "📐",
    color: "from-purple-500/20 to-violet-500/10 border-purple-500/30",
    keyConcepts: ["Perimeter & Area", "Triangle Angles Sum", "Volume of Prisms", "Pythagorean Theorem"],
  },
  {
    id: "percentages",
    title: "Percentages & Ratios",
    gradeSpan: "Grades 6 - 8",
    realm: "Fraction Kingdom",
    description: "Ratio tables, unit rates, calculating percentage increases, discounts, sales tax, and proportions.",
    icon: "⚖️",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
    keyConcepts: ["Unit Rates", "Cross Multiplication", "Percentage Discounts", "Ratio Simplification"],
  },
  {
    id: "real_world",
    title: "Real-World Financial Math",
    gradeSpan: "Grades 5 - 8",
    realm: "Dragon's Castle",
    description: "Budgeting, currency exchange, merchant profits, interest calculations, and everyday problem-solving.",
    icon: "💰",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/30",
    keyConcepts: ["Budgeting", "Compound Interest", "Profit & Loss Margin", "Currency Conversion"],
  },
];

export default function AdminTopics() {
  const [topicStats, setTopicStats] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch question counts per topic
    const loadCounts = async () => {
      try {
        const res = await adminQuestions.list({ limit: 100 });
        if (res && res.questions) {
          const counts = {};
          res.questions.forEach((q) => {
            const t = (q.topic || "other").toLowerCase();
            counts[t] = (counts[t] || 0) + 1;
          });
          setTopicStats(counts);
        }
      } catch {
        // Fallback
      }
    };
    loadCounts();
  }, []);

  const filtered = CURRICULUM_DOMAINS.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">
              Curriculum & Topics Matrix
            </h1>
            <p className="text-xs text-slate-400">
              Master curriculum alignment across mathematical domains, grade bands, and fantasy realms
            </p>
          </div>
        </div>
        <Link
          to="/admin/questions/new"
          className="admin-btn admin-btn-primary flex items-center gap-2 text-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>Add Question to Curriculum</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-3" />
        <input
          type="text"
          placeholder="Filter curriculum domains or mathematical concepts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input w-full"
        />
      </div>

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((dom) => {
          const count = topicStats[dom.id] || topicStats[dom.title.toLowerCase()] || 0;
          return (
            <div
              key={dom.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition ${dom.color}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner">
                    {dom.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {dom.gradeSpan}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">Realm: {dom.realm}</p>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-fredoka mb-1.5">
                  {dom.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {dom.description}
                </p>

                {/* Key Concepts */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Core Objectives:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dom.keyConcepts.map((kc, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-950/60 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Bank: <strong className="text-white">{count > 0 ? `${count} Questions` : "Available in Bank"}</strong>
                </span>
                <Link
                  to={`/admin/questions?topic=${dom.id}`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                >
                  <span>Filter Questions</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

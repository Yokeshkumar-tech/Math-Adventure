// client/src/pages/Topics.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.js";
import Loader from "../components/Loader.jsx";
import { Search, Filter, BookOpen, Play, CheckCircle2, Clock, Sparkles } from "lucide-react";

export default function Topics() {
  const { grade } = useParams();
  const currentGrade = Number(grade) || 5;
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchTopics() {
      setLoading(true);
      try {
        const res = await api.get(`/grades/${currentGrade}/topics`);
        setTopics(res.data);
      } catch (err) {
        console.error("Error fetching topics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, [currentGrade]);

  const filteredTopics = topics.filter((t) => {
    const matchesSearch = t.topic.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === "all" || t.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesDiff && matchesStatus;
  });

  const getTopicEmoji = (title) => {
    const l = title.toLowerCase();
    if (l.includes("fraction")) return "🍕";
    if (l.includes("decimal")) return "🪙";
    if (l.includes("factor")) return "🔢";
    if (l.includes("ratio")) return "⚖️";
    if (l.includes("integer")) return "🌡️";
    if (l.includes("geometry")) return "📐";
    if (l.includes("area") || l.includes("volume")) return "▦";
    return "📘";
  };

  if (loading) {
    return <Loader message={`Loading Grade ${currentGrade} Topics...`} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grade {currentGrade} Curriculum</span>
          </div>
          <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-slate-900">
            Mathematics Adventure Topics
          </h1>
          <p className="text-sm text-slate-500">
            Choose a topic to explore interactive lessons, infographics, and adaptive quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={currentGrade === 5 ? "/grades/6/topics" : "/grades/5/topics"}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Switch to Grade {currentGrade === 5 ? "6" : "5"}
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-topic-search"
            type="text"
            placeholder="Search math topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Difficulty:</span>
            <select
              id="select-difficulty-filter"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <span>Status:</span>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((t) => {
          const emoji = getTopicEmoji(t.topic);
          return (
            <div
              key={t.id}
              className="bg-white rounded-3xl border-2 border-slate-200/90 hover:border-indigo-400 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {emoji}
                  </span>
                  
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      t.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : t.status === "in-progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {t.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {t.status === "completed"
                      ? "Mastered"
                      : t.status === "in-progress"
                      ? "In Progress"
                      : "Not Started"}
                  </span>
                </div>

                <h3 className="font-fredoka text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t.topic}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-500 my-2">
                  <span className="capitalize font-semibold text-indigo-600">
                    Level: {t.difficulty}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {t.estimatedMinutes || 10} mins
                  </span>
                </div>

                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {(t.objectives || []).slice(0, 2).map((obj, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span className="line-clamp-2">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  id={`btn-study-${t.slug}`}
                  to={`/lessons/${t.id}`}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-fredoka font-bold text-xs text-center border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Lesson</span>
                </Link>

                <Link
                  id={`btn-practice-${t.slug}`}
                  to={`/practice/${encodeURIComponent(t.topic)}`}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-xs text-center shadow-xs transition-all hover:scale-102 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Adaptive Quiz</span>
                </Link>
              </div>

            </div>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 font-medium">No topics found matching your filters.</p>
          <button
            onClick={() => {
              setSearch("");
              setDifficultyFilter("all");
              setStatusFilter("all");
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}

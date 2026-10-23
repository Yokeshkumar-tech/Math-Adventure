// client/src/pages/Lesson.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import MathVisualizer from "../components/MathVisualizer.jsx";
import VideoLesson from "../components/VideoLesson.jsx";
import TutorChat from "../components/TutorChat.jsx";
import Celebration from "../components/Celebration.jsx";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Bot,
  HelpCircle,
  FileText,
  Lightbulb,
  Video,
  Award,
} from "lucide-react";

export default function Lesson() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // AI helper states
  const [simplifiedText, setSimplifiedText] = useState(null);
  const [extraExample, setExtraExample] = useState(null);
  const [summaryList, setSummaryList] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/${id}`);
        setLesson(res.data);
        setCompleted(res.data.completed || false);
      } catch (err) {
        console.error("Error loading lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLesson();
  }, [id]);

  const handleComplete = async () => {
    try {
      const res = await api.post(`/lessons/${lesson._id}/complete`);
      setCompleted(true);
      await refreshUser();
      if (res.data.newBadges && res.data.newBadges.length > 0) {
        setCelebrationData({
          badges: res.data.newBadges,
          points: res.data.pointsAwarded,
        });
      } else {
        alert("Awesome work! Lesson completed and +25 XP earned! 🎉");
      }
    } catch (err) {
      console.error("Error marking complete:", err);
    }
  };

  const handleSimpler = async () => {
    setAiLoading(true);
    try {
      const res = await api.post("/ai/explanation", {
        grade: lesson.grade,
        topic: lesson.topic,
        mode: "simpler",
        currentText: lesson.explanation,
      });
      setSimplifiedText(res.data.explanation);
    } catch {
      setSimplifiedText("Fractions are like sharing a chocolate bar or pizza equally. The bottom number counts all the pieces, and the top number counts what you have!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExtraExample = async () => {
    setAiLoading(true);
    try {
      const res = await api.post("/ai/explanation", {
        grade: lesson.grade,
        topic: lesson.topic,
        difficulty: lesson.difficulty,
        mode: "example",
      });
      setExtraExample(res.data.workedExample);
    } catch {
      setExtraExample({
        problem: "You have 10 cricket balls and give 2/5 of them to Rahul. How many does he receive?",
        steps: [
          "Step 1: Divide 10 by the denominator 5: 10 ÷ 5 = 2 balls per part.",
          "Step 2: Multiply by numerator 2: 2 × 2 = 4 balls.",
        ],
        answer: "4 balls",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSummarize = async () => {
    setAiLoading(true);
    try {
      const res = await api.post("/ai/summary", {
        topic: lesson.topic,
        explanation: lesson.explanation,
      });
      setSummaryList(res.data.summary);
    } catch {
      setSummaryList("• Fractions show parts of an equal whole.\n• Numerator is on top, denominator is on bottom.\n• When adding like fractions, add only the top numbers!");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Opening lesson adventure..." />;
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Lesson not found</h2>
        <Link to="/grades" className="text-indigo-600 underline mt-2 inline-block">
          Return to Grades
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to={`/grades/${lesson.grade}/topics`}
          className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grade {lesson.grade} Topics</span>
        </Link>

        <div className="flex items-center gap-2">
          {lesson.topic.toLowerCase().includes("fraction") && (
            <button
              id="btn-watch-video"
              onClick={() => setShowVideo(!showVideo)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-fredoka font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition-all hover:scale-105"
            >
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>{showVideo ? "Hide Video" : "Watch Video Lesson"}</span>
            </button>
          )}

          <button
            id="btn-open-tutor-modal"
            onClick={() => setShowTutor(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-fredoka font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask Professor Pi 🦉</span>
          </button>
        </div>
      </div>

      {/* Video Lesson Embed if Opened */}
      {showVideo && (
        <VideoLesson onClose={() => setShowVideo(false)} />
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grade {lesson.grade} • {lesson.difficulty.toUpperCase()}</span>
          </div>
          <h1 className="font-fredoka text-3xl sm:text-5xl font-bold tracking-tight">
            {lesson.topic}
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-xl font-medium">
            Explore with interactive visuals, worked examples, and earn 25 XP for completing this lesson!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            id="btn-complete-lesson"
            onClick={handleComplete}
            disabled={completed}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-fredoka font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              completed
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{completed ? "Completed (+25 XP)" : "Mark Complete (+25 XP)"}</span>
          </button>

          <Link
            id="btn-start-adaptive-quiz"
            to={`/practice/${encodeURIComponent(lesson.topic)}`}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-fredoka font-bold text-sm shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-900" />
            <span>Start Adaptive Quiz</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout: Two Columns on Desktop (Side-by-Side), Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Lesson Explanations & Examples (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Learning Objectives */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-xs">
            <h3 className="font-fredoka text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>What You Will Learn</span>
            </h3>
            <ul className="space-y-2">
              {(lesson.objectives || []).map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concept Explanation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Concept Explanation</span>
              </h3>
            </div>
            
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans">
              {lesson.explanation}
            </p>

            {/* AI Simpler Explanation Box if requested */}
            {simplifiedText && (
              <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 animate-fadeIn">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simpler Picture Explanation:</span>
                </span>
                <p className="text-sm sm:text-base leading-relaxed font-medium">
                  {simplifiedText}
                </p>
              </div>
            )}

            {/* AI Summary Box if requested */}
            {summaryList && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 animate-fadeIn">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Quick Takeaways:</span>
                </span>
                <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">
                  {summaryList}
                </p>
              </div>
            )}

            {/* AI Toolbar Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">AI Tools:</span>
              
              <button
                id="btn-ai-simpler"
                onClick={handleSimpler}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Explain More Simply</span>
              </button>

              <button
                id="btn-ai-extra-example"
                onClick={handleExtraExample}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3 text-emerald-500" />
                <span>Give Another Example</span>
              </button>

              <button
                id="btn-ai-summarize"
                onClick={handleSummarize}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-amber-600" />
                <span>Summarize Lesson</span>
              </button>
            </div>
          </div>

          {/* Worked Examples (2 per lesson) */}
          <div className="space-y-4">
            <h3 className="font-fredoka text-xl font-bold text-slate-900">
              Worked Examples with Steps
            </h3>

            {(lesson.workedExamples || []).map((ex, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 border-2 border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-fredoka font-bold text-xs">
                    Example #{index + 1}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {ex.problem}
                  </h4>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                  {ex.steps.map((st, sidx) => (
                    <div key={sidx} className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      {st}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Answer: {ex.answer}</span>
                </div>
              </div>
            ))}

            {/* Extra AI generated example if loaded */}
            {extraExample && (
              <div className="bg-emerald-50/50 rounded-3xl p-6 border-2 border-emerald-300 shadow-xs space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-fredoka font-bold text-xs">
                    Bonus AI Example
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                    {extraExample.problem}
                  </h4>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-2">
                  {(extraExample.steps || []).map((st, i) => (
                    <div key={i} className="text-xs sm:text-sm text-slate-700 font-medium">
                      {st}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold">
                  Answer: {extraExample.answer}
                </div>
              </div>
            )}
          </div>

          {/* Real-Life Context and Key Takeaways */}
          <div className="bg-amber-50/60 rounded-3xl p-6 border-2 border-amber-200 shadow-xs space-y-3">
            <h4 className="font-fredoka text-lg font-bold text-amber-900 flex items-center gap-2">
              <span>🌟 Real-Life Math Adventure</span>
            </h4>
            <p className="text-sm text-amber-950 leading-relaxed font-medium">
              {lesson.realLifeExample}
            </p>
          </div>

        </div>

        {/* Right Column: Educational Infographics Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="space-y-3">
            <h3 className="font-fredoka text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Educational Infographic</span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive SVG diagram guaranteed to be mathematically precise:
            </p>
          </div>

          <MathVisualizer
            type={lesson.infographicType || "pizza"}
            topic={lesson.topic}
          />

          {/* Quiz Call to Action Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-200 text-center space-y-3 shadow-xs">
            <h4 className="font-fredoka text-xl font-bold text-indigo-950">
              Ready to Test Your Skills?
            </h4>
            <p className="text-xs text-slate-600">
              Take the 10-question adaptive quiz. Starts easy, and moves to medium and hard as you get answers right!
            </p>
            <Link
              id="btn-quiz-cta"
              to={`/practice/${encodeURIComponent(lesson.topic)}`}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-fredoka font-bold text-base shadow-md shadow-indigo-300 transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Adaptive Quiz</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Professor Pi Chat Modal */}
      {showTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <TutorChat
            topic={lesson.topic}
            grade={lesson.grade}
            onClose={() => setShowTutor(false)}
          />
        </div>
      )}

      {/* Celebration Modal on completion */}
      {celebrationData && (
        <Celebration
          badges={celebrationData.badges}
          onClose={() => setCelebrationData(null)}
        />
      )}

    </div>
  );
}

// client/src/pages/Practice.jsx - Adaptive Practice Quiz
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
} from "lucide-react";

export default function Practice() {
  const { topicId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentLevel, setCurrentLevel] = useState("easy");
  const [runningPoints, setRunningPoints] = useState(0);

  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [levelChangeAlert, setLevelChangeAlert] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextQCache, setNextQCache] = useState(null);

  // Initialize or start the quiz
  useEffect(() => {
    async function initQuiz() {
      setLoading(true);
      try {
        let res;
        const decodedTopic = decodeURIComponent(topicId);

        if (topicId === "daily") {
          res = await api.post("/quizzes/daily-challenge");
        } else if (topicId === "revision") {
          res = await api.post("/quizzes/revision");
        } else {
          res = await api.post("/quizzes/start", {
            topic: decodedTopic,
            grade: user?.grade || 5,
          });
        }

        setSessionId(res.data.sessionId);
        setCurrentQuestion(res.data.question);
        setQuestionNumber(res.data.number || 1);
        setTotalQuestions(res.data.total || 10);
        setCurrentLevel(res.data.level || "easy");
      } catch (err) {
        console.error("Start quiz error:", err);
        alert("Could not load quiz questions for this topic.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    initQuiz();
  }, [topicId]);

  // Keyboard navigation for keys 1, 2, 3, 4 and Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (submitted) {
        if (e.key === "Enter") {
          handleNext();
        }
        return;
      }
      if (currentQuestion && currentQuestion.options) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentQuestion.options[idx] !== undefined) {
            setSelectedOption(currentQuestion.options[idx]);
          }
        }
        if (e.key === "Enter" && selectedOption) {
          handleSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, selectedOption, submitted]);

  const handleSubmit = async () => {
    if (!selectedOption || submitted || submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post("/quizzes/submit", {
        sessionId,
        questionId: currentQuestion.id,
        selected: selectedOption,
      });

      setFeedback(res.data);
      setSubmitted(true);
      setRunningPoints((prev) => prev + (res.data.pointsEarned || 0));
      setIsLastQuestion(res.data.isLast);
      setNextQCache(res.data.nextQuestion);

      if (res.data.levelChanged) {
        setLevelChangeAlert(
          res.data.levelChanged === "up"
            ? "Level Up! 🚀 Difficulty increased to " + res.data.nextLevel.toUpperCase()
            : "Level Adjusted! 🧭 Practising at " + res.data.nextLevel.toUpperCase()
        );
      }
      setCurrentLevel(res.data.nextLevel);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Finish quiz and navigate to results
      setLoading(true);
      try {
        const res = await api.post("/quizzes/finish", { sessionId });
        await refreshUser();
        navigate(`/results/${res.data.attempt._id}`, {
          state: {
            attempt: res.data.attempt,
            newBadges: res.data.newBadges,
            recommendation: res.data.recommendation,
          },
        });
      } catch (err) {
        console.error("Finish quiz error:", err);
        navigate("/dashboard");
      }
      return;
    }

    // Advance to next question
    if (nextQCache) {
      setCurrentQuestion(nextQCache);
      setQuestionNumber((prev) => prev + 1);
      setSelectedOption("");
      setSubmitted(false);
      setFeedback(null);
      setLevelChangeAlert(null);
      setNextQCache(null);
    }
  };

  if (loading) {
    return <Loader message="Generating adaptive questions..." />;
  }

  if (!currentQuestion) {
    return <Loader message="Setting up question..." />;
  }

  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-800 border-emerald-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    hard: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const difficultyPoints = {
    easy: "10 pts",
    medium: "20 pts",
    hard: "30 pts",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Bar: Progress and Difficulty */}
      <div className="bg-white rounded-3xl p-5 border-2 border-indigo-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          
          {/* Question Counter */}
          <span className="text-indigo-700">
            Question <span className="text-lg font-fredoka">{questionNumber}</span> of {totalQuestions}
          </span>

          {/* Current Level Badge */}
          <div className="flex items-center gap-2">
            <span
              id="badge-current-difficulty"
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                difficultyColors[currentLevel] || difficultyColors.easy
              }`}
            >
              Level: {currentLevel} ({difficultyPoints[currentLevel]})
            </span>

            {/* Running Points */}
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
              ⭐ <span>+{runningPoints} pts</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>

        {/* Level Change Dynamic Notification */}
        {levelChangeAlert && (
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-2 animate-bounce-gentle">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{levelChangeAlert}</span>
          </div>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
        
        {/* Question Statement */}
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
            {currentQuestion.topic || decodeURIComponent(topicId)}
          </span>
          <h2
            id="quiz-question-text"
            className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-900 leading-snug"
          >
            {currentQuestion.question}
          </h2>
        </div>

        {/* 4 Large MCQ Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = submitted && feedback && opt === feedback.correctAnswer;
            const isWrongChoice = submitted && isSelected && !feedback.correct;

            let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-indigo-50/60 hover:border-indigo-300";
            if (isSelected && !submitted) {
              btnStyle = "bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500 shadow-sm";
            } else if (isCorrect) {
              btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500";
            } else if (isWrongChoice) {
              btnStyle = "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400";
            }

            return (
              <button
                key={idx}
                id={`btn-option-${idx + 1}`}
                onClick={() => !submitted && setSelectedOption(opt)}
                disabled={submitted}
                className={`min-h-[64px] p-4 rounded-2xl border-2 font-fredoka text-lg sm:text-xl font-bold transition-all text-left flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>
                {isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                {isWrongChoice && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Banner */}
        {submitted && feedback && (
          <div
            id="quiz-feedback-box"
            className={`p-5 rounded-2xl border-2 animate-fadeIn ${
              feedback.correct
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : "bg-amber-50 border-amber-300 text-amber-950"
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.correct ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-fredoka text-lg font-bold">
                  {feedback.correct
                    ? `Awesome Job! +${feedback.pointsEarned} Points! 🎉`
                    : "Nice try! Let's see how it works 💡"}
                </h4>
                <p className="text-sm font-medium leading-relaxed font-sans">
                  {feedback.explanation}
                </p>
                {!feedback.correct && (
                  <p className="text-xs font-bold text-amber-900 mt-1">
                    Correct answer was: {feedback.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Submit or Next */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Press [1-4] to select, [Enter] to submit
          </span>

          {!submitted ? (
            <button
              id="btn-submit-answer"
              onClick={handleSubmit}
              disabled={!selectedOption || submitting}
              className="ml-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-fredoka font-bold text-base shadow-md shadow-indigo-300 transition-all hover:scale-102 flex items-center gap-2"
            >
              <span>{submitting ? "Checking..." : "Submit Answer"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-next-question"
              onClick={handleNext}
              className="ml-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-fredoka font-bold text-base shadow-md shadow-indigo-300 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>{isLastQuestion ? "View Final Results 🏆" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

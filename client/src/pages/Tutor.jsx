// client/src/pages/Tutor.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import TutorChat from "../components/TutorChat.jsx";
import { Bot, Sparkles, Lightbulb, MessageCircle } from "lucide-react";

export default function Tutor() {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState("Fractions");

  const topicsList = user?.grade === 6
    ? ["Ratios and Proportions", "Fractions and Decimals", "Integers", "Geometry", "Area and Volume"]
    : ["Fractions", "Decimals", "Factors and Multiples", "Basic Geometry", "Area and Perimeter"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
          <Bot className="w-3.5 h-3.5" />
          <span>Interactive AI Math Companion</span>
        </div>
        <h1 className="font-fredoka text-3xl sm:text-4xl font-bold text-slate-900">
          Meet Professor Pi 🦉
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Your warm, patient, and cheerful math tutor! Ask questions about any Grade {user?.grade || 5} concept.
        </p>
      </div>

      {/* Topic Switcher Bar */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-500 mr-1">Select Topic:</span>
        {topicsList.map((top) => (
          <button
            key={top}
            onClick={() => setSelectedTopic(top)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedTopic === top
                ? "bg-indigo-600 text-white shadow-xs scale-105"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {top}
          </button>
        ))}
      </div>

      {/* Tutor Chat Interface */}
      <div className="flex justify-center">
        <TutorChat
          topic={selectedTopic}
          grade={user?.grade || 5}
        />
      </div>

      {/* Helpful Tips Card */}
      <div className="max-w-lg mx-auto bg-amber-50/70 border border-amber-200 rounded-3xl p-5 text-left text-xs space-y-2 text-amber-900">
        <h4 className="font-fredoka font-bold text-sm text-amber-950 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <span>Tips for learning with Professor Pi:</span>
        </h4>
        <ul className="space-y-1 list-disc list-inside text-amber-800">
          <li>Ask: "Can you give me a pizza or rupee example?"</li>
          <li>Ask: "What is the step-by-step trick for this?"</li>
          <li>Ask: "Why do we add only the top numbers in like fractions?"</li>
        </ul>
      </div>

    </div>
  );
}

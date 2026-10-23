// client/src/components/TutorChat.jsx
import React, { useState, useRef, useEffect } from "react";
import api from "../services/api.js";
import { Send, Bot, Sparkles, Volume2, User as UserIcon, X } from "lucide-react";

export default function TutorChat({ topic = "Fractions", grade = 5, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello math adventurer! 🌟 I'm Professor Pi. What questions do you have about ${topic}? Ask me anything, or pick one of the ideas below!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPills = [
    `Can you give me a fun real-life example of ${topic}?`,
    `What's a simple trick to remember this?`,
    `Why is this math topic useful in everyday life?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageToSend) => {
    const text = messageToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/tutor", {
        topic,
        grade,
        conversation: updatedMessages.slice(-6),
        message: text.trim(),
      });

      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Great curiosity! 🌟 Remember, math is like a puzzle: break it down into smaller steps, look for what you already know, and take your time! Would you like another practice problem?`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-xl overflow-hidden flex flex-col h-[520px] max-w-lg w-full mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-4 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-xl">
            🦉
          </div>
          <div>
            <h3 className="font-fredoka font-bold text-lg leading-tight">
              Professor Pi
            </h3>
            <span className="text-xs text-indigo-200 font-medium">
              Friendly Math Tutor • {topic} (Grade {grade})
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Close Tutor"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm shadow-xs ${
                m.role === "user"
                  ? "bg-indigo-600 text-white font-bold"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {m.role === "user" ? <UserIcon className="w-4 h-4" /> : "🦉"}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-sm sm:text-base leading-relaxed shadow-xs relative group ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-xs"
                  : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.role === "assistant" && (
                <button
                  onClick={() => speakText(m.content)}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Read Aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold pl-2 animate-pulse">
            <span>🦉 Professor Pi is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          id="input-tutor-message"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${topic}...`}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
        />
        <button
          id="btn-send-tutor"
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-2xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700 transition-all hover:scale-105 shadow-sm"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

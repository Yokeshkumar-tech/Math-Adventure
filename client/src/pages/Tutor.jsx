// client/src/pages/Tutor.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import MathRenderer from "../components/MathRenderer.jsx";
import SuggestedQuestions from "../components/SuggestedQuestions.jsx";
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  History,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  CheckCircle2,
  Mic,
  MicOff,
  Square,
  HelpCircle,
  Target,
  ArrowRight,
  ShieldCheck,
  X,
  Menu,
} from "lucide-react";

export default function Tutor() {
  const { user } = useAuth();

  // State
  const [level, setLevel] = useState("middle"); // elementary, middle, high, college, advanced
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello math adventurer! 🦉 I'm **Professor Pi**, your real-time AI mathematics companion.\n\nYou can ask me **any mathematics question** in natural language: from simple arithmetic and fractions to algebra, geometry, probability, statistics, trigonometry, or calculus!\n\nWhat would you like to solve or understand today?`,
      finalAnswer: "",
      steps: [],
      source: "system",
      feedback: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [practiceModal, setPracticeModal] = useState(null); // { questions: [], activeIndex: 0 }
  const [practiceAnswers, setPracticeAnswers] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll on new messages or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isStreaming]);

  // Load user's conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await api.get("/conversations");
        if (res.data.success) {
          setConversations(res.data.conversations || []);
        }
      } catch (err) {
        console.warn("Could not load past conversations:", err);
      }
    }
    fetchConversations();
  }, []);

  // Set initial level according to user's grade if available
  useEffect(() => {
    if (user?.grade) {
      if (user.grade <= 5) setLevel("elementary");
      else if (user.grade <= 8) setLevel("middle");
      else setLevel("high");
    }
  }, [user?.grade]);

  // Handle Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakMessage = (msgId, text) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text of markdown and LaTeX symbols for clear audio
    const cleanSpeech = text
      .replace(/\$\$[\s\S]*?\$\$/g, "formula")
      .replace(/\$[^\$]+?\$/g, "equation")
      .replace(/[\*#_`]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Slightly warm tone for Professor Pi
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const copyToClipboard = (msgId, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start a fresh chat
  const handleNewChat = () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
    }
    setConversationId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Ready for a new adventure! 🦉 What math problem would you like to explore? Feel free to ask anything or select a topic suggestion below!`,
        finalAnswer: "",
        steps: [],
        source: "system",
        feedback: null,
      },
    ]);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  // Switch to saved conversation
  const loadConversation = async (convId) => {
    try {
      setLoading(true);
      const res = await api.get(`/conversations/${convId}`);
      if (res.data.success) {
        setConversationId(res.data.conversation._id);
        if (res.data.conversation.level) setLevel(res.data.conversation.level);
        setMessages(
          res.data.messages.map((m) => ({
            id: m._id,
            role: m.role,
            content: m.content,
            finalAnswer: m.finalAnswer || "",
            steps: m.steps || [],
            formula: m.formula || "",
            source: m.source || "ai",
            feedback: m.feedback || null,
          }))
        );
        setShowHistory(false);
      }
    } catch (err) {
      console.error("Error loading conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const deleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await api.delete(`/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (conversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Error deleting conversation:", err);
    }
  };

  // Submit Feedback (Thumbs Up / Down)
  const handleFeedback = async (msgId, thumb) => {
    try {
      const res = await api.post("/chat/feedback", {
        messageId: msgId,
        feedback: thumb,
      });
      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, feedback: thumb } : m))
        );
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  // Send message with streaming
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading || isStreaming) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
    };

    const tempAssistantId = `assistant-${Date.now()}`;
    const initialAssistantMessage = {
      id: tempAssistantId,
      role: "assistant",
      content: "",
      finalAnswer: "",
      steps: [],
      source: "ai",
      feedback: null,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setInput("");
    setLoading(true);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const token = localStorage.getItem("math_token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${api.defaults.baseURL || "/api"}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          conversationId,
          message: textToSend.trim(),
          level,
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split("\n\n");
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "token") {
                accumulatedContent += data.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAssistantId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              } else if (data.type === "done") {
                setConversationId(data.conversationId);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempAssistantId
                      ? {
                          ...m,
                          id: data.messageId || tempAssistantId,
                          content: data.content || accumulatedContent,
                          steps: data.steps || [],
                          finalAnswer: data.finalAnswer || "",
                          formula: data.formula || "",
                          source: data.source || "ai",
                        }
                      : m
                  )
                );
                // Refresh conversations list
                api.get("/conversations").then((r) => {
                  if (r.data.success) setConversations(r.data.conversations || []);
                });
              }
            } catch (err) {
              console.warn("Error parsing stream chunk:", err);
            }
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Stream generation aborted by user.");
      } else {
        console.error("Streaming chat error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempAssistantId
              ? {
                  ...m,
                  content: `Oops! 🦉 Professor Pi had a little trouble connecting. Please check your internet connection or verify your API settings. Would you like to try again?`,
                  source: "system",
                }
              : m
          )
        );
      }
    } finally {
      setLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setLoading(false);
    }
  };

  // Generate Practice Quiz
  const handleOpenPractice = async (topicName) => {
    try {
      setLoading(true);
      const res = await api.post("/quiz/generate", {
        topic: topicName || "Algebra",
        level,
        count: 3,
      });

      if (res.data.success && res.data.questions?.length) {
        setPracticeModal({
          topic: res.data.topic,
          questions: res.data.questions,
          activeIndex: 0,
        });
        setPracticeAnswers({});
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Could not load practice quiz right now. Try asking Professor Pi for a practice problem in chat!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left: Avatar & Title */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-md shrink-0">
            🦉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight">
                Professor Pi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide">
                Live AI Tutor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              Real-Time AI Mathematics Tutor & Solver
            </p>
          </div>
        </div>

        {/* Right: Controls & Level Selector */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 w-full md:w-auto justify-between md:justify-end">
          
          {/* Level Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
            <span className="text-xs font-bold text-indigo-200">Level:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="elementary" className="text-slate-900">Elementary (Grades 1-5)</option>
              <option value="middle" className="text-slate-900">Middle School (Grades 6-8)</option>
              <option value="high" className="text-slate-900">High School (Algebra/Geometry)</option>
              <option value="college" className="text-slate-900">College & Calculus</option>
              <option value="advanced" className="text-slate-900">Advanced Mathematics</option>
            </select>
          </div>

          {/* New Chat Button */}
          <button
            id="btn-tutor-new-chat"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95 shadow-xs"
            title="Start a new conversation"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>New Chat</span>
          </button>

          {/* History Button */}
          <button
            id="btn-tutor-history"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all active:scale-95 shadow-xs"
            title="View saved conversations"
          >
            <History className="w-4 h-4 text-white" />
            <span>Saved Chats</span>
          </button>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 2. Main Chat Area + History Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Saved Chats Sidebar (Desktop or Toggled on Mobile) */}
        {showHistory && (
          <div className="lg:col-span-1 bg-white rounded-3xl border-2 border-indigo-100 shadow-md p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-fredoka font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Saved Conversations</span>
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No saved conversations yet. Ask a question to start one!
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                      conversationId === conv._id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "hover:bg-indigo-50 text-slate-700"
                    }`}
                  >
                    <span className="truncate pr-2">{conv.title || "Math Chat"}</span>
                    <button
                      onClick={(e) => deleteConversation(e, conv._id)}
                      className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                        conversationId === conv._id
                          ? "hover:bg-indigo-700 text-indigo-200"
                          : "hover:bg-red-100 text-red-500"
                      }`}
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Conversation Canvas */}
        <div
          className={`${
            showHistory ? "lg:col-span-3" : "lg:col-span-4"
          } bg-white rounded-3xl border-2 border-indigo-100 shadow-lg overflow-hidden flex flex-col h-[650px] transition-all`}
        >
          {/* Mode Sub-header */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-600">
                Mode: Real-Time AI Math Solver
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPractice("Algebra")}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors flex items-center gap-1"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Practice Quiz</span>
              </button>
              <button
                onClick={() =>
                  handleSend("Explain the difference between perimeter and area with a garden example")
                }
                className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition-colors items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Real-Life Analogy</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/50 via-white to-indigo-50/30">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";

              return (
                <div
                  key={m.id || idx}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-base shadow-xs ${
                      isUser
                        ? "bg-indigo-600 text-white font-bold"
                        : "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {isUser ? "👤" : "🦉"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed shadow-xs space-y-3 ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border-2 border-indigo-50 rounded-tl-xs"
                    }`}
                  >
                    {/* Rendered Math Content */}
                    <MathRenderer
                      content={m.content}
                      className={isUser ? "text-white" : "text-slate-800"}
                    />

                    {/* Assistant Action Bar */}
                    {!isUser && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        
                        {/* Audio & Copy Controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => speakMessage(m.id, m.content)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors flex items-center gap-1"
                            title={speakingId === m.id ? "Stop Listening" : "Listen (Read Aloud)"}
                          >
                            {speakingId === m.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[11px] font-bold text-red-500">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">Listen</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(m.id, m.content)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Thumbs Feedback & Quick Follow-ups */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleFeedback(m.id, "up")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              m.feedback === "up"
                                ? "bg-emerald-100 text-emerald-700 font-bold"
                                : "hover:bg-slate-100 text-slate-400 hover:text-emerald-600"
                            }`}
                            title="Helpful explanation"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleFeedback(m.id, "down")}
                            className={`p-1.5 rounded-lg transition-colors ${
                              m.feedback === "down"
                                ? "bg-rose-100 text-rose-700 font-bold"
                                : "hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                            }`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Smart Follow-up Pills for Assistant Messages */}
                    {!isUser && idx === messages.length - 1 && !loading && !isStreaming && (
                      <div className="pt-2 flex flex-wrap gap-1.5 text-xs">
                        <button
                          onClick={() => handleSend("Explain that more simply with an everyday picture analogy")}
                          className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors border border-indigo-200/60"
                        >
                          🐣 Explain more simply
                        </button>
                        <button
                          onClick={() => handleSend("Show me another valid mathematical method to solve this")}
                          className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors border border-purple-200/60"
                        >
                          🔄 Show another method
                        </button>
                        <button
                          onClick={() => handleSend("Give me another practice problem similar to this with different numbers")}
                          className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium transition-colors border border-amber-200/60"
                        >
                          🎯 Give another example
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Solving indicator */}
            {loading && !isStreaming && (
              <div className="flex items-center gap-3 text-indigo-700 text-xs font-bold pl-2 animate-pulse">
                <span className="text-xl">🦉</span>
                <span>Professor Pi is solving and verifying the solution...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Stop Generating Button */}
          {isStreaming && (
            <div className="py-1 px-4 bg-slate-100 border-t border-slate-200 flex justify-center">
              <button
                onClick={handleStopGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-all shadow-xs"
              >
                <Square className="w-3 h-3 fill-rose-600" />
                <span>Stop Generating</span>
              </button>
            </div>
          )}

          {/* Suggested Questions Section */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
            <SuggestedQuestions
              level={level}
              disabled={loading || isStreaming}
              onSelectQuestion={(q) => handleSend(q)}
            />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title={isListening ? "Listening... click to stop" : "Voice input"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Multiline auto-expanding textarea */}
            <textarea
              ref={inputRef}
              id="input-tutor-message"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask Professor Pi any math question (Press Enter to send, Shift+Enter for new line)...`}
              disabled={loading || isStreaming}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none max-h-28 overflow-y-auto"
            />

            {/* Send Button */}
            <button
              id="btn-send-tutor"
              type="submit"
              disabled={!input.trim() || loading || isStreaming}
              className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              title="Send question to Professor Pi"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. Interactive Practice Quiz Modal */}
      {practiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-fredoka font-bold text-lg text-slate-800">
                    Practice Mode: {practiceModal.topic}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Question {practiceModal.activeIndex + 1} of {practiceModal.questions.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPracticeModal(null)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const q = practiceModal.questions[practiceModal.activeIndex];
              const selectedAns = practiceAnswers[practiceModal.activeIndex];
              const isSubmitted = selectedAns !== undefined;

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 font-semibold text-slate-800 text-base">
                    {q.question}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.correctAnswer;
                      const isChosen = selectedAns === opt;

                      let btnStyle = "bg-white border-slate-200 hover:bg-indigo-50 text-slate-700";
                      if (isSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-500 text-white border-emerald-600 font-bold";
                        else if (isChosen) btnStyle = "bg-rose-500 text-white border-rose-600 font-bold";
                        else btnStyle = "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isSubmitted}
                          onClick={() =>
                            setPracticeAnswers((prev) => ({
                              ...prev,
                              [practiceModal.activeIndex]: opt,
                            }))
                          }
                          className={`p-3.5 rounded-2xl border-2 text-left font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <div className="font-bold">
                        {selectedAns === q.correctAnswer ? "🎉 Correct!" : "💡 Explanation:"}
                      </div>
                      <p>{q.explanation}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={practiceModal.activeIndex === 0}
                      onClick={() =>
                        setPracticeModal((prev) => ({
                          ...prev,
                          activeIndex: prev.activeIndex - 1,
                        }))
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    {practiceModal.activeIndex < practiceModal.questions.length - 1 ? (
                      <button
                        onClick={() =>
                          setPracticeModal((prev) => ({
                            ...prev,
                            activeIndex: prev.activeIndex + 1,
                          }))
                        }
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setPracticeModal(null)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Complete Practice
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}

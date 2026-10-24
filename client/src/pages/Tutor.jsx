// client/src/pages/Tutor.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Edit2,
  Edit3,
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
  Compass,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function Tutor() {
  const { user } = useAuth();

  // State
  const [level, setLevel] = useState("middle"); // elementary, middle, high, college, advanced
  const [conversationId, setConversationId] = useState(null);
  const [conversationTitle, setConversationTitle] = useState("Math Chat");
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [newTitleText, setNewTitleText] = useState("");

  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content: `Hello math adventurer! 🦉 I'm **Professor Pi**, your real-time AI mathematics companion.\n\nYou can ask me **any mathematics question** in natural language: from arithmetic ($25 \\times 48$), fractions, and percentages to algebra ($2x + 5 = 17$), quadratics, geometry, trigonometry, and calculus!\n\nWhat would you like to solve or understand today?`,
      finalAnswer: "",
      steps: [],
      source: "system",
      feedback: null,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [practiceModal, setPracticeModal] = useState(null); // { topic, questions, activeIndex }
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

  // Clean up speech and stream on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      abortControllerRef.current?.abort();
      recognitionRef.current?.stop();
    };
  }, []);

  // Handle Speech Recognition (Microphone input)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
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

  // Text to Speech (Listen aloud)
  const speakMessage = (msgId, text) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown and LaTeX symbols for clear, pleasant spoken voice
    const cleanSpeech = text
      .replace(/\$\$[\s\S]*?\$\$/g, " mathematical formula ")
      .replace(/\$[^\$]+?\$/g, " equation ")
      .replace(/[\*#_`]/g, "")
      .replace(/\\times/g, " times ")
      .replace(/\\div/g, " divided by ")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2");

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Friendly warm tone for Professor Pi
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message to clipboard
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
    setConversationTitle("Math Chat");
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: `Ready for a new adventure! 🦉 What math problem would you like to explore? Feel free to ask anything or select a topic suggestion below!`,
        finalAnswer: "",
        steps: [],
        source: "system",
        feedback: null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        setConversationTitle(res.data.conversation.title || "Math Chat");
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
            gameLink: m.metadata?.gameLink || null,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

  // Rename conversation
  const handleRenameConversation = async (convId, title) => {
    if (!title || !title.trim()) return;
    try {
      const res = await api.patch(`/conversations/${convId}`, { title: title.trim() });
      if (res.data.success) {
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, title: title.trim() } : c))
        );
        if (conversationId === convId) {
          setConversationTitle(title.trim());
        }
        setEditingTitleId(null);
      }
    } catch (err) {
      console.error("Error renaming conversation:", err);
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

  // Edit and resubmit a user message
  const handleEditUserMessage = (msgContent) => {
    setInput(msgContent);
    inputRef.current?.focus();
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  // Send message with streaming
  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading || isStreaming) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: userTime,
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
      timestamp: userTime,
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
                          gameLink: data.gameLink || null,
                        }
                      : m
                  )
                );
                // Refresh conversations list
                api.get("/conversations").then((r) => {
                  if (r.data.success) {
                    setConversations(r.data.conversations || []);
                    const current = r.data.conversations?.find((c) => c._id === data.conversationId);
                    if (current) setConversationTitle(current.title);
                  }
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
        console.log("Stream generation stopped by student.");
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

  // Generate Practice Quiz Modal
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
      alert("Could not load practice quiz right now. Try asking Professor Pi for a practice problem directly in chat!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header Card with Professor Pi Branding */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
        
        {/* Left: Avatar & Title */}
        <div className="flex items-center gap-3.5 z-10">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-md shrink-0">
              🦉
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-indigo-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-fredoka text-2xl sm:text-3xl font-bold tracking-tight">
                Professor Pi
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                AI Math Companion
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium">
              Real-Time Mathematics Solver & Step-by-Step Tutor
            </p>
          </div>
        </div>

        {/* Right: Controls & Level Selector */}
        <div className="flex flex-wrap items-center gap-2.5 z-10 w-full md:w-auto justify-between md:justify-end">
          
          {/* Grade / Level Dropdown */}
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

          {/* Saved Chats Toggle */}
          <button
            id="btn-tutor-history"
            onClick={() => setShowHistory(!showHistory)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs backdrop-blur-md transition-all active:scale-95 shadow-xs ${
              showHistory ? "bg-white text-indigo-900" : "bg-white/20 hover:bg-white/30 text-white"
            }`}
            title="View saved conversations"
          >
            <History className="w-4 h-4" />
            <span>Saved Chats</span>
          </button>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Main Chat Area + History Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Saved Chats Sidebar (Toggled) */}
        {showHistory && (
          <div className="lg:col-span-1 bg-white rounded-3xl border-2 border-indigo-100 shadow-md p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-fredoka font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Saved Conversations</span>
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[520px] overflow-y-auto space-y-1.5 pr-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No saved conversations yet. Ask a question to start one!
                </p>
              ) : (
                conversations.map((conv) => {
                  const isCurrent = conversationId === conv._id;
                  const isEditing = editingTitleId === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => !isEditing && loadConversation(conv._id)}
                      className={`group flex items-center justify-between p-2.5 rounded-2xl cursor-pointer text-xs font-medium transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "hover:bg-indigo-50 text-slate-700 border border-transparent hover:border-indigo-100"
                      }`}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={newTitleText}
                            onChange={(e) => setNewTitleText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameConversation(conv._id, newTitleText);
                              if (e.key === "Escape") setEditingTitleId(null);
                            }}
                            className="w-full px-2 py-1 bg-white text-slate-900 rounded-lg text-xs border border-indigo-300 focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={() => handleRenameConversation(conv._id, newTitleText)}
                            className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingTitleId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="truncate pr-2 flex-1">
                            <span className="font-semibold block truncate">
                              {conv.title || "Math Chat"}
                            </span>
                            <span className={`text-[10px] ${isCurrent ? "text-indigo-200" : "text-slate-400"}`}>
                              {new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Rename button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTitleId(conv._id);
                                setNewTitleText(conv.title || "");
                              }}
                              className={`p-1 rounded-md ${
                                isCurrent
                                  ? "hover:bg-indigo-700 text-indigo-200"
                                  : "hover:bg-indigo-100 text-indigo-600"
                              }`}
                              title="Rename chat"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={(e) => deleteConversation(e, conv._id)}
                              className={`p-1 rounded-md ${
                                isCurrent
                                  ? "hover:bg-indigo-700 text-indigo-200"
                                  : "hover:bg-red-100 text-red-500"
                              }`}
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Main Conversation Canvas */}
        <div
          className={`${
            showHistory ? "lg:col-span-3" : "lg:col-span-4"
          } bg-white rounded-3xl border-2 border-indigo-100 shadow-lg overflow-hidden flex flex-col h-[670px] transition-all`}
        >
          {/* Sub-header Bar */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 truncate max-w-[200px] sm:max-w-xs">
                {conversationTitle}
              </span>
              <span className="hidden sm:inline-block text-slate-400">|</span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                AI + Deterministic Solver
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenPractice("Algebra")}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Practice Quiz</span>
              </button>
              <button
                onClick={() =>
                  handleSend("Explain the difference between perimeter and area with a garden example")
                }
                className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold transition-colors items-center gap-1 shadow-2xs"
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
                        : "bg-gradient-to-br from-indigo-100 to-purple-200 text-purple-900 border border-purple-300"
                    }`}
                  >
                    {isUser ? "👤" : "🦉"}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed shadow-xs space-y-3 ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border-2 border-indigo-50 rounded-tl-xs shadow-sm"
                    }`}
                  >
                    {/* Rendered Math Content */}
                    <MathRenderer
                      content={m.content}
                      className={isUser ? "text-white" : "text-slate-800"}
                    />

                    {/* Linked Math Adventure Mission / Real-World Chip */}
                    {!isUser && m.gameLink && (
                      <div className="pt-2">
                        <Link
                          to={m.gameLink.route}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-600" />
                          <span>Practice in Math Adventure: {m.gameLink.name}</span>
                          <ExternalLink className="w-3 h-3 text-amber-600" />
                        </Link>
                      </div>
                    )}

                    {/* Footer Row (Timestamp & Action Controls) */}
                    <div
                      className={`pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                        isUser ? "border-indigo-500/40 text-indigo-200" : "border-slate-100 text-slate-500"
                      }`}
                    >
                      {/* Left: Timestamp & Edit (for User) */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium opacity-80">
                          {m.timestamp || "Just now"}
                        </span>
                        {isUser && (
                          <button
                            onClick={() => handleEditUserMessage(m.content)}
                            className="p-1 rounded-md hover:bg-indigo-700 text-indigo-100 transition-colors flex items-center gap-1 text-[10px]"
                            title="Edit this question"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>

                      {/* Right: Controls for Assistant Message */}
                      {!isUser && (
                        <div className="flex items-center gap-1.5">
                          {/* Audio Listen */}
                          <button
                            onClick={() => speakMessage(m.id, m.content)}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors flex items-center gap-1"
                            title={speakingId === m.id ? "Stop Listening" : "Listen (Read Aloud)"}
                          >
                            {speakingId === m.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-red-500">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-medium">Listen</span>
                              </>
                            )}
                          </button>

                          {/* Copy Content */}
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

                          {/* Thumbs Feedback */}
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
                      )}
                    </div>

                    {/* Quick Smart Follow-up Pills for Latest Assistant Message */}
                    {!isUser && idx === messages.length - 1 && !loading && !isStreaming && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs">
                        <button
                          onClick={() => handleSend("Explain more simply with an everyday picture analogy")}
                          className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors border border-indigo-200/60 active:scale-95"
                        >
                          🐣 Explain more simply
                        </button>
                        <button
                          onClick={() => handleSend("Show another method to solve this")}
                          className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition-colors border border-purple-200/60 active:scale-95"
                        >
                          🔄 Show another method
                        </button>
                        <button
                          onClick={() => handleSend("Give another example covering the same concept")}
                          className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition-colors border border-amber-200/60 active:scale-95"
                        >
                          🎯 Give another example
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold transition-colors border border-slate-200 active:scale-95 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Typing & Solving Indicator */}
            {loading && !isStreaming && (
              <div className="flex items-center gap-3 text-indigo-700 text-xs font-bold pl-2 animate-pulse">
                <span className="text-xl">🦉</span>
                <div className="flex items-center gap-1">
                  <span>Professor Pi is calculating & verifying solution</span>
                  <span className="flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Stop Generating Button (when streaming) */}
          {isStreaming && (
            <div className="py-1.5 px-4 bg-slate-100 border-t border-slate-200 flex justify-center">
              <button
                id="btn-stop-generating"
                onClick={handleStopGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-rose-600" />
                <span>Stop Generating</span>
              </button>
            </div>
          )}

          {/* Suggested Mathematics Questions */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
            <SuggestedQuestions
              level={level}
              disabled={loading || isStreaming}
              onSelectQuestion={(q) => handleSend(q)}
            />
          </div>

          {/* Input & Voice Controls Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            {/* Microphone Voice-to-Text Button */}
            <button
              id="btn-mic-input"
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
              title={isListening ? "Listening to your voice... click to stop" : "Voice input (Microphone)"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Multi-line auto-expanding textarea */}
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

            {/* Send Message Button */}
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

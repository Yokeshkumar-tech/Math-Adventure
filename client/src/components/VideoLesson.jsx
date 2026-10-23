// client/src/components/VideoLesson.jsx - Narrated video-style slide lesson
import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Volume2, VolumeX, Sparkles, CheckCircle2 } from "lucide-react";

const SCENES = [
  {
    title: "What is a Fraction?",
    say: "What is a fraction? Let's learn using a delicious pizza!",
    visual: { parts: 4, shaded: 0, subtitle: "Whole Pizza (1 Whole)" },
    highlight: "Fraction = Part of a Whole",
  },
  {
    title: "Equal Slices",
    say: "This pizza is cut into four equal slices.",
    visual: { parts: 4, shaded: 0, subtitle: "4 Equal Slices" },
    highlight: "The slices must be equal in size!",
  },
  {
    title: "Eating One Slice",
    say: "If we eat one slice, we eat one fourth of the pizza.",
    visual: { parts: 4, shaded: 1, subtitle: "1 slice eaten out of 4" },
    highlight: "We write this as 1/4",
  },
  {
    title: "Numerator & Denominator",
    say: "In one over four, the top number one is the numerator. It counts the slices we ate. The bottom number four is the denominator. It counts all equal slices in the whole pizza.",
    visual: { parts: 4, shaded: 1, subtitle: "Numerator (Top) / Denominator (Bottom)" },
    highlight: "Top = Parts we have | Bottom = Total equal parts",
  },
  {
    title: "Your Turn to Think!",
    say: "If two out of four slices are eaten, how many slices remain?",
    visual: { parts: 4, shaded: 2, subtitle: "2 slices eaten out of 4" },
    interactive: true,
    question: "How many slices remain?",
    answer: "2 slices remain, which is 2/4 or 1/2 of the pizza!",
  },
  {
    title: "Champion Celebration!",
    say: "Great job! You have learned the fundamentals of fractions!",
    visual: { parts: 4, shaded: 4, subtitle: "Full Pizza Explored!" },
    celebrate: true,
    highlight: "Fraction Explorer Badge Earned! 🏆",
  },
];

export default function VideoLesson({ onClose }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const utteranceRef = useRef(null);

  const scene = SCENES[currentScene];

  const speakCurrentScene = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (!isMuted) {
        const u = new SpeechSynthesisUtterance(scene.say);
        u.rate = 0.95;
        u.pitch = 1.05;
        u.onend = () => {
          if (isPlaying && currentScene < SCENES.length - 1) {
            setTimeout(() => {
              setCurrentScene((prev) => prev + 1);
            }, 1000);
          } else if (currentScene === SCENES.length - 1) {
            setIsPlaying(false);
          }
        };
        utteranceRef.current = u;
        window.speechSynthesis.speak(u);
      }
    }
  };

  useEffect(() => {
    setRevealed(false);
    if (scene.celebrate) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    if (isPlaying) {
      speakCurrentScene();
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScene, isPlaying, isMuted]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        handleNext();
      } else if (e.code === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentScene, isPlaying]);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      speakCurrentScene();
    } else {
      setIsPlaying(false);
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  const handleNext = () => {
    if (currentScene < SCENES.length - 1) {
      setCurrentScene(currentScene + 1);
    }
  };

  const handlePrev = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
    }
  };

  const handleReplay = () => {
    setCurrentScene(0);
    setIsPlaying(true);
  };

  // Render SVG Pizza for scene visual
  const renderVisualPizza = (parts, shaded) => {
    const size = 180;
    const r = size / 2 - 8;
    const c = size / 2;

    const slices = Array.from({ length: parts }, (_, i) => {
      const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
      const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const d = `M${c},${c} L${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${
        c + r * Math.cos(a1)
      },${c + r * Math.sin(a1)} Z`;
      const isSliceShaded = i < shaded;

      return (
        <path
          key={i}
          d={d}
          fill={isSliceShaded ? "#F59E0B" : "#FEF3C7"}
          stroke="#78350F"
          strokeWidth="3"
        />
      );
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="#B45309" stroke="#78350F" strokeWidth="4" />
        {slices}
      </svg>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center max-w-2xl mx-auto my-4">
      
      {/* Top Banner */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
        <span className="flex items-center gap-2 text-indigo-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>Interactive Video Lesson: Fractions</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title={isMuted ? "Unmute voice" : "Mute voice"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded-md text-slate-300"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Screen Frame */}
      <div className="w-full bg-gradient-to-b from-slate-950 to-slate-900 rounded-2xl p-6 my-4 border border-slate-800 flex flex-col items-center min-h-[320px] justify-between relative shadow-inner">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            Scene {currentScene + 1} of {SCENES.length}
          </span>
          <h4 className="font-fredoka text-2xl font-bold text-white mt-1">
            {scene.title}
          </h4>
        </div>

        {/* Center Visual */}
        <div className="my-3 flex flex-col items-center animate-pulse-subtle">
          {renderVisualPizza(scene.visual.parts, scene.visual.shaded)}
          <span className="text-xs font-mono text-amber-300 bg-slate-800/80 px-3 py-1 rounded-full mt-3 border border-amber-400/30">
            {scene.visual.subtitle}
          </span>
        </div>

        {/* Interactive Check in Scene 5 */}
        {scene.interactive && (
          <div className="mt-2 text-center w-full">
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-105"
              >
                Reveal Answer 💡
              </button>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl text-amber-300 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                {scene.answer}
              </div>
            )}
          </div>
        )}

        {/* Celebration in Scene 6 */}
        {scene.celebrate && (
          <div className="mt-2 flex items-center gap-2 text-amber-300 font-bold text-base animate-bounce-gentle">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>You've Mastered Fraction Basics!</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        )}

        {/* Captions Box (Synchronized text) */}
        <div className="w-full mt-4 p-3.5 bg-slate-800/90 border border-indigo-500/30 rounded-xl text-center">
          <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed font-sans">
            "{scene.say}"
          </p>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2 my-2">
        {SCENES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentScene(idx)}
            className={`h-2.5 rounded-full transition-all ${
              currentScene === idx ? "w-8 bg-indigo-500" : "w-2.5 bg-slate-700 hover:bg-slate-600"
            }`}
            aria-label={`Jump to scene ${idx + 1}`}
          />
        ))}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={handlePrev}
          disabled={currentScene === 0}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
          title="Previous Scene (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={togglePlay}
          className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/40 transition-all hover:scale-105"
          title="Play / Pause (Spacebar)"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>{currentScene === SCENES.length - 1 ? "Play Again" : "Play Lesson"}</span>
            </>
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentScene === SCENES.length - 1}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
          title="Next Scene (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleReplay}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Restart from Scene 1"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 text-[11px] text-slate-500 font-medium">
        Keyboard: [Space] Play/Pause • [Left/Right] Previous/Next scene
      </div>
    </div>
  );
}

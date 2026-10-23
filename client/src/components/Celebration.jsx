// client/src/components/Celebration.jsx
import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, X } from "lucide-react";

export default function Celebration({ badges = [], levelUp = null, onClose }) {
  useEffect(() => {
    // Fire confetti cannon
    const end = Date.now() + 2 * 1000;
    const colors = ["#4F46E5", "#F59E0B", "#10B981", "#EC4899"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative border-4 border-amber-300 transform scale-100 animate-bounce-gentle">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-300">
          🏆
        </div>

        <h3 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800">
          Congratulations!
        </h3>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          You made fantastic math progress!
        </p>

        {/* Level Up Banner */}
        {levelUp && (
          <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
            <span className="text-xs uppercase tracking-wider text-indigo-600 font-bold">
              Level Up!
            </span>
            <h4 className="font-fredoka text-xl font-bold text-indigo-900 mt-0.5">
              Level {levelUp} Champion! 🚀
            </h4>
          </div>
        )}

        {/* Unlocked Badges */}
        {badges && badges.length > 0 && (
          <div className="my-4 space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              New Badges Unlocked:
            </span>
            <div className="flex flex-col gap-2">
              {badges.map((b) => (
                <div
                  key={b._id || b.key}
                  className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left"
                >
                  <span className="text-3xl">{b.icon}</span>
                  <div>
                    <h5 className="font-fredoka font-bold text-slate-800 text-base">
                      {b.name}
                    </h5>
                    <p className="text-xs text-slate-600">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-fredoka text-lg font-bold shadow-md shadow-indigo-300 transition-all hover:scale-102"
        >
          Keep Exploring! 🌟
        </button>
      </div>
    </div>
  );
}

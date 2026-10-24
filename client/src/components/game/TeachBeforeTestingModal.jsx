// client/src/components/game/TeachBeforeTestingModal.jsx
import React, { useState } from "react";
import MathVisualizer from "../MathVisualizer.jsx";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  X,
  Trophy,
} from "lucide-react";

export default function TeachBeforeTestingModal({
  isOpen,
  onClose,
  onStartMission,
  topic = "Addition",
  missionTitle = "Adventure Quest",
}) {
  const [step, setStep] = useState(1);
  const [guidedAnswer, setGuidedAnswer] = useState("");
  const [guidedFeedback, setGuidedFeedback] = useState(null);

  if (!isOpen) return null;

  // Curate teaching content based on the target topic
  const getConceptData = () => {
    const t = (topic || "").toLowerCase();
    if (t.includes("fraction")) {
      return {
        concept: "Fractions mean equal parts of a whole!",
        explanation:
          "Imagine cutting a fresh pizza or chocolate bar. The bottom number (Denominator) tells you how many equal slices the whole thing is cut into. The top number (Numerator) tells you how many slices you actually have!",
        realWorld:
          "When you order a pizza cut into 4 slices and eat 1 slice, you have eaten 1/4 of the pizza!",
        visualType: "pizza",
        exampleWalkthrough: [
          "Step 1: Count total equal slices (e.g. 4 slices).",
          "Step 2: Count the slices taken or shaded (e.g. 1 slice).",
          "Step 3: Write it as 1/4. One out of four equal parts!",
        ],
        tryQuestion: "If a cake is cut into 8 equal slices and you eat 2 slices, what fraction did you eat?",
        tryOptions: ["1/4", "1/2", "3/8", "1/8"],
        tryCorrect: "1/4",
        tryExplanation: "2 out of 8 slices is 2/8. When you simplify by dividing top and bottom by 2, 2/8 becomes 1/4!",
      };
    } else if (t.includes("multiply") || t.includes("multiplication")) {
      return {
        concept: "Multiplication means equal groups!",
        explanation:
          "Instead of adding the same number again and again, multiplication is a magical shortcut. 4 × 6 means you have 4 equal groups, and each group has 6 items inside!",
        realWorld:
          "If you have 4 egg cartons and each carton holds 6 eggs, you have 6 + 6 + 6 + 6 = 24 eggs in total!",
        visualType: "multiplication",
        exampleWalkthrough: [
          "Step 1: Identify the number of groups (4 cartons).",
          "Step 2: Identify how many are in each group (6 eggs).",
          "Step 3: Multiply: 4 × 6 = 24 total eggs!",
        ],
        tryQuestion: "You collect 3 chests. Each chest contains 5 gold coins. How many coins do you have in total?",
        tryOptions: ["15 coins", "12 coins", "18 coins", "8 coins"],
        tryCorrect: "15 coins",
        tryExplanation: "3 chests × 5 coins each = 5 + 5 + 5 = 15 coins!",
      };
    } else if (t.includes("divide") || t.includes("division")) {
      return {
        concept: "Division means sharing equally!",
        explanation:
          "When you want to share a treasure fairly among friends so everyone receives the exact same amount, you divide. Any leftovers are called the remainder!",
        realWorld:
          "You have 12 cookies to share fairly with 3 friends. 12 ÷ 3 = 4 delicious cookies for each friend!",
        visualType: "division",
        exampleWalkthrough: [
          "Step 1: Count the total items (12 cookies).",
          "Step 2: Count how many people or chests to share into (3 friends).",
          "Step 3: Divide: 12 ÷ 3 = 4 each, with 0 left over!",
        ],
        tryQuestion: "Share 15 magical crystals equally among 3 wizards. How many crystals does each wizard get?",
        tryOptions: ["5 crystals", "4 crystals", "6 crystals", "3 crystals"],
        tryCorrect: "5 crystals",
        tryExplanation: "15 ÷ 3 = 5 crystals each without any left over!",
      };
    } else if (t.includes("area") || t.includes("perimeter")) {
      return {
        concept: "Perimeter is the border. Area is the space inside!",
        explanation:
          "Perimeter is like walking all the way around the outside fence. Area is counting all the flat square floor tiles that fit completely inside the room!",
        realWorld:
          "To fence a rectangular playground (12m by 8m), add all 4 sides: 12 + 8 + 12 + 8 = 40m fence! To turf it with grass, multiply Length × Width: 12 × 8 = 96 m²!",
        visualType: "area-grid",
        exampleWalkthrough: [
          "Step 1: For Perimeter: add (Length + Width) × 2.",
          "Step 2: For Area: multiply Length × Width.",
          "Step 3: A 4m by 3m room has Perimeter = 14m, and Area = 12 square meters!",
        ],
        tryQuestion: "What is the area of a rectangle with length 5 cm and width 3 cm?",
        tryOptions: ["15 sq cm", "16 sq cm", "8 sq cm", "12 sq cm"],
        tryCorrect: "15 sq cm",
        tryExplanation: "Area = Length × Width = 5 cm × 3 cm = 15 square cm!",
      };
    } else if (t.includes("money") || t.includes("budget") || t.includes("shop")) {
      return {
        concept: "Money Math: Total bill and finding your change!",
        explanation:
          "When shopping, add up the prices of all the items in your basket to find your Total Bill. Then subtract that bill from the money in your wallet to find your change!",
        realWorld:
          "You have ₹500. You buy Rice (₹180), Milk (₹60), and Fruit (₹120). Bill = ₹180 + ₹60 + ₹120 = ₹360. Your change = ₹500 − ₹360 = ₹140!",
        visualType: "money",
        exampleWalkthrough: [
          "Step 1: Sum purchases: ₹180 + ₹60 + ₹120 = ₹360.",
          "Step 2: Pay cash note: ₹500.",
          "Step 3: Subtract: ₹500 − ₹360 = ₹140 change returned to you!",
        ],
        tryQuestion: "You have ₹200. You buy a notebook for ₹70 and a pen for ₹30. How much money is left?",
        tryOptions: ["₹100", "₹120", "₹80", "₹110"],
        tryCorrect: "₹100",
        tryExplanation: "Total spent = ₹70 + ₹30 = ₹100. Remaining = ₹200 − ₹100 = ₹100!",
      };
    } else {
      // Default: Addition & Basic Arithmetic
      return {
        concept: "Addition means putting numbers together!",
        explanation:
          "When you have two separate groups and bring them together into one big basket, you add them. The total count is called the Sum!",
        realWorld:
          "You find 3 shiny red apples under a tree, and your companion brings 2 more apples. 3 + 2 = 5 juicy apples to share!",
        visualType: "counting",
        exampleWalkthrough: [
          "Step 1: Start with your first group (3 apples).",
          "Step 2: Count up by the second group (+2: 4, 5).",
          "Step 3: Total is 5 apples!",
        ],
        tryQuestion: "You have 4 gold coins and discover 3 more coins in a jar. How many coins do you have now?",
        tryOptions: ["7 coins", "6 coins", "8 coins", "9 coins"],
        tryCorrect: "7 coins",
        tryExplanation: "4 coins + 3 coins = 7 coins! You counted them up perfectly!",
      };
    }
  };

  const data = getConceptData();

  const handleTryOption = (opt) => {
    setGuidedAnswer(opt);
    if (opt === data.tryCorrect) {
      setGuidedFeedback({
        isCorrect: true,
        text: `🎉 Brilliant! ${data.tryExplanation}`,
      });
    } else {
      setGuidedFeedback({
        isCorrect: false,
        text: `Almost! Keep trying. Hint: ${data.tryExplanation}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <div className="p-5 border-b border-indigo-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner animate-pulse-subtle">
              🦉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-fredoka uppercase">
                  Teach Before Testing
                </span>
                <span className="text-xs text-indigo-300 font-medium">with Professor Pi</span>
              </div>
              <h2 className="text-xl font-bold text-white font-fredoka mt-0.5">
                {missionTitle}: {topic}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Teaching Steps Progress Bar */}
        <div className="px-6 pt-4 flex items-center justify-between gap-1 text-xs font-bold text-slate-400">
          {[
            { num: 1, label: "Concept" },
            { num: 2, label: "Visual Toy" },
            { num: 3, label: "Story" },
            { num: 4, label: "Try It!" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex-1 py-1.5 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                step === s.num
                  ? "bg-amber-400 text-slate-900 border-amber-300 shadow-md font-extrabold"
                  : step > s.num
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-600/40"
                  : "bg-slate-800/40 text-slate-500 border-slate-700/60"
              }`}
            >
              <span>{step > s.num ? "✓" : s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body Based on Current Step */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-400/10 border-2 border-amber-400/40 rounded-2xl p-5 flex items-start gap-4">
                <span className="text-4xl">💡</span>
                <div>
                  <h3 className="text-lg font-bold text-amber-300 font-fredoka mb-1">
                    {data.concept}
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {data.explanation}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Solved Walkthrough */}
              <div className="bg-slate-900/90 border border-indigo-800/60 rounded-2xl p-4 space-y-2">
                <p className="text-xs uppercase font-bold text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Step-by-Step Method</span>
                </p>
                <div className="space-y-1.5">
                  {data.exampleWalkthrough.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fadeIn text-center">
              <p className="text-xs font-semibold text-slate-300">
                Touch and manipulate the visual controls below to see how numbers change!
              </p>
              <div className="bg-slate-900/80 p-2 rounded-2xl border border-indigo-900/60">
                <MathVisualizer type={data.visualType} topic={topic} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-950/60 border border-indigo-700/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase">
                  <span>🌍 Real-World Mathematics Application</span>
                </div>
                <h3 className="text-base font-bold text-white font-fredoka">
                  Everyday Scenario
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {data.realWorld}
                </p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🦉</span>
                <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                  "See? Mathematics isn't just numbers on a blackboard—it's how bakers bake cakes, how architects build towers, and how adventurers divide treasure!"
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-900/90 border border-amber-400/50 rounded-2xl p-5 space-y-3">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  Guided Try-It Example
                </span>
                <h3 className="text-base font-bold text-white font-fredoka">
                  {data.tryQuestion}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {data.tryOptions.map((opt, i) => {
                    const isPicked = guidedAnswer === opt;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTryOption(opt)}
                        className={`p-3 rounded-xl border text-sm font-bold transition flex items-center justify-between ${
                          isPicked
                            ? "bg-amber-400 text-slate-900 border-amber-300 shadow-md scale-102"
                            : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                        }`}
                      >
                        <span>{opt}</span>
                        {isPicked && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {guidedFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
                    guidedFeedback.isCorrect
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  <span className="text-lg">{guidedFeedback.isCorrect ? "🎉" : "💡"}</span>
                  <span>{guidedFeedback.text}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-indigo-800/60 bg-slate-950/60 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              ← Previous Step
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartMission();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-400/20 flex items-center gap-2 transition hover:scale-105"
            >
              <span>Ready for Mission Quest!</span>
              <Trophy className="w-4 h-4 text-slate-900" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

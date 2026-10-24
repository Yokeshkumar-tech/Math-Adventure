// client/src/components/SuggestedQuestions.jsx
import React from "react";
import { Sparkles } from "lucide-react";

export default function SuggestedQuestions({ level = "middle", onSelectQuestion, disabled = false }) {
  const suggestionsByLevel = {
    elementary: [
      { text: "What is 25 × 48?", category: "Arithmetic" },
      { text: "What is 15% of 800?", category: "Percentages" },
      { text: "Add 1/2 + 1/3", category: "Fractions" },
      { text: "Explain fractions using a pizza example 🍕", category: "Analogy" },
      { text: "What is the perimeter of a square with side 6 cm?", category: "Geometry" },
    ],
    middle: [
      { text: "Solve 2x + 5 = 17", category: "Algebra" },
      { text: "What is 15% of 800?", category: "Percentages" },
      { text: "Find the area of a circle with radius 7 cm", category: "Geometry" },
      { text: "Find the mean, median, and mode of 10, 20, 20, 30, 40", category: "Statistics" },
      { text: "Teach me the Pythagorean theorem", category: "Geometry" },
      { text: "What is the probability of flipping heads on a fair coin?", category: "Probability" },
    ],
    high: [
      { text: "Solve x^2 - 5x + 6 = 0", category: "Quadratic" },
      { text: "Explain matrices and matrix multiplication", category: "Matrices" },
      { text: "Find the hypotenuse of a right triangle with sides 6 and 8", category: "Geometry" },
      { text: "Solve 3x - 7 = 11", category: "Algebra" },
      { text: "What is sin(30 degrees)?", category: "Trigonometry" },
    ],
    college: [
      { text: "Differentiate x^3 + 2x", category: "Calculus" },
      { text: "Integrate 2x + 3", category: "Integration" },
      { text: "Explain eigenvalues and eigenvectors intuitively", category: "Linear Algebra" },
      { text: "Find the derivative of x^3 - 4x + 1", category: "Calculus" },
    ],
    advanced: [
      { text: "Differentiate f(x) = e^(2x) * cos(3x) using product rule", category: "Advanced Calculus" },
      { text: "Explain the Fourier Transform with visual intuition", category: "Applied Math" },
      { text: "What is the rank-nullity theorem and why is it important?", category: "Linear Algebra" },
    ],
  };

  const list = suggestionsByLevel[level] || suggestionsByLevel.middle;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Suggested Mathematics Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(item.text)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-900 text-xs font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-indigo-200/70 text-[10px] font-bold text-slate-600 group-hover:text-indigo-800 transition-colors">
              {item.category}
            </span>
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

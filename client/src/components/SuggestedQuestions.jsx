// client/src/components/SuggestedQuestions.jsx
import React from "react";
import { Sparkles } from "lucide-react";

export default function SuggestedQuestions({ level = "middle", onSelectQuestion, disabled = false }) {
  const suggestionsByLevel = {
    elementary: [
      { text: "Explain fractions using a pizza example 🍕", category: "Concept" },
      { text: "Add 1/2 + 1/3", category: "Fractions" },
      { text: "Calculate 125 + 275", category: "Arithmetic" },
      { text: "What is 15% of 800?", category: "Percentages" },
      { text: "What is the perimeter of a square with side 6 cm?", category: "Geometry" },
    ],
    middle: [
      { text: "Solve 2x + 5 = 15", category: "Algebra" },
      { text: "Solve 3x - 7 = 11", category: "Algebra" },
      { text: "Calculate the mean of 10, 20, and 30", category: "Statistics" },
      { text: "What is the probability of flipping heads on a fair coin?", category: "Probability" },
      { text: "Find the area of a circle with radius 7", category: "Geometry" },
      { text: "Teach me the Pythagorean theorem", category: "Geometry" },
    ],
    high: [
      { text: "Solve x^2 - 5x + 6 = 0 using factoring", category: "Quadratic" },
      { text: "Teach me the Pythagorean theorem with a 3-4-5 triangle", category: "Trigonometry" },
      { text: "Calculate compound interest on ₹10,000 at 10% for 2 years", category: "Finance" },
      { text: "Find the hypotenuse of right triangle with sides 6 and 8", category: "Geometry" },
      { text: "Explain standard deviation with a real-life example", category: "Statistics" },
    ],
    college: [
      { text: "Find the derivative of x^3 - 4x + 1", category: "Calculus" },
      { text: "Evaluate the integral of 3x^2 + 2x dx", category: "Integration" },
      { text: "Explain eigenvalues and eigenvectors intuitively", category: "Linear Algebra" },
      { text: "How do we test for convergence using the ratio test?", category: "Series" },
      { text: "Find the limit as x approaches 0 of sin(x)/x", category: "Calculus" },
    ],
    advanced: [
      { text: "Differentiate f(x) = e^(2x) * cos(3x) using product rule", category: "Advanced Calculus" },
      { text: "Explain the Fourier Transform with visual intuition", category: "Applied Math" },
      { text: "What is the rank-nullity theorem and why is it important?", category: "Linear Algebra" },
      { text: "Solve the first-order differential equation dy/dx + 2y = 4", category: "Diff Equations" },
    ],
  };

  const list = suggestionsByLevel[level] || suggestionsByLevel.middle;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Suggested Questions & Inquiries</span>
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

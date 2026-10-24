// client/src/pages/LearningCenter.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Sparkles, ChevronRight, Calculator } from "lucide-react";
import { playClickSound } from "../utils/soundEffects";

const FORMULAS_DATA = [
  // ARITHMETIC
  {
    id: "pemdas",
    category: "Arithmetic",
    realm: "Number Forest",
    title: "Order of Operations (BODMAS / PEMDAS)",
    formula: "B (Brackets) ➔ O (Orders/Powers) ➔ D/M (Division & Multiplication) ➔ A/S (Addition & Subtraction)",
    explanation: "Always solve operations inside brackets first, then powers, then division and multiplication from left to right, and finally addition and subtraction from left to right.",
    example: "8 + 4 × (6 − 2) ÷ 2 = 8 + 4 × 4 ÷ 2 = 8 + 16 ÷ 2 = 8 + 8 = 16.",
    tags: ["arithmetic", "operations", "bodmas", "pemdas"],
  },
  {
    id: "divisibility",
    category: "Arithmetic",
    realm: "Number Forest",
    title: "Divisibility Rules (2, 3, 5, 9, 10)",
    formula: "Divisible by 2: Ends in 0,2,4,6,8 • Divisible by 3: Sum of digits is divisible by 3 • Divisible by 5: Ends in 0 or 5 • Divisible by 9: Sum of digits is divisible by 9.",
    explanation: "Use these mental math shortcuts to quickly determine if a number divides evenly without leaving a remainder.",
    example: "Is 423 divisible by 3? 4 + 2 + 3 = 9. Since 9 is divisible by 3, 423 is divisible by 3 (423 ÷ 3 = 141).",
    tags: ["divisibility", "factors", "arithmetic"],
  },

  // FRACTIONS
  {
    id: "fraction-add",
    category: "Fractions",
    realm: "Fraction Kingdom",
    title: "Adding & Subtracting Fractions",
    formula: "a/b ± c/d = (a×d ± c×b) / (b×d)",
    explanation: "Fractions must share a common denominator before you can add or subtract their numerators.",
    example: "1/3 + 2/5 = (1×5 + 2×3) / 15 = (5 + 6) / 15 = 11/15.",
    tags: ["fractions", "addition", "denominator"],
  },
  {
    id: "fraction-mult",
    category: "Fractions",
    realm: "Fraction Kingdom",
    title: "Multiplying & Dividing Fractions",
    formula: "Multiplication: (a/b) × (c/d) = (a×c)/(b×d) • Division: (a/b) ÷ (c/d) = (a/b) × (d/c)",
    explanation: "To multiply fractions, multiply across the tops and bottoms. To divide fractions, 'Keep, Change, Flip' (invert the second fraction and multiply).",
    example: "2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.",
    tags: ["fractions", "multiply", "divide"],
  },

  // PERCENTAGES
  {
    id: "percentages-basic",
    category: "Percentages",
    realm: "Percentage Desert",
    title: "Calculating Percentage of an Amount",
    formula: "Percentage Value = (Percent / 100) × Total Amount",
    explanation: "'Percent' literally means 'out of 100'. Convert the percent to a fraction or decimal, then multiply by the total quantity.",
    example: "What is 20% of ₹500? Value = (20/100) × 500 = 0.20 × 500 = ₹100.",
    tags: ["percentage", "discount", "desert"],
  },
  {
    id: "discounts",
    category: "Percentages",
    realm: "Percentage Desert",
    title: "Discounts and Final Sale Price",
    formula: "Discount Amount = (Discount % / 100) × Original Price • Sale Price = Original Price − Discount Amount",
    explanation: "A discount lowers the price of an item. Subtract the discount amount from the sticker price to get what you pay.",
    example: "A ₹800 jacket has a 25% discount. Discount = 25% of 800 = ₹200. Sale Price = ₹800 − ₹200 = ₹600.",
    tags: ["discount", "shopping", "profit"],
  },

  // GEOMETRY
  {
    id: "geom-perimeter",
    category: "Geometry",
    realm: "Geometry Mountains",
    title: "Perimeter of Polygons",
    formula: "Rectangle: P = 2 × (Length + Width) • Square: P = 4 × Side • Triangle: P = a + b + c",
    explanation: "Perimeter is the total boundary distance around the outside edge of a 2D shape.",
    example: "A rectangle with Length = 10m and Width = 6m: P = 2 × (10 + 6) = 2 × 16 = 32 meters.",
    tags: ["geometry", "perimeter", "shapes"],
  },
  {
    id: "geom-area",
    category: "Geometry",
    realm: "Geometry Mountains",
    title: "Area Formulas (Rectangle, Triangle, Square)",
    formula: "Rectangle: Area = Length × Width • Triangle: Area = (Base × Height) ÷ 2 • Square: Area = Side²",
    explanation: "Area is the amount of 2D surface space enclosed inside the shape's boundary, measured in square units (m², cm²).",
    example: "A triangle with Base = 12 cm and Height = 7 cm: Area = (12 × 7) ÷ 2 = 84 ÷ 2 = 42 cm².",
    tags: ["geometry", "area", "shapes"],
  },

  // PROBABILITY
  {
    id: "prob-basic",
    category: "Probability",
    realm: "Probability Galaxy",
    title: "Theoretical Probability Formula",
    formula: "P(Event) = (Number of Favorable Outcomes) / (Total Number of Possible Outcomes)",
    explanation: "Probability measures the likelihood of an event occurring, expressed as a fraction between 0 (impossible) and 1 (certain).",
    example: "Rolling an even number on a 6-sided die: Favorable = {2, 4, 6} (3 outcomes). Total = 6 outcomes. P = 3/6 = 1/2 = 50%.",
    tags: ["probability", "galaxy", "dice"],
  },

  // REAL-WORLD MATH
  {
    id: "rw-speed",
    category: "Real-World",
    realm: "Everyday Math",
    title: "Speed, Distance, and Time Triangle",
    formula: "Speed = Distance ÷ Time • Distance = Speed × Time • Time = Distance ÷ Speed",
    explanation: "Use this triangle formula to calculate journey duration, driving speed, or travel distances in everyday life.",
    example: "A car travels 150 km in 2.5 hours. Speed = 150 ÷ 2.5 = 60 km/h.",
    tags: ["speed", "travel", "distance", "real-world"],
  },
  {
    id: "rw-interest",
    category: "Real-World",
    realm: "Everyday Math",
    title: "Simple Interest (Savings & Loans)",
    formula: "Interest (I) = (Principal × Rate × Time) ÷ 100",
    explanation: "Principal is the initial money deposited, Rate is the annual interest percentage, and Time is the period in years.",
    example: "Deposit ₹2,000 at 5% interest for 3 years: I = (2000 × 5 × 3) ÷ 100 = 30,000 ÷ 100 = ₹300 interest earned.",
    tags: ["finance", "interest", "savings", "money"],
  },
];

export default function LearningCenter() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Arithmetic", "Fractions", "Percentages", "Geometry", "Probability", "Real-World"];

  const filteredFormulas = FORMULAS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-radial from-slate-900 via-indigo-950 to-slate-950 text-slate-100 p-4 sm:p-8 font-outfit">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Royal Archives & Formula Compendium</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-fredoka">
              Mathematical Learning Center
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Searchable formula handbook with step-by-step explanations, key definitions,
              and real-world application examples across all realms.
            </p>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-bold transition-all"
            onClick={() => {
              playClickSound();
              navigate("/map");
            }}
          >
            ← Return to Map
          </button>
        </header>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search formulas, concepts (e.g. Area, Discount)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-400 pl-11 pr-4 py-2.5 rounded-2xl text-slate-100 text-sm outline-none transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20"
                    : "bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-white"
                }`}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFormulas.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur shadow-xl hover:border-amber-400/50 transition-all space-y-4"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300">
                  {item.category} • {item.realm}
                </span>
                <Calculator className="w-5 h-5 text-amber-400" />
              </div>

              <h2 className="text-xl font-bold text-slate-100 font-fredoka">{item.title}</h2>

              {/* Formula Badge */}
              <div className="p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl font-mono text-sm text-amber-300 font-bold overflow-x-auto">
                {item.formula}
              </div>

              {/* Explanation */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {item.explanation}
              </p>

              {/* Worked Example */}
              <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl text-xs text-slate-200">
                <strong className="text-emerald-400 block mb-1">Worked Real-World Example:</strong>
                {item.example}
              </div>
            </div>
          ))}

          {filteredFormulas.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="font-bold">No formulas found matching "{searchTerm}"</p>
              <button
                type="button"
                className="mt-3 text-xs text-amber-400 hover:underline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

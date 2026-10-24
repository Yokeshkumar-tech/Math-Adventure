// client/src/components/MathVisualizer.jsx
import React, { useState } from "react";
import FractionPizza from "./FractionPizza.jsx";

export default function MathVisualizer({ type = "auto", topic = "" }) {
  // Counting & Arithmetic States (Level 1-3)
  const [countA, setCountA] = useState(3);
  const [countB, setCountB] = useState(2);
  const [arithMode, setArithMode] = useState("add"); // 'add' or 'subtract'
  const [objectEmoji, setObjectEmoji] = useState("🍎");

  // Multiplication Array States (Level 4)
  const [multRows, setMultRows] = useState(4);
  const [multCols, setMultCols] = useState(6);

  // Division Sharing States (Level 5)
  const [divTotal, setDivTotal] = useState(12);
  const [divBaskets, setDivBaskets] = useState(3);

  // Algebra Balance Scale States (Level 10)
  const [algebraUnknown, setAlgebraUnknown] = useState(4);
  const [algebraAdded, setAlgebraAdded] = useState(3);

  // Shopping Money Register States (Level 12)
  const [budgetVal, setBudgetVal] = useState(500);
  const [cartItems, setCartItems] = useState([
    { name: "Fragrant Rice", price: 180, icon: "🌾", selected: true },
    { name: "Fresh Milk", price: 60, icon: "🥛", selected: true },
    { name: "Crisp Apples", price: 120, icon: "🍎", selected: true },
  ]);

  // Decimals & Number Line States (Level 7)
  const [decimalVal, setDecimalVal] = useState(0.5);

  // Ratios States (Level 9)
  const [ratioA, setRatioA] = useState(2);
  const [ratioB, setRatioB] = useState(3);

  // Geometry Area/Perimeter States (Level 11)
  const [gridLen, setGridLen] = useState(4);
  const [gridWid, setGridWid] = useState(3);
  const [angleDeg, setAngleDeg] = useState(60);

  // Determine active visualizer type
  const lowerTopic = (topic || "").toLowerCase();
  let activeType = type;
  if (activeType === "auto") {
    if (lowerTopic.includes("fraction")) activeType = "pizza";
    else if (lowerTopic.includes("add") || lowerTopic.includes("subtract") || lowerTopic.includes("count")) activeType = "counting";
    else if (lowerTopic.includes("multiply") || lowerTopic.includes("table")) activeType = "multiplication";
    else if (lowerTopic.includes("divide") || lowerTopic.includes("division")) activeType = "division";
    else if (lowerTopic.includes("algebra") || lowerTopic.includes("equation")) activeType = "algebra";
    else if (lowerTopic.includes("money") || lowerTopic.includes("shop") || lowerTopic.includes("budget") || lowerTopic.includes("finance")) activeType = "money";
    else if (lowerTopic.includes("ratio")) activeType = "ratios";
    else if (lowerTopic.includes("area") || lowerTopic.includes("perimeter")) activeType = "area-grid";
    else if (lowerTopic.includes("angle")) activeType = "angles";
    else if (lowerTopic.includes("decimal") || lowerTopic.includes("integer")) activeType = "number-line";
    else activeType = "counting";
  }

  // 1. COUNTING & ADDITION / SUBTRACTION (Level 1 - 3)
  if (activeType === "counting" || activeType === "addition" || activeType === "subtraction") {
    const isAdd = arithMode === "add";
    const resultCount = isAdd ? countA + countB : Math.max(0, countA - countB);

    return (
      <div className="bg-gradient-to-b from-amber-50/90 via-orange-50/60 to-yellow-50/50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-amber-950">
          <span className="flex items-center gap-1.5 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
            🧺 <span>Visual Object Counter</span>
          </span>
          <div className="flex items-center gap-1">
            {["🍎", "⭐", "🪙", "💎"].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setObjectEmoji(em)}
                className={`w-7 h-7 rounded-lg text-sm transition ${
                  objectEmoji === em ? "bg-amber-300 scale-110 shadow-xs" : "bg-white/80 hover:bg-amber-100"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setArithMode("add")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              isAdd ? "bg-emerald-500 text-white shadow-xs" : "bg-white text-slate-700 border"
            }`}
          >
            ➕ Putting Together (Addition)
          </button>
          <button
            type="button"
            onClick={() => setArithMode("subtract")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              !isAdd ? "bg-rose-500 text-white shadow-xs" : "bg-white text-slate-700 border"
            }`}
          >
            ➖ Taking Away (Subtraction)
          </button>
        </div>

        {/* Visual Groups Display */}
        <div className="bg-white/90 rounded-2xl p-4 shadow-inner border border-amber-200 my-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Group A */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center min-w-[110px]">
            <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
              Group 1: {countA}
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
              {Array.from({ length: countA }, (_, i) => (
                <span key={i} className="text-2xl animate-bounce-subtle" style={{ animationDelay: `${i * 100}ms` }}>
                  {objectEmoji}
                </span>
              ))}
            </div>
          </div>

          {/* Operator Symbol */}
          <span className="text-2xl font-black text-amber-700">{isAdd ? "➕" : "➖"}</span>

          {/* Group B */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center min-w-[110px]">
            <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
              Group 2: {countB}
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
              {Array.from({ length: countB }, (_, i) => (
                <span key={i} className="text-2xl animate-bounce-subtle" style={{ animationDelay: `${i * 100}ms` }}>
                  {objectEmoji}
                </span>
              ))}
            </div>
          </div>

          <span className="text-2xl font-black text-amber-700">🟰</span>

          {/* Result Basket */}
          <div className="p-3 bg-emerald-50 rounded-xl border-2 border-emerald-400 text-center min-w-[120px]">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
              Total: {resultCount}
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[160px]">
              {Array.from({ length: resultCount }, (_, i) => (
                <span key={i} className="text-xl">
                  {objectEmoji}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Clear Math Equation */}
        <p className="text-base font-bold text-slate-800 mt-2 font-fredoka">
          {countA} {isAdd ? "+" : "−"} {countB} = <span className="text-emerald-700 text-xl">{resultCount}</span> {objectEmoji}
        </p>

        {/* Interactive Controls */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-around gap-3 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span>Group 1:</span>
            <button type="button" onClick={() => setCountA(Math.max(1, countA - 1))} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">-</button>
            <span className="w-5 text-center">{countA}</span>
            <button type="button" onClick={() => setCountA(Math.min(9, countA + 1))} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">+</button>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Group 2:</span>
            <button type="button" onClick={() => setCountB(Math.max(0, countB - 1))} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">-</button>
            <span className="w-5 text-center">{countB}</span>
            <button type="button" onClick={() => setCountB(Math.min(9, countB + 1))} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">+</button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MULTIPLICATION ARRAYS & EQUAL GROUPS (Level 4)
  if (activeType === "multiplication") {
    const product = multRows * multCols;

    return (
      <div className="bg-gradient-to-b from-indigo-50/90 via-purple-50/60 to-pink-50/50 border-2 border-purple-300 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-purple-950">
          <span className="flex items-center gap-1.5 bg-purple-200/80 px-3 py-1 rounded-full border border-purple-300">
            ✨ <span>Multiplication Array &amp; Equal Groups</span>
          </span>
          <span className="font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
            {multRows} rows × {multCols} columns
          </span>
        </div>

        {/* Array Grid */}
        <div className="p-4 bg-white/90 rounded-2xl shadow-inner border border-purple-200 my-2 flex justify-center overflow-x-auto">
          <div className="flex flex-col gap-1.5 p-2 bg-purple-50/60 rounded-xl border border-purple-200">
            {Array.from({ length: multRows }, (_, rIdx) => (
              <div key={rIdx} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-purple-600 w-12 text-right">Row {rIdx + 1}:</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: multCols }, (_, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-2xs flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition"
                    >
                      ★
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repeated Addition Explanation */}
        <div className="bg-purple-100/60 rounded-xl p-2.5 text-xs text-purple-900 mt-2 font-medium">
          Repeated Addition:{" "}
          <strong className="text-purple-700">
            {Array(multRows).fill(multCols).join(" + ")} = {product}
          </strong>
        </div>

        <p className="text-base font-bold text-slate-800 mt-2 font-fredoka">
          {multRows} groups of {multCols} = <span className="text-purple-700 text-xl">{product}</span> items
        </p>

        {/* Interactive Controls */}
        <div className="mt-4 pt-3 border-t border-purple-200/80 grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
          <div>
            <span>Rows (Groups): {multRows}</span>
            <input
              type="range"
              min="1"
              max="6"
              value={multRows}
              onChange={(e) => setMultRows(Number(e.target.value))}
              className="accent-purple-600 cursor-pointer w-full mt-1"
            />
          </div>
          <div>
            <span>Items per Row: {multCols}</span>
            <input
              type="range"
              min="1"
              max="8"
              value={multCols}
              onChange={(e) => setMultCols(Number(e.target.value))}
              className="accent-indigo-600 cursor-pointer w-full mt-1"
            />
          </div>
        </div>
      </div>
    );
  }

  // 3. DIVISION EQUAL SHARING (Level 5)
  if (activeType === "division") {
    const quotient = Math.floor(divTotal / divBaskets);
    const remainder = divTotal % divBaskets;

    return (
      <div className="bg-gradient-to-b from-emerald-50/90 via-teal-50/60 to-cyan-50/50 border-2 border-teal-300 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-teal-950">
          <span className="flex items-center gap-1.5 bg-teal-200/80 px-3 py-1 rounded-full border border-teal-300">
            📦 <span>Equal Sharing into Treasure Chests</span>
          </span>
          <span className="font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
            {divTotal} ÷ {divBaskets}
          </span>
        </div>

        {/* Treasure Chests Grid */}
        <div className="p-4 bg-white/90 rounded-2xl shadow-inner border border-teal-200 my-2 flex flex-wrap justify-center gap-3">
          {Array.from({ length: divBaskets }, (_, bIdx) => (
            <div key={bIdx} className="p-3 bg-teal-50/70 rounded-xl border border-teal-300 flex flex-col items-center min-w-[90px]">
              <span className="text-2xl mb-1">🎁 Chest #{bIdx + 1}</span>
              <div className="flex flex-wrap gap-1 justify-center max-w-[80px]">
                {Array.from({ length: quotient }, (_, gIdx) => (
                  <span key={gIdx} className="text-lg">🪙</span>
                ))}
              </div>
              <span className="text-[11px] font-bold text-teal-800 mt-1">
                {quotient} coins
              </span>
            </div>
          ))}
        </div>

        {remainder > 0 && (
          <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-2 text-xs text-amber-900 font-bold inline-block mx-auto mb-2">
            Remaining coins left over (Remainder) = {remainder} 🪙
          </div>
        )}

        <p className="text-base font-bold text-slate-800 mt-2 font-fredoka">
          {divTotal} coins shared equally into {divBaskets} chests ={" "}
          <span className="text-teal-700 text-xl">{quotient} each</span>
          {remainder > 0 ? ` (R: ${remainder})` : ""}
        </p>

        {/* Controls */}
        <div className="mt-4 pt-3 border-t border-teal-200/80 grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
          <div>
            <span>Total Coins: {divTotal}</span>
            <input
              type="range"
              min="4"
              max="24"
              value={divTotal}
              onChange={(e) => setDivTotal(Number(e.target.value))}
              className="accent-teal-600 cursor-pointer w-full mt-1"
            />
          </div>
          <div>
            <span>Chests to Share: {divBaskets}</span>
            <input
              type="range"
              min="2"
              max="6"
              value={divBaskets}
              onChange={(e) => setDivBaskets(Number(e.target.value))}
              className="accent-cyan-600 cursor-pointer w-full mt-1"
            />
          </div>
        </div>
      </div>
    );
  }

  // 4. ALGEBRA BALANCE SCALE (Level 10)
  if (activeType === "algebra") {
    const leftWeight = algebraUnknown + algebraAdded;
    const rightWeight = 10; // target balance
    const isBalanced = leftWeight === rightWeight;

    return (
      <div className="bg-gradient-to-b from-blue-50/90 via-sky-50/60 to-indigo-50/50 border-2 border-sky-300 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-sky-950">
          <span className="flex items-center gap-1.5 bg-sky-200/80 px-3 py-1 rounded-full border border-sky-300">
            ⚖️ <span>Algebra Balance Scale</span>
          </span>
          <span className={`font-mono px-2 py-0.5 rounded border ${isBalanced ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" : "bg-white text-slate-700"}`}>
            {isBalanced ? "⚖️ Perfectly Balanced!" : "Tilted Scale"}
          </span>
        </div>

        {/* Scale Visualization */}
        <div className="p-4 bg-white/90 rounded-2xl shadow-inner border border-sky-200 my-2">
          <svg width="100%" height="120" viewBox="0 0 320 120" className="overflow-visible">
            {/* Center Fulcrum */}
            <polygon points="160,85 145,115 175,115" fill="#475569" />
            <circle cx="160" cy="85" r="4" fill="#0EA5E9" />

            {/* Beam */}
            {(() => {
              const tilt = isBalanced ? 0 : leftWeight < rightWeight ? -12 : 12;
              return (
                <g transform={`rotate(${tilt}, 160, 85)`} className="transition-all duration-300">
                  <line x1="40" y1="85" x2="280" y2="85" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
                  
                  {/* Left Pan */}
                  <line x1="60" y1="85" x2="60" y2="105" stroke="#94A3B8" strokeWidth="2" />
                  <ellipse cx="60" cy="105" rx="35" ry="8" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                  
                  {/* Right Pan */}
                  <line x1="260" y1="85" x2="260" y2="105" stroke="#94A3B8" strokeWidth="2" />
                  <ellipse cx="260" cy="105" rx="35" ry="8" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
                </g>
              );
            })()}
          </svg>

          {/* Pan Contents Labels */}
          <div className="flex justify-between px-6 text-xs font-bold text-slate-700 mt-1">
            <div className="text-center">
              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-300">
                Left: [x] + {algebraAdded}
              </span>
            </div>
            <div className="text-center">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                Right: {rightWeight}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-800 mt-2">
          Equation: <strong className="font-mono text-base text-indigo-700">x + {algebraAdded} = {rightWeight}</strong>
        </p>
        <p className="text-xs text-slate-600 mt-0.5">
          {isBalanced
            ? `Great job! When x = ${algebraUnknown}, both sides equal ${rightWeight}.`
            : `Adjust the unknown mystery weight x until both sides balance.`}
        </p>

        {/* Unknown x slider */}
        <div className="mt-4 pt-3 border-t border-sky-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Mystery value x = {algebraUnknown}</span>
          <input
            type="range"
            min="1"
            max="9"
            value={algebraUnknown}
            onChange={(e) => setAlgebraUnknown(Number(e.target.value))}
            className="accent-sky-600 cursor-pointer w-48"
          />
        </div>
      </div>
    );
  }

  // 5. REAL-WORLD SHOPPING & BUDGET CASH REGISTER (Level 12)
  if (activeType === "money") {
    const totalSpent = cartItems
      .filter((i) => i.selected)
      .reduce((sum, item) => sum + item.price, 0);
    const changeRemaining = budgetVal - totalSpent;

    return (
      <div className="bg-gradient-to-b from-rose-50/90 via-pink-50/60 to-amber-50/50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-rose-950">
          <span className="flex items-center gap-1.5 bg-rose-200/80 px-3 py-1 rounded-full border border-rose-300">
            🛒 <span>Supermarket Budget &amp; Cash Register</span>
          </span>
          <span className="font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
            Starting Wallet: ₹{budgetVal}
          </span>
        </div>

        {/* Grocery Items */}
        <div className="grid grid-cols-3 gap-2 my-2">
          {cartItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const next = [...cartItems];
                next[idx].selected = !next[idx].selected;
                setCartItems(next);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                item.selected
                  ? "bg-white border-rose-400 text-rose-900 shadow-sm"
                  : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-60"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
              <span className="text-emerald-700 font-extrabold">₹{item.price}</span>
            </button>
          ))}
        </div>

        {/* Bill Breakdown */}
        <div className="bg-white/95 rounded-2xl p-3.5 shadow-sm border border-rose-200 text-xs space-y-1.5 text-left font-mono">
          <div className="flex justify-between text-slate-700">
            <span>Total Bill:</span>
            <strong>₹{totalSpent}</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Wallet Paid:</span>
            <strong>₹{budgetVal}</strong>
          </div>
          <div className="flex justify-between text-emerald-700 font-bold border-t pt-1 text-sm">
            <span>Change Returned:</span>
            <span>₹{changeRemaining}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2 font-medium">
          Calculation: ₹{budgetVal} − ₹{totalSpent} ={" "}
          <strong className="text-emerald-700">₹{changeRemaining} remaining in wallet!</strong>
        </p>
      </div>
    );
  }

  // 6. PIZZA FRACTIONS (Level 6)
  if (activeType === "pizza") {
    return <FractionPizza initialParts={4} initialShaded={1} />;
  }

  // 7. NUMBER LINE (Level 7)
  if (activeType === "number-line") {
    const isInteger = lowerTopic.includes("integer");
    const min = isInteger ? -5 : 0;
    const max = isInteger ? 5 : 2;
    const step = isInteger ? 1 : 0.1;

    return (
      <div className="bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border-2 border-indigo-200 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-indigo-900">
          <span className="flex items-center gap-1.5 bg-indigo-100 px-2.5 py-1 rounded-full">
            📏 <span>{isInteger ? "Integer Number Line" : "Decimal Number Line"}</span>
          </span>
          <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
            Value: {decimalVal}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-inner border border-indigo-100 my-2">
          <svg width="100%" height="80" viewBox="0 0 360 80" className="overflow-visible">
            <line x1="20" y1="40" x2="340" y2="40" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
            <polygon points="340,36 348,40 340,44" fill="#4F46E5" />
            <polygon points="20,36 12,40 20,44" fill="#4F46E5" />

            {Array.from({ length: max - min + 1 }, (_, i) => {
              const val = min + i;
              const x = 30 + ((val - min) / (max - min)) * 300;
              return (
                <g key={val}>
                  <line x1={x} y1="34" x2={x} y2="46" stroke="#6366F1" strokeWidth="2.5" />
                  <text x={x} y="64" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
                    {val}
                  </text>
                </g>
              );
            })}

            {(() => {
              const markerX = 30 + ((decimalVal - min) / (max - min)) * 300;
              return (
                <g className="transition-all duration-200">
                  <circle cx={markerX} cy="40" r="9" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
                  <text x={markerX} y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#DC2626">
                    {decimalVal}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="mt-4 pt-3 border-t border-indigo-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Adjust Position:</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={decimalVal}
            onChange={(e) => setDecimalVal(Number(e.target.value))}
            className="accent-indigo-600 cursor-pointer w-48"
          />
        </div>
      </div>
    );
  }

  // 8. RATIOS (Level 9)
  if (activeType === "ratios") {
    return (
      <div className="bg-gradient-to-b from-purple-50/70 to-pink-50/40 border-2 border-purple-200 rounded-3xl p-5 shadow-sm text-center">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-purple-900">
          <span className="flex items-center gap-1.5 bg-purple-100 px-2.5 py-1 rounded-full">
            ⚪ <span>Ratio Counters Visualizer</span>
          </span>
          <span className="font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
            Ratio {ratioA}:{ratioB}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-inner border border-purple-100 my-2 space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-700 w-16 text-right">Blue ({ratioA}):</span>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: ratioA }, (_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-500 border border-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-rose-700 w-16 text-right">Red ({ratioB}):</span>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: ratioB }, (_, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-rose-500 border border-rose-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-700 mt-2">
          For every <span className="text-indigo-600 font-bold">{ratioA} blue</span> counters, there are{" "}
          <span className="text-rose-600 font-bold">{ratioB} red</span> counters.
        </p>

        <div className="mt-4 pt-3 border-t border-purple-200/80 flex items-center justify-around text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span>Blue:</span>
            <button onClick={() => setRatioA(Math.max(1, ratioA - 1))} className="px-2 py-0.5 bg-slate-100 rounded border">-</button>
            <span>{ratioA}</span>
            <button onClick={() => setRatioA(Math.min(8, ratioA + 1))} className="px-2 py-0.5 bg-slate-100 rounded border">+</button>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Red:</span>
            <button onClick={() => setRatioB(Math.max(1, ratioB - 1))} className="px-2 py-0.5 bg-slate-100 rounded border">-</button>
            <span>{ratioB}</span>
            <button onClick={() => setRatioB(Math.min(8, ratioB + 1))} className="px-2 py-0.5 bg-slate-100 rounded border">+</button>
          </div>
        </div>
      </div>
    );
  }

  // 9. AREA & PERIMETER GRID (Level 11)
  const area = gridLen * gridWid;
  const perimeter = 2 * (gridLen + gridWid);

  return (
    <div className="bg-gradient-to-b from-emerald-50/70 to-teal-50/40 border-2 border-emerald-200 rounded-3xl p-5 shadow-sm text-center">
      <div className="flex items-center justify-between mb-3 text-xs font-bold text-emerald-900">
        <span className="flex items-center gap-1.5 bg-emerald-100 px-2.5 py-1 rounded-full">
          ▦ <span>Area &amp; Perimeter Unit Grid</span>
        </span>
        <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
          {gridLen} × {gridWid} units
        </span>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-inner border border-emerald-100 my-2 flex justify-center">
        <div
          className="grid gap-1 p-2 bg-emerald-50 rounded-xl border-2 border-emerald-500 shadow-sm"
          style={{ gridTemplateColumns: `repeat(${gridLen}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: area }, (_, i) => (
            <div
              key={i}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-emerald-400 border border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-800 mt-2">
        Area = <span className="text-emerald-700 font-bold">{area} sq units</span> | Perimeter ={" "}
        <span className="text-teal-700 font-bold">{perimeter} units</span>
      </p>

      <div className="mt-4 pt-3 border-t border-emerald-200/80 grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
        <div>
          <span>Length: {gridLen}</span>
          <input
            type="range"
            min="2"
            max="6"
            value={gridLen}
            onChange={(e) => setGridLen(Number(e.target.value))}
            className="accent-emerald-600 cursor-pointer w-full mt-1"
          />
        </div>
        <div>
          <span>Width: {gridWid}</span>
          <input
            type="range"
            min="2"
            max="5"
            value={gridWid}
            onChange={(e) => setGridWid(Number(e.target.value))}
            className="accent-teal-600 cursor-pointer w-full mt-1"
          />
        </div>
      </div>
    </div>
  );
}

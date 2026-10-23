// client/src/components/MathVisualizer.jsx
import React, { useState } from "react";
import FractionPizza from "./FractionPizza.jsx";

export default function MathVisualizer({ type = "pizza", topic = "" }) {
  // States for different visualizers
  const [decimalVal, setDecimalVal] = useState(0.5);
  const [ratioA, setRatioA] = useState(2);
  const [ratioB, setRatioB] = useState(3);
  const [gridLen, setGridLen] = useState(4);
  const [gridWid, setGridWid] = useState(3);
  const [angleDeg, setAngleDeg] = useState(60);

  if (type === "pizza" || topic.toLowerCase().includes("fraction")) {
    return <FractionPizza initialParts={4} initialShaded={1} />;
  }

  if (type === "number-line" || topic.toLowerCase().includes("decimal") || topic.toLowerCase().includes("integer")) {
    const isInteger = topic.toLowerCase().includes("integer");
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

        {/* SVG Number Line */}
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-indigo-100 my-2">
          <svg width="100%" height="100" viewBox="0 0 360 100" className="overflow-visible">
            {/* Axis */}
            <line x1="20" y1="50" x2="340" y2="50" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
            <polygon points="340,46 348,50 340,54" fill="#4F46E5" />
            <polygon points="20,46 12,50 20,54" fill="#4F46E5" />

            {/* Ticks and Labels */}
            {Array.from({ length: max - min + 1 }, (_, i) => {
              const val = min + i;
              const x = 30 + ((val - min) / (max - min)) * 300;
              return (
                <g key={val}>
                  <line x1={x} y1="42" x2={x} y2="58" stroke="#6366F1" strokeWidth="2.5" />
                  <text x={x} y="75" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Active Position Indicator */}
            {(() => {
              const markerX = 30 + ((decimalVal - min) / (max - min)) * 300;
              return (
                <g className="transition-all duration-200">
                  <circle cx={markerX} cy="50" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
                  <text x={markerX} y="32" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#DC2626">
                    {decimalVal}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <figcaption className="text-sm font-semibold text-slate-700 mt-2">
          {isInteger
            ? `${decimalVal < 0 ? `${Math.abs(decimalVal)} units left of 0 (negative)` : decimalVal === 0 ? "Zero (neutral)" : `${decimalVal} units right of 0 (positive)`}`
            : `Point is at ${decimalVal} on the continuous number scale.`}
        </figcaption>

        {/* Interactive Slider */}
        <div className="mt-4 pt-3 border-t border-indigo-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Move marker:</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={decimalVal}
            onChange={(e) => setDecimalVal(Number(e.target.value))}
            className="accent-indigo-600 cursor-pointer w-48"
            aria-label="Adjust number line position"
          />
        </div>
      </div>
    );
  }

  if (type === "ratios" || topic.toLowerCase().includes("ratio")) {
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

        {/* Visual Counters */}
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-purple-100 my-2 space-y-3">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-indigo-700 w-16 text-right">Blue ({ratioA}):</span>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: ratioA }, (_, i) => (
                <div key={`a-${i}`} className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-indigo-600 shadow-xs flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-rose-700 w-16 text-right">Red ({ratioB}):</span>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: ratioB }, (_, i) => (
                <div key={`b-${i}`} className="w-7 h-7 rounded-full bg-rose-500 border-2 border-rose-600 shadow-xs flex items-center justify-center text-white text-xs font-bold">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <figcaption className="text-sm font-semibold text-slate-700 mt-2">
          For every <span className="text-indigo-600 font-bold">{ratioA} blue</span> counters, there are{" "}
          <span className="text-rose-600 font-bold">{ratioB} red</span> counters. Total = {ratioA + ratioB}.
        </figcaption>

        <div className="mt-4 pt-3 border-t border-purple-200/80 flex items-center justify-around text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span>Blue:</span>
            <button onClick={() => setRatioA(Math.max(1, ratioA - 1))} className="px-2 py-0.5 bg-slate-100 rounded border">-</button>
            <span>{ratioA}</span>
            <button onClick={() => setRatioA(Math.min(8, ratioA + 1))} className="px-2 py-0.5 bg-slate-100 rounded border">+</button>
          </div>
          <div className="flex items-center gap-2">
            <span>Red:</span>
            <button onClick={() => setRatioB(Math.max(1, ratioB - 1))} className="px-2 py-0.5 bg-slate-100 rounded border">-</button>
            <span>{ratioB}</span>
            <button onClick={() => setRatioB(Math.min(8, ratioB + 1))} className="px-2 py-0.5 bg-slate-100 rounded border">+</button>
          </div>
        </div>
      </div>
    );
  }

  if (type === "area-grid" || topic.toLowerCase().includes("area") || topic.toLowerCase().includes("volume")) {
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

        {/* Grid Canvas */}
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-emerald-100 my-2 flex justify-center">
          <div
            className="grid gap-1 p-2 bg-emerald-50 rounded-xl border-2 border-emerald-500 shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${gridLen}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: area }, (_, i) => (
              <div
                key={i}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-emerald-400 border border-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs hover:bg-emerald-500 cursor-pointer"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <figcaption className="text-sm font-semibold text-slate-800 mt-2">
          Area = <span className="text-emerald-700 font-bold">{area} sq units</span> | Perimeter ={" "}
          <span className="text-teal-700 font-bold">{perimeter} units</span>
        </figcaption>

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

  // Geometry Angles
  return (
    <div className="bg-gradient-to-b from-sky-50/70 to-indigo-50/40 border-2 border-sky-200 rounded-3xl p-5 shadow-sm text-center">
      <div className="flex items-center justify-between mb-3 text-xs font-bold text-sky-900">
        <span className="flex items-center gap-1.5 bg-sky-100 px-2.5 py-1 rounded-full">
          📐 <span>Angle Visualizer</span>
        </span>
        <span className="font-mono text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
          {angleDeg}° ({angleDeg < 90 ? "Acute" : angleDeg === 90 ? "Right Angle" : angleDeg < 180 ? "Obtuse" : "Straight"})
        </span>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-inner border border-sky-100 my-2 flex justify-center">
        <svg width="220" height="150" viewBox="0 0 220 150">
          {/* Base ray */}
          <line x1="40" y1="120" x2="190" y2="120" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          {/* Angle ray */}
          {(() => {
            const rad = (angleDeg * Math.PI) / 180;
            const x2 = 40 + 130 * Math.cos(-rad);
            const y2 = 120 + 130 * Math.sin(-rad);
            return (
              <line x1="40" y1="120" x2={x2} y2={y2} stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
            );
          })()}
          {/* Vertex dot */}
          <circle cx="40" cy="120" r="6" fill="#0369A1" />
          {/* Angle arc */}
          {angleDeg === 90 ? (
            <rect x="40" y="100" width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="3" />
          ) : (
            <path
              d={`M70,120 A30,30 0 0,0 ${40 + 30 * Math.cos((-angleDeg * Math.PI) / 180)},${
                120 + 30 * Math.sin((-angleDeg * Math.PI) / 180)
              }`}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
            />
          )}
          <text x="80" y="105" fontSize="13" fontWeight="bold" fill="#D97706">
            {angleDeg}°
          </text>
        </svg>
      </div>

      <figcaption className="text-sm font-semibold text-slate-800 mt-2">
        {angleDeg < 90
          ? "Acute angle: sharp and less than 90°"
          : angleDeg === 90
          ? "Right angle: exactly 90° (square corner)"
          : angleDeg < 180
          ? "Obtuse angle: wide open between 90° and 180°"
          : "Straight angle: 180° flat line"}
      </figcaption>

      <div className="mt-4 pt-3 border-t border-sky-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Rotate Ray:</span>
        <input
          type="range"
          min="15"
          max="180"
          step="5"
          value={angleDeg}
          onChange={(e) => setAngleDeg(Number(e.target.value))}
          className="accent-sky-600 cursor-pointer w-48"
        />
      </div>
    </div>
  );
}

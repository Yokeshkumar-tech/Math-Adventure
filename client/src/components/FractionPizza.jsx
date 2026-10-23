// client/src/components/FractionPizza.jsx - Programmatic, mathematically accurate visualizer
import React, { useState } from "react";
import { ZoomIn, Download, RefreshCw, Eye, Sparkles } from "lucide-react";

export default function FractionPizza({ initialParts = 4, initialShaded = 1, size = 240, interactive = true }) {
  const [parts, setParts] = useState(initialParts);
  const [shaded, setShaded] = useState(initialShaded);
  const [isZoomed, setIsZoomed] = useState(false);

  // Math calculation for equivalent simplest fraction
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(shaded, parts);
  const simpN = shaded / g;
  const simpD = parts / g;
  const isEquivalent = simpN !== shaded || simpD !== parts;

  const r = size / 2 - 12;
  const c = size / 2;

  // Render pizza slices
  const slices = Array.from({ length: parts }, (_, i) => {
    const a0 = (i / parts) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const d = `M${c},${c} L${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${
      c + r * Math.cos(a1)
    },${c + r * Math.sin(a1)} Z`;

    const isShaded = i < shaded;

    // Center coordinates of the slice for decorative toppings
    const midAngle = (a0 + a1) / 2;
    const topX = c + (r * 0.55) * Math.cos(midAngle);
    const topY = c + (r * 0.55) * Math.sin(midAngle);

    return (
      <g key={i}>
        <path
          d={d}
          fill={isShaded ? "#F59E0B" : "#FEF3C7"}
          stroke="#78350F"
          strokeWidth="3"
          strokeLinejoin="round"
          className="transition-colors duration-300 hover:brightness-105 cursor-pointer"
          onClick={() => {
            if (interactive) {
              setShaded(i + 1 === shaded ? i : i + 1);
            }
          }}
        />
        {/* Crust edge */}
        <path
          d={`M${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${
            c + r * Math.cos(a1)
          },${c + r * Math.sin(a1)}`}
          fill="none"
          stroke="#B45309"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Slice toppings */}
        {isShaded && (
          <circle cx={topX} cy={topY} r={r * 0.08} fill="#DC2626" opacity="0.85" />
        )}
      </g>
    );
  });

  const downloadSVG = () => {
    const svgElem = document.getElementById("fraction-pizza-svg");
    if (!svgElem) return;
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svgElem)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fraction-pizza-${shaded}-of-${parts}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 border-2 border-amber-200 rounded-3xl p-5 shadow-sm text-center relative flex flex-col items-center">
      
      {/* Visual Header Controls */}
      <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-amber-900">
        <span className="flex items-center gap-1.5 bg-amber-100/80 px-2.5 py-1 rounded-full">
          🍕 <span>Pizza Infographic</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
            title="Zoom visual"
            aria-label="Zoom visual"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={downloadSVG}
            className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
            title="Download visual"
            aria-label="Download visual"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Pizza Canvas */}
      <figure className="my-2 flex flex-col items-center">
        <div className="p-3 bg-white rounded-2xl shadow-inner border border-amber-100">
          <svg
            id="fraction-pizza-svg"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={`A pizza cut into ${parts} equal slices, with ${shaded} slices shaded (${shaded}/${parts})`}
          >
            <defs>
              <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
              </filter>
            </defs>
            <g filter="url(#shadow)">
              {slices}
            </g>
          </svg>
        </div>

        {/* Math Caption */}
        <figcaption className="mt-3 text-base sm:text-lg font-fredoka font-bold text-slate-800">
          <span className="text-amber-600">{shaded}</span> out of{" "}
          <span className="text-indigo-600">{parts}</span> equal slices ={" "}
          <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
            {shaded}/{parts}
          </span>
          {isEquivalent && shaded > 0 && (
            <span className="ml-2 text-emerald-600 font-bold">
              = {simpN}/{simpD}
            </span>
          )}
        </figcaption>

        {isEquivalent && shaded > 0 && (
          <p className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Equivalent Fraction: {shaded}/{parts} simplifies to {simpN}/{simpD}!
          </p>
        )}
      </figure>

      {/* Interactive Controls */}
      {interactive && (
        <div className="w-full mt-4 pt-3 border-t border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Cut into: {parts} slices</span>
            <div className="flex gap-1">
              {[2, 3, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setParts(n);
                    if (shaded > n) setShaded(n);
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-bold ${
                    parts === n ? "bg-amber-600 text-white shadow-xs" : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Slices Eaten: {shaded}</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={parts}
                value={shaded}
                onChange={(e) => setShaded(Number(e.target.value))}
                className="accent-amber-600 cursor-pointer w-28"
                aria-label="Adjust shaded slices"
              />
              <span className="w-6 text-center font-bold text-amber-700">{shaded}</span>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-fredoka text-2xl font-bold text-slate-800 mb-2">
              Fraction Pizza Explorer
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {shaded} out of {parts} equal slices ({shaded}/{parts})
            </p>
            <div className="flex justify-center p-4">
              <FractionPizza
                initialParts={parts}
                initialShaded={shaded}
                size={300}
                interactive={false}
              />
            </div>
            <button
              onClick={() => setIsZoomed(false)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              Close Zoom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

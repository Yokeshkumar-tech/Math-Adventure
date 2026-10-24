// client/src/components/game/GeometryDiagram.jsx
import React from "react";

export default function GeometryDiagram({ diagramSvg, topic, questionText = "" }) {
  // If raw SVG string is provided
  if (diagramSvg && diagramSvg.startsWith("<svg")) {
    return (
      <div
        className="geometry-diagram-container"
        dangerouslySetInnerHTML={{ __html: diagramSvg }}
      />
    );
  }

  const text = (questionText || "").toLowerCase();

  // Helper to render customized mathematical diagrams based on problem context
  if (text.includes("square") && (text.includes("side 6") || text.includes("6 cm") || text.includes("perimeter"))) {
    return (
      <div className="geometry-diagram-card">
        <svg viewBox="0 0 240 180" className="w-full h-44 drop-shadow-md">
          {/* Square */}
          <rect
            x="60"
            y="30"
            width="120"
            height="120"
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth="3"
            rx="4"
          />
          {/* Dimension Labels */}
          <text x="120" y="22" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">
            6 cm
          </text>
          <text x="120" y="165" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">
            6 cm
          </text>
          <text x="45" y="95" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">
            6 cm
          </text>
          <text x="195" y="95" textAnchor="middle" fill="#93c5fd" fontSize="13" fontWeight="bold">
            6 cm
          </text>
          {/* Right angle marker in corner */}
          <path d="M 60 45 L 75 45 L 75 30" fill="none" stroke="#60a5fa" strokeWidth="2" />
        </svg>
        <span className="diagram-caption">📐 Geometric Figure: Regular Square (Side = 6 cm)</span>
      </div>
    );
  }

  if (text.includes("rectangle") || (text.includes("length") && text.includes("width"))) {
    return (
      <div className="geometry-diagram-card">
        <svg viewBox="0 0 260 160" className="w-full h-40 drop-shadow-md">
          <rect
            x="40"
            y="35"
            width="180"
            height="90"
            fill="rgba(16, 185, 129, 0.15)"
            stroke="#10b981"
            strokeWidth="3"
            rx="4"
          />
          <text x="130" y="25" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="bold">
            Length = 8 cm
          </text>
          <text x="235" y="85" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="bold">
            Width = 5 cm
          </text>
          <path d="M 40 50 L 55 50 L 55 35" fill="none" stroke="#34d399" strokeWidth="2" />
        </svg>
        <span className="diagram-caption">📐 Geometric Figure: Rectangle (8 cm × 5 cm)</span>
      </div>
    );
  }

  if (text.includes("triangle") || text.includes("base") || text.includes("height")) {
    return (
      <div className="geometry-diagram-card">
        <svg viewBox="0 0 240 170" className="w-full h-40 drop-shadow-md">
          <polygon
            points="120,25 40,135 200,135"
            fill="rgba(245, 158, 11, 0.15)"
            stroke="#f59e0b"
            strokeWidth="3"
          />
          {/* Height altitude line */}
          <line
            x1="120"
            y1="25"
            x2="120"
            y2="135"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <text x="120" y="152" textAnchor="middle" fill="#fde68a" fontSize="13" fontWeight="bold">
            Base
          </text>
          <text x="135" y="85" textAnchor="start" fill="#fde68a" fontSize="12" fontWeight="bold">
            Height (h)
          </text>
        </svg>
        <span className="diagram-caption">📐 Geometric Figure: Triangle (Base & Altitude)</span>
      </div>
    );
  }

  if (text.includes("circle") || text.includes("radius") || text.includes("diameter")) {
    return (
      <div className="geometry-diagram-card">
        <svg viewBox="0 0 200 160" className="w-full h-40 drop-shadow-md">
          <circle
            cx="100"
            cy="80"
            r="60"
            fill="rgba(168, 85, 247, 0.15)"
            stroke="#a855f7"
            strokeWidth="3"
          />
          {/* Radius line */}
          <line x1="100" y1="80" x2="160" y2="80" stroke="#c084fc" strokeWidth="2.5" />
          <circle cx="100" cy="80" r="4" fill="#c084fc" />
          <text x="130" y="73" textAnchor="middle" fill="#e9d5ff" fontSize="12" fontWeight="bold">
            Radius (r)
          </text>
        </svg>
        <span className="diagram-caption">📐 Geometric Figure: Circle & Radius</span>
      </div>
    );
  }

  if (text.includes("angle") || text.includes("degrees") || text.includes("90°")) {
    return (
      <div className="geometry-diagram-card">
        <svg viewBox="0 0 200 160" className="w-full h-40 drop-shadow-md">
          <line x1="40" y1="120" x2="160" y2="120" stroke="#38bdf8" strokeWidth="3" />
          <line x1="40" y1="120" x2="120" y2="40" stroke="#38bdf8" strokeWidth="3" />
          <path
            d="M 70 120 A 30 30 0 0 0 61 99"
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="2"
          />
          <text x="80" y="105" fill="#bae6fd" fontSize="13" fontWeight="bold">
            θ
          </text>
        </svg>
        <span className="diagram-caption">📐 Geometric Angle Representation</span>
      </div>
    );
  }

  return null;
}

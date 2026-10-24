// client/src/components/game/HealthBar.jsx
import React from "react";
import "./GameSprites.css";

export default function HealthBar({
  current = 100,
  max = 100,
  label = "Boss Challenge Meter",
  color = "#ef4444",
  showNumbers = true,
  animateHit = false,
}) {
  const percentage = Math.max(0, Math.min(100, Math.round((current / max) * 100)));

  return (
    <div className="game-health-bar-container">
      <div className="game-health-header">
        <span className="game-health-label">{label}</span>
        {showNumbers && (
          <span className="game-health-numbers">
            {current} / {max} ({percentage}%)
          </span>
        )}
      </div>

      <div className="game-health-track">
        <div
          className={`game-health-fill ${animateHit ? "health-flash-hit" : ""}`}
          style={{
            width: `${percentage}%`,
            background:
              percentage > 50
                ? "linear-gradient(90deg, #10b981, #22c55e)"
                : percentage > 25
                ? "linear-gradient(90deg, #f59e0b, #eab308)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
          }}
        />
        {/* Striped overlay */}
        <div className="game-health-glimmer" />
      </div>
    </div>
  );
}

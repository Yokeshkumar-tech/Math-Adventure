// client/src/components/game/BossSprite.jsx
import React from "react";
import "./GameSprites.css";

export const BOSS_DEFINITIONS = {
  "goblin-king": {
    name: "Sylva the Goblin King",
    title: "Guardian of the Number Forest",
    emoji: "👺",
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #15803d, #14532d)",
    aura: "rgba(34, 197, 94, 0.45)",
    dialogue: "You think your arithmetic can overcome my woodland trickery?! Think again!",
    attackName: "Log Barrage",
  },
  "pizza-golem": {
    name: "Lord Fractionstein",
    title: "Overlord of the Fraction Kingdom",
    emoji: "🍕",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #b45309, #78350f)",
    aura: "rgba(245, 158, 11, 0.5)",
    dialogue: "Only those who divide without remainder may pass through my pizza bakery!",
    attackName: "Cheesy Slices",
  },
  "prime-sphinx": {
    name: "The Prime Sphinx",
    title: "Sentinel of the Desert Dunes",
    emoji: "🦁",
    color: "#eab308",
    gradient: "linear-gradient(135deg, #ca8a04, #713f12)",
    aura: "rgba(234, 179, 8, 0.5)",
    dialogue: "Riddle me this, wanderer: which numbers have only two factors in the sands of time?",
    attackName: "Sandstorm of Multiples",
  },
  "kraken": {
    name: "The Geometry Kraken",
    title: "Leviathan of the Angular Deep",
    emoji: "🐙",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #0e7490, #164e63)",
    aura: "rgba(6, 182, 212, 0.55)",
    dialogue: "My tentacles span 360 degrees! You cannot calculate my perimeter!",
    attackName: "Whirlpool of Polygons",
  },
  "math-dragon": {
    name: "Ignis the Math Dragon",
    title: "Supreme Ruler of the Dragon Castle",
    emoji: "🐉",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #b91c1c, #450a0a)",
    aura: "rgba(239, 68, 68, 0.65)",
    dialogue: "Mortal mathematician! Face the ultimate crucible of numbers and fire!",
    attackName: "Infernal Equation",
  },
};

export default function BossSprite({
  bossKey = "goblin-king",
  animation = "idle", // 'idle' | 'hit' | 'attack' | 'defeat'
  size = "lg", // 'md' | 'lg' | 'xl'
  speechText = "",
  className = "",
}) {
  const boss = BOSS_DEFINITIONS[bossKey] || BOSS_DEFINITIONS["goblin-king"];

  const sizeClass = {
    md: "boss-sprite-md",
    lg: "boss-sprite-lg",
    xl: "boss-sprite-xl",
  }[size] || "boss-sprite-lg";

  return (
    <div className={`boss-sprite-wrapper ${className}`}>
      {/* Speech bubble if dialogue provided */}
      {speechText && (
        <div className="boss-speech-bubble">
          <span className="boss-speech-text">{speechText}</span>
          <div className="boss-speech-tail" />
        </div>
      )}

      <div
        className={`boss-sprite ${sizeClass} boss-anim-${animation}`}
        style={{
          boxShadow: `0 0 35px ${boss.aura}`,
          borderColor: boss.color,
        }}
      >
        <div className="boss-inner-body" style={{ background: boss.gradient }}>
          <span className="boss-emoji" role="img" aria-label={boss.name}>
            {boss.emoji}
          </span>
        </div>

        {/* Pulsing boss core glow */}
        <div
          className="boss-pulse-ring"
          style={{ borderColor: boss.color }}
        />

        {/* Ground shadow */}
        <div className="boss-ground-shadow" />
      </div>

      <div className="boss-name-tag">
        <span className="boss-name-title">{boss.title}</span>
        <strong className="boss-name-display">{boss.name}</strong>
      </div>
    </div>
  );
}

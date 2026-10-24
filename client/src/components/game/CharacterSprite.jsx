// client/src/components/game/CharacterSprite.jsx
import React from "react";
import "./GameSprites.css";

export const CHARACTER_CLASSES = {
  knight: {
    id: "knight",
    name: "Sir Valor (Knight)",
    role: "Tank & Guardian",
    baseEmoji: "🛡️",
    baseColor: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa, #2563eb)",
    avatar: "⚔️",
    quote: "Courage and calculations conquer any beast!",
  },
  archer: {
    id: "archer",
    name: "Sylvia (Ranger)",
    role: "Precision Striker",
    baseEmoji: "🏹",
    baseColor: "#10b981",
    gradient: "linear-gradient(135deg, #34d399, #059669)",
    avatar: "🎯",
    quote: "Every answer hits the bullseye!",
  },
  mage: {
    id: "mage",
    name: "Arcanist Zephyr (Mage)",
    role: "Spellcaster",
    baseEmoji: "🔮",
    baseColor: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    avatar: "✨",
    quote: "Math is the purest magic of the universe!",
  },
  explorer: {
    id: "explorer",
    name: "Captain Dash (Explorer)",
    role: "Trailblazer",
    baseEmoji: "🧭",
    baseColor: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24, #d97706)",
    avatar: "🗺️",
    quote: "No forest too deep, no problem too tough!",
  },
  golem: {
    id: "golem",
    name: "Titan Boulder (Golem)",
    role: "Heavy Defender",
    baseEmoji: "🗿",
    baseColor: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6, #db2777)",
    avatar: "💎",
    quote: "Solid as rock, sharp as logic!",
  },
};

export const COSTUME_AURAS = {
  default: { aura: "rgba(59, 130, 246, 0.4)", label: "Standard Adventurer Tunic" },
  "golden-armor": { aura: "rgba(234, 179, 8, 0.75)", border: "#facc15", badge: "👑" },
  "ruby-robe": { aura: "rgba(239, 68, 68, 0.75)", border: "#ef4444", badge: "🔥" },
  "shadow-cloak": { aura: "rgba(99, 102, 241, 0.8)", border: "#6366f1", badge: "🌙" },
  "cyber-suit": { aura: "rgba(6, 182, 212, 0.8)", border: "#06b6d4", badge: "⚡" },
  "dragon-tunic": { aura: "rgba(249, 115, 22, 0.8)", border: "#f97316", badge: "🐉" },
};

export const ACCESSORY_ICONS = {
  none: null,
  "crown-stars": "👑",
  "wizard-staff": "🪄",
  "wings-pegasus": "🪽",
  "diamond-shield": "💎",
  "enchanted-compass": "🧭",
};

export const PET_ICONS = {
  none: null,
  "pet-owl": { emoji: "🦉", name: "Pixel Owl" },
  "pet-fox": { emoji: "🦊", name: "Math Fox" },
  "pet-dragon": { emoji: "🐲", name: "Dragon Whelp" },
  "pet-cat": { emoji: "🐱", name: "Cosmic Cat" },
};

export default function CharacterSprite({
  characterId = "knight",
  costume = "default",
  accessory = "none",
  pet = "none",
  animation = "idle", // 'idle' | 'attack' | 'victory' | 'hurt'
  size = "md", // 'sm' | 'md' | 'lg' | 'xl'
  showName = false,
  nickname = "",
  level = 1,
  className = "",
}) {
  const charData = CHARACTER_CLASSES[characterId] || CHARACTER_CLASSES.knight;
  const costumeData = COSTUME_AURAS[costume] || COSTUME_AURAS.default;
  const accessoryIcon = ACCESSORY_ICONS[accessory];
  const petData = PET_ICONS[pet];

  const sizeClasses = {
    sm: "char-sprite-sm",
    md: "char-sprite-md",
    lg: "char-sprite-lg",
    xl: "char-sprite-xl",
  }[size] || "char-sprite-md";

  return (
    <div className={`character-sprite-container ${className}`}>
      {showName && (
        <div className="char-sprite-label">
          <span className="char-sprite-nickname">{nickname || charData.name.split(" ")[0]}</span>
          <span className="char-sprite-lvl">Lv.{level}</span>
        </div>
      )}

      <div
        className={`character-sprite ${sizeClasses} anim-${animation}`}
        style={{
          boxShadow: `0 0 24px ${costumeData.aura}`,
          borderColor: costumeData.border || "rgba(255, 255, 255, 0.4)",
        }}
      >
        {/* Floating accessory badge on top */}
        {accessoryIcon && (
          <div className="char-accessory-badge" title={`Accessory: ${accessory}`}>
            {accessoryIcon}
          </div>
        )}

        {/* Costume aura spark badge */}
        {costumeData.badge && (
          <div className="char-costume-badge" title={`Costume: ${costume}`}>
            {costumeData.badge}
          </div>
        )}

        {/* Character avatar orb */}
        <div
          className="char-sprite-body"
          style={{ background: charData.gradient }}
        >
          <span className="char-sprite-icon" role="img" aria-label={charData.name}>
            {charData.baseEmoji}
          </span>
        </div>

        {/* Shadow under feet */}
        <div className="char-sprite-shadow" />

        {/* Floating Companion Pet */}
        {petData && (
          <div className="char-companion-pet" title={`Companion Pet: ${petData.name}`}>
            <span className="char-pet-emoji">{petData.emoji}</span>
          </div>
        )}
      </div>
    </div>
  );
}

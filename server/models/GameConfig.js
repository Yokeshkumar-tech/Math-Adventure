// server/models/GameConfig.js
import mongoose from "mongoose";

const gameConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    xpPerCorrect: { type: Number, default: 10 },
    bonusCoinsOnComplete: { type: Number, default: 50 },
    dailyGoalQuestions: { type: Number, default: 5 },
    streakThresholds: {
      tier1: { type: Number, default: 3 }, // 1.25x
      tier2: { type: Number, default: 5 }, // 1.5x
      tier3: { type: Number, default: 8 }, // 2.0x
    },
    powerUpPricing: {
      fiftyFifty: { type: Number, default: 30 },
      streakShield: { type: Number, default: 50 },
      hintCrystal: { type: Number, default: 20 },
      timeBoost: { type: Number, default: 20 },
    },
    realmUnlockRequirements: {
      "number-forest": { type: Number, default: 0 },
      "fraction-kingdom": { type: Number, default: 8 },
      "desert-of-numbers": { type: Number, default: 18 },
      "ocean-of-geometry": { type: Number, default: 30 },
      "dragons-castle": { type: Number, default: 42 },
    },
    maintenanceMode: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.GameConfig || mongoose.model("GameConfig", gameConfigSchema);

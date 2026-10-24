import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
  {
    worldId: { type: mongoose.Schema.Types.ObjectId, ref: "World", required: true },
    worldSlug: { type: String, required: true },
    missionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    story: { type: String, required: true },
    objective: { type: String, required: true },
    characterDialogue: { type: String, default: "" },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard", "boss"], default: "easy" },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    rewardRules: {
      coinsPerCorrect: { type: Number, default: 20 },
      xpPerCorrect: { type: Number, default: 10 },
      bonusCoinsOnComplete: { type: Number, default: 50 },
    },
    requiredStars: { type: Number, default: 0 },
    isBoss: { type: Boolean, default: false },
    bossData: {
      name: { type: String, default: "" },
      title: { type: String, default: "" },
      maxHp: { type: Number, default: 100 },
      sprite: { type: String, default: "goblin-king" },
      victoryBadge: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

missionSchema.index({ worldSlug: 1, missionNumber: 1 });

export default mongoose.models.Mission || mongoose.model("Mission", missionSchema);

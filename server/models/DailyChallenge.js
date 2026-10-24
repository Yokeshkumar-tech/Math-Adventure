// server/models/DailyChallenge.js
import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    dateString: { type: String, required: true }, // 'YYYY-MM-DD'
    title: { type: String, required: true },
    description: { type: String, default: "Solve 3 daily math challenges to earn bonus coins, stars, and keep your streak blazing!" },
    topic: { type: String, required: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    rewards: {
      coins: { type: Number, default: 50 },
      xp: { type: Number, default: 30 },
      stars: { type: Number, default: 1 },
    },
    completions: [
      {
        playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        completedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 3 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

dailyChallengeSchema.index({ dateString: 1 });

export default mongoose.models.DailyChallenge || mongoose.model("DailyChallenge", dailyChallengeSchema);

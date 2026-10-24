import mongoose from "mongoose";

const playerProgressSchema = new mongoose.Schema(
  {
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    missionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mission", required: true },
    completed: { type: Boolean, default: false },
    bestScore: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 5 },
    starsEarned: { type: Number, default: 0, min: 0, max: 3 },
    attempts: { type: Number, default: 1 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

playerProgressSchema.index({ playerId: 1, missionId: 1 }, { unique: true });

export default mongoose.models.PlayerProgress ||
  mongoose.model("PlayerProgress", playerProgressSchema);

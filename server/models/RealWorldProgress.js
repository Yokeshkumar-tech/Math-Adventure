// server/models/RealWorldProgress.js
import mongoose from "mongoose";

const realWorldProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    locationId: { type: String, required: true }, // e.g. "supermarket", "pizza", "treasure"
    missionIndex: { type: Number, required: true },
    completed: { type: Boolean, default: true },
    starsEarned: { type: Number, default: 3, min: 0, max: 3 },
    coinsEarned: { type: Number, default: 40 },
    xpEarned: { type: Number, default: 25 },
    attemptsCount: { type: Number, default: 1 },
    lastPlayedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

realWorldProgressSchema.index({ userId: 1, locationId: 1, missionIndex: 1 }, { unique: true });

export default mongoose.models.RealWorldProgress ||
  mongoose.model("RealWorldProgress", realWorldProgressSchema);

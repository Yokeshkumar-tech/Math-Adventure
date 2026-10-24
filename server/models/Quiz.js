// server/models/Quiz.js
import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    realm: { type: String, default: "Number Forest" },
    mission: { type: String, default: "" },
    topic: { type: String, required: true },
    grade: { type: Number, enum: [5, 6], default: 5 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "adaptive", "boss", "mixed"],
      default: "medium",
    },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    durationMinutes: { type: Number, default: 15 },
    passThresholdPercent: { type: Number, default: 60 },
    maxAttempts: { type: Number, default: 3 },
    randomizeOrder: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: false },
    hintsAllowed: { type: Boolean, default: true },
    rewardRules: {
      xpOnPass: { type: Number, default: 50 },
      coinsOnPass: { type: Number, default: 25 },
      starsOnMastery: { type: Number, default: 3 },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

quizSchema.index({ topic: 1, grade: 1, status: 1 });

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

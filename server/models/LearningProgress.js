// server/models/LearningProgress.js
import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, required: true },
    questionsAttempted: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    topicsPracticed: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

learningProgressSchema.index({ userId: 1, topic: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model("LearningProgress", learningProgressSchema);

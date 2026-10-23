import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    grade: { type: Number, required: true, default: 5 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    accuracy: { type: Number, required: true }, // percentage 0-100
    pointsEarned: { type: Number, required: true, default: 0 },
    difficultyReached: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    difficultyProgression: [{ type: String }],
    missedQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, topic: 1, completedAt: -1 });

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);

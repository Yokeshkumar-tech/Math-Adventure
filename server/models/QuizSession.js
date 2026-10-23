import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    grade: { type: Number, required: true },
    total: { type: Number, default: 10 },
    level: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    streakCorrect: { type: Number, default: 0 },
    streakWrong: { type: Number, default: 0 },
    changed: { type: String, default: null },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        selected: { type: String, required: true },
        correct: { type: Boolean, required: true },
        difficulty: { type: String, required: true },
        points: { type: Number, default: 0 },
      },
    ],
    usedQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    finished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quizSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.QuizSession || mongoose.model("QuizSession", quizSessionSchema);

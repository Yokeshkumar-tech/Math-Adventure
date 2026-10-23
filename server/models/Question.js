import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    grade: { type: Number, required: true, enum: [5, 6] },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ["easy", "medium", "hard"] },
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, "Must have exactly 4 options"],
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    expression: { type: String, default: null },
    source: { type: String, default: "bank" },
  },
  { timestamps: true }
);

questionSchema.index({ grade: 1, topic: 1, difficulty: 1 });

export default mongoose.models.Question || mongoose.model("Question", questionSchema);

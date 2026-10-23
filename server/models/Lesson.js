import mongoose from "mongoose";

const workedExampleSchema = new mongoose.Schema(
  {
    problem: { type: String, required: true },
    steps: [{ type: String, required: true }],
    answer: { type: String, required: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    grade: { type: Number, required: true, enum: [5, 6] },
    topic: { type: String, required: true },
    slug: { type: String, required: true },
    difficulty: { type: String, default: "medium" },
    objectives: [{ type: String, required: true }],
    explanation: { type: String, required: true },
    workedExamples: [workedExampleSchema],
    realLifeExample: { type: String, default: "" },
    keyPoints: [{ type: String }],
    infographicUrl: { type: String, default: "/images/fractions-pizza.svg" },
    infographicType: { type: String, default: "pizza" },
    videoUrl: { type: String, default: "" },
    published: { type: Boolean, default: true },
    estimatedMinutes: { type: Number, default: 10 },
  },
  { timestamps: true }
);

lessonSchema.index({ grade: 1, slug: 1 }, { unique: true });

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

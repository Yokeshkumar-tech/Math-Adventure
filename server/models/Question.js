import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    grade: { type: Number, required: true, enum: [5, 6] },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true, enum: ["easy", "medium", "hard", "boss"] },
    answerType: {
      type: String,
      enum: ["multiple_choice", "true_false", "numerical", "fill_blank", "geometry_svg"],
      default: "multiple_choice",
    },
    question: { type: String, required: true },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    title: { type: String, default: "" },
    realm: { type: String, default: "" },
    missionId: { type: mongoose.Schema.Types.ObjectId, ref: "Mission", default: null },
    hint: { type: String, default: "Break the problem down step by step!" },
    hints: {
      clue: { type: String, default: null },
      concept: { type: String, default: null },
      workedExample: { type: String, default: null },
    },
    points: { type: Number, default: 10 },
    diagramSvg: { type: String, default: null }, // Optional SVG snippet or shape descriptor for visual questions
    estimatedTimeSeconds: { type: Number, default: 45 },
    tags: { type: [String], default: [] },
    expression: { type: String, default: null },
    formula: { type: String, default: null },
    stepByStep: { type: [String], default: [] },
    commonMistakes: { type: String, default: null },
    realLifeExample: { type: String, default: null },
    source: { type: String, default: "bank" },
    status: {
      type: String,
      enum: ["draft", "review", "published", "archived"],
      default: "published",
      index: true,
    },
    version: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.virtual("questionText").get(function () {
  return this.question;
});

questionSchema.index({ grade: 1, topic: 1, difficulty: 1, answerType: 1 });

export default mongoose.models.Question || mongoose.model("Question", questionSchema);

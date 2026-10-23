import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    grade: { type: Number, enum: [5, 6], default: 5 },
    avatar: { type: String, default: "math-explorer" },
    displayName: { type: String, default: "" }, // optional leaderboard nickname
    showOnLeaderboard: { type: Boolean, default: false }, // opt-in for children
    isGuest: { type: Boolean, default: false },
    totalPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null }, // "YYYY-MM-DD" in IST
    dailyGoal: { type: Number, default: 5 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    settings: {
      fontScale: { type: Number, default: 1 },
      highContrast: { type: Boolean, default: false },
      language: { type: String, enum: ["en", "ta"], default: "en" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

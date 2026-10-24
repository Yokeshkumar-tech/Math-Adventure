import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    nickname: { type: String, default: "MathHero", trim: true, maxlength: 20 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, sparse: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "superadmin", "content_admin", "reviewer"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: { type: Date, default: null },
    suspendedReason: { type: String, default: "" },
    grade: { type: Number, enum: [5, 6], default: 5 },
    avatar: { type: String, default: "knight" },
    selectedCharacter: {
      id: { type: String, default: "knight" }, // knight, archer, mage, explorer, golem
      costume: { type: String, default: "default" },
      accessory: { type: String, default: "none" },
      pet: { type: String, default: "none" },
    },
    displayName: { type: String, default: "" },
    showOnLeaderboard: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
    totalCoins: { type: Number, default: 100, min: 0 },
    totalStars: { type: Number, default: 0, min: 0 },
    totalXP: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, default: 0 }, // sync with XP
    currentLevel: { type: Number, default: 1, min: 1 },
    unlockedWorlds: {
      type: [String],
      default: ["number-forest"],
    },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null }, // "YYYY-MM-DD" in IST
    dailyGoal: { type: Number, default: 5 },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    settings: {
      fontScale: { type: Number, default: 1 },
      highContrast: { type: Boolean, default: false },
      soundEnabled: { type: Boolean, default: true },
      musicEnabled: { type: Boolean, default: true },
      language: { type: String, enum: ["en", "ta"], default: "en" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);

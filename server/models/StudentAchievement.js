import mongoose from "mongoose";

// Prevents duplicate badges per student
const studentAchievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: "Achievement", required: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

studentAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.models.StudentAchievement ||
  mongoose.model("StudentAchievement", studentAchievementSchema);

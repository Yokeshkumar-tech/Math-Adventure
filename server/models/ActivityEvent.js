// server/models/ActivityEvent.js
import mongoose from "mongoose";

const activityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "login",
        "quiz_start",
        "quiz_complete",
        "answer_submit",
        "mission_start",
        "mission_complete",
        "boss_defeat",
        "reward_earned",
        "realworld_complete",
        "tutor_query",
        "admin_publish",
        "admin_change",
      ],
    },
    category: {
      type: String,
      enum: ["login", "quiz", "mission", "reward", "realworld", "tutor", "admin", "all"],
      default: "quiz",
      index: true,
    },
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    playerName: { type: String, default: "Adventurer" },
    playerAvatar: { type: String, default: "knight" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    topic: { type: String, default: "" },
    score: { type: Number, default: 0 },
    xpGained: { type: Number, default: 0 },
    coinsGained: { type: Number, default: 0 },
    activityId: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityEventSchema.index({ createdAt: -1 });
activityEventSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.ActivityEvent || mongoose.model("ActivityEvent", activityEventSchema);

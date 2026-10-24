// server/models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["update", "event", "maintenance", "challenge", "reward"],
      default: "update",
    },
    targetAudience: {
      type: String,
      enum: ["all", "grade5", "grade6"],
      default: "all",
    },
    icon: { type: String, default: "📢" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    expiresAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

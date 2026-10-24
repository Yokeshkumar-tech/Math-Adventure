// server/models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    title: { type: String, default: "New Math Chat" },
    level: {
      type: String,
      enum: ["elementary", "middle", "high", "college", "advanced", "beginner", "intermediate"],
      default: "middle",
    },
    topic: { type: String, default: "General Math" },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

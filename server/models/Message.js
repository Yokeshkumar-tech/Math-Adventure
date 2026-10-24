// server/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    steps: {
      type: [String],
      default: [],
    },
    finalAnswer: {
      type: String,
      default: "",
    },
    formula: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["ai", "symbolic_math", "verification", "system"],
      default: "ai",
    },
    feedback: {
      type: String,
      enum: ["up", "down", null],
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);

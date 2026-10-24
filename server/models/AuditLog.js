// server/models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    actorName: { type: String, default: "Admin" },
    actorRole: { type: String, default: "superadmin" },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "auth",
        "question",
        "quiz",
        "realm",
        "mission",
        "player",
        "reward",
        "announcement",
        "config",
        "user_permission",
      ],
    },
    resourceId: { type: String, default: "" },
    changeSummary: { type: String, required: true },
    reason: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

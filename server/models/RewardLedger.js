import mongoose from "mongoose";

// Every point award is a unique, auditable row to prevent double claims
const rewardLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rewardKey: { type: String, required: true }, // e.g. "lesson:<id>", "quiz:<sessionId>"
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

rewardLedgerSchema.index({ userId: 1, rewardKey: 1 }, { unique: true });

export default mongoose.models.RewardLedger || mongoose.model("RewardLedger", rewardLedgerSchema);

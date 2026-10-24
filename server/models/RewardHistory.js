import mongoose from "mongoose";

const rewardHistorySchema = new mongoose.Schema(
  {
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rewardType: { type: String, enum: ["coins", "xp", "stars", "item", "badge"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    uniqueTransactionKey: { type: String, required: true },
  },
  { timestamps: true }
);

rewardHistorySchema.index({ playerId: 1, uniqueTransactionKey: 1 }, { unique: true });

export default mongoose.models.RewardHistory ||
  mongoose.model("RewardHistory", rewardHistorySchema);

import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: String, required: true },
    category: { type: String, enum: ["costume", "accessory"], required: true },
    purchased: { type: Boolean, default: true },
    equipped: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.index({ playerId: 1, itemId: 1 }, { unique: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);

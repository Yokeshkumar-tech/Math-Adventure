import mongoose from "mongoose";

const shopItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["costume", "accessory", "pet", "effect"], required: true },
    priceCoins: { type: Number, required: true, min: 0 },
    icon: { type: String, required: true },
    characterRequirement: { type: String, default: "any" },
    statBonus: { type: String, default: "+5 XP Boost" },
  },
  { timestamps: true }
);

export default mongoose.models.ShopItem || mongoose.model("ShopItem", shopItemSchema);

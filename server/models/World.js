import mongoose from "mongoose";

const worldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    backgroundImage: { type: String, default: "" },
    themeColor: { type: String, default: "#10B981" },
    icon: { type: String, default: "🌲" },
    topic: { type: String, required: true },
    order: { type: Number, required: true },
    bossName: { type: String, default: "World Boss" },
    unlockRequirements: {
      minStars: { type: Number, default: 0 },
      prevWorldSlug: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.models.World || mongoose.model("World", worldSchema);

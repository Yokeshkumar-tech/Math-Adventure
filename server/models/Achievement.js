import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, default: "general" },
    xpBonus: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);

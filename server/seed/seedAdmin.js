// server/seed/seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";
import dns from "node:dns";

if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (_) {}
}

import User from "../models/User.js";
import GameConfig from "../models/GameConfig.js";

async function seedAdmin() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  const salt = await bcrypt.genSalt(10);

  // 1. Super Admin Account
  const superPasswordHash = await bcrypt.hash("AdminMaster2026!", salt);
  await User.findOneAndUpdate(
    { username: "superadmin" },
    {
      $set: {
        name: "Grand Archmage (Super Admin)",
        nickname: "ArchmageAdmin",
        username: "superadmin",
        email: "admin@mathadventure.com",
        passwordHash: superPasswordHash,
        role: "superadmin",
        status: "active",
        permissions: [
          "manage_questions",
          "publish_content",
          "manage_quizzes",
          "manage_realms",
          "manage_missions",
          "manage_players",
          "manage_economy",
          "manage_announcements",
          "view_analytics",
          "manage_admins",
          "manage_settings",
          "export_data",
        ],
        grade: 5,
        avatar: "mage",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Super Admin seeded: admin@mathadventure.com / superadmin (password: AdminMaster2026!)");

  // 2. Content Admin Account
  const contentPasswordHash = await bcrypt.hash("ContentPro2026!", salt);
  await User.findOneAndUpdate(
    { username: "contentadmin" },
    {
      $set: {
        name: "Master Chronicler (Content Admin)",
        nickname: "Chronicler",
        username: "contentadmin",
        email: "content@mathadventure.com",
        passwordHash: contentPasswordHash,
        role: "content_admin",
        status: "active",
        permissions: [
          "manage_questions",
          "publish_content",
          "manage_quizzes",
          "manage_realms",
          "manage_missions",
          "view_analytics",
        ],
        grade: 5,
        avatar: "explorer",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Content Admin seeded: content@mathadventure.com / contentadmin (password: ContentPro2026!)");

  // 3. Teacher Account
  const teacherPasswordHash = await bcrypt.hash("TeacherStar2026!", salt);
  await User.findOneAndUpdate(
    { username: "teachermath" },
    {
      $set: {
        name: "Professor Archimedes (Teacher)",
        nickname: "ProfArchimedes",
        username: "teachermath",
        email: "teacher@mathadventure.com",
        passwordHash: teacherPasswordHash,
        role: "teacher",
        status: "active",
        permissions: ["manage_questions", "view_analytics"],
        grade: 5,
        avatar: "golem",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Teacher seeded: teacher@mathadventure.com / teachermath (password: TeacherStar2026!)");

  // 4. Initialize GameConfig if not exists
  await GameConfig.findOneAndUpdate(
    { key: "global_economy" },
    {
      $setOnInsert: {
        key: "global_economy",
        xpPerCorrect: 10,
        bonusCoinsOnComplete: 50,
        dailyGoalQuestions: 5,
        streakThresholds: { tier1: 3, tier2: 5, tier3: 8 },
        powerUpPricing: {
          fiftyFifty: 30,
          streakShield: 50,
          hintCrystal: 20,
          timeBoost: 20,
        },
        realmUnlockRequirements: {
          "number-forest": 0,
          "fraction-kingdom": 8,
          "desert-of-numbers": 18,
          "ocean-of-geometry": 30,
          "dragons-castle": 42,
        },
        maintenanceMode: false,
        registrationOpen: true,
      },
    },
    { upsert: true }
  );
  console.log("Global GameConfig verified.");

  console.log("All admin credentials initialized successfully!");
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Seed admin error:", err);
  process.exit(1);
});

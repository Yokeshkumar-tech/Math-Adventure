// server/seed/seed.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import "dotenv/config";

import Achievement from "../models/Achievement.js";
import Lesson from "../models/Lesson.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import StudentAchievement from "../models/StudentAchievement.js";
import QuizAttempt from "../models/QuizAttempt.js";
import World from "../models/World.js";
import Mission from "../models/Mission.js";
import ShopItem from "../models/ShopItem.js";
import Inventory from "../models/Inventory.js";
import PlayerProgress from "../models/PlayerProgress.js";
import { validateQuestion } from "../utils/validateQuestion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";
  const sanitizedUri = uri.replace(/:([^@]+)@/, ":****@");
  console.log(`Connecting to MongoDB at: ${sanitizedUri}`);
  await mongoose.connect(uri);

  console.log("Loading seed datasets...");
  const achievements = JSON.parse(fs.readFileSync(path.join(__dirname, "achievements.json"), "utf-8"));
  const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, "lessons.json"), "utf-8"));
  const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf-8"));
  const worlds = JSON.parse(fs.readFileSync(path.join(__dirname, "worlds.json"), "utf-8"));
  const missions = JSON.parse(fs.readFileSync(path.join(__dirname, "missions.json"), "utf-8"));
  const shopItems = JSON.parse(fs.readFileSync(path.join(__dirname, "shopItems.json"), "utf-8"));

  // 1. Verify question bank integrity
  console.log(`Validating ${questions.length} questions before database insertion...`);
  for (let i = 0; i < questions.length; i++) {
    const check = validateQuestion(questions[i]);
    if (!check.ok) {
      throw new Error(`Invalid question in seed data at index ${i}: ${check.errors.join(", ")}`);
    }
  }
  console.log("Question bank mathematical verification 100% complete!");

  // 2. Clear collections
  console.log("Resetting collections...");
  await Promise.all([
    Achievement.deleteMany({}),
    Lesson.deleteMany({}),
    Question.deleteMany({}),
    World.deleteMany({}),
    Mission.deleteMany({}),
    ShopItem.deleteMany({}),
    User.deleteMany({}),
    Inventory.deleteMany({}),
    PlayerProgress.deleteMany({}),
  ]);

  // 3. Insert collections
  console.log(`Inserting ${achievements.length} achievements...`);
  const insertedAchievements = await Achievement.insertMany(achievements);

  console.log(`Inserting ${lessons.length} lessons...`);
  const insertedLessons = await Lesson.insertMany(lessons);

  console.log(`Inserting ${questions.length} validated questions...`);
  const insertedQuestions = await Question.insertMany(questions);

  console.log(`Inserting ${worlds.length} adventure worlds...`);
  const insertedWorlds = await World.insertMany(worlds);

  console.log(`Inserting ${shopItems.length} shop items...`);
  await ShopItem.insertMany(shopItems);

  // Map world slugs to ObjectIds
  const worldMap = {};
  insertedWorlds.forEach((w) => {
    worldMap[w.slug] = w._id;
  });

  // Assign questions to missions
  console.log(`Connecting questions to ${missions.length} missions...`);
  const enrichedMissions = missions.map((m) => {
    const worldId = worldMap[m.worldSlug];
    // Find matching questions for this mission
    let matching = insertedQuestions.filter(
      (q) =>
        q.topic.toLowerCase().includes(m.topic.toLowerCase()) ||
        m.topic.toLowerCase().includes(q.topic.toLowerCase())
    );

    if (matching.length < 5) {
      // Fallback: match by difficulty or general bank
      matching = insertedQuestions.slice(0, 5);
    }

    const assignedQuestions = matching.slice(0, 5).map((q) => q._id);

    return {
      ...m,
      worldId,
      questionIds: assignedQuestions,
    };
  });

  const insertedMissions = await Mission.insertMany(enrichedMissions);
  console.log(`Successfully seeded ${insertedMissions.length} missions across 5 worlds!`);

  // 4. Create demo student account Priya
  console.log("Creating default student account 'priya' (password: champion123)...");
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("champion123", salt);

  const firstLesson = insertedLessons.find((l) => l.topic === "Fractions");

  const priya = await User.create({
    name: "Priya Sharma",
    nickname: "PriyaChamp",
    username: "priya",
    passwordHash,
    role: "student",
    grade: 5,
    avatar: "knight",
    selectedCharacter: {
      id: "knight",
      costume: "golden-armor",
      accessory: "flame-shield",
    },
    displayName: "PriyaChamp",
    showOnLeaderboard: true,
    totalCoins: 350,
    totalStars: 6,
    totalXP: 250,
    totalPoints: 250,
    currentLevel: 2,
    unlockedWorlds: ["number-forest", "fraction-kingdom"],
    currentStreak: 5,
    longestStreak: 5,
    lastActiveDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
    completedLessons: firstLesson ? [firstLesson._id] : [],
    settings: {
      fontScale: 1,
      highContrast: false,
      soundEnabled: true,
      musicEnabled: true,
      language: "en",
    },
  });

  // Add owned inventory items for Priya
  await Inventory.create([
    { playerId: priya._id, itemId: "golden-armor", category: "costume", purchased: true, equipped: true },
    { playerId: priya._id, itemId: "flame-shield", category: "accessory", purchased: true, equipped: true },
  ]);

  // Complete missions 1 and 2 in Number Forest for Priya
  const forestMissions = insertedMissions.filter((m) => m.worldSlug === "number-forest");
  if (forestMissions[0]) {
    await PlayerProgress.create({
      playerId: priya._id,
      missionId: forestMissions[0]._id,
      completed: true,
      bestScore: 5,
      totalQuestions: 5,
      starsEarned: 3,
      attempts: 1,
      completedAt: new Date(Date.now() - 86400000 * 2),
    });
  }
  if (forestMissions[1]) {
    await PlayerProgress.create({
      playerId: priya._id,
      missionId: forestMissions[1]._id,
      completed: true,
      bestScore: 5,
      totalQuestions: 5,
      starsEarned: 3,
      attempts: 1,
      completedAt: new Date(Date.now() - 86400000),
    });
  }

  // Award 3 badges to Priya
  for (let i = 0; i < Math.min(3, insertedAchievements.length); i++) {
    try {
      await StudentAchievement.create({
        userId: priya._id,
        achievementId: insertedAchievements[i]._id,
        unlockedAt: new Date(Date.now() - 86400000 * (3 - i)),
      });
    } catch {}
  }

  // Add initial attempt for Priya
  await QuizAttempt.create({
    userId: priya._id,
    topic: "Fractions",
    grade: 5,
    totalQuestions: 10,
    correctAnswers: 8,
    accuracy: 80,
    pointsEarned: 100,
    difficultyReached: "medium",
    difficultyProgression: [
      "easy", "easy", "easy", "medium", "medium",
      "medium", "easy", "easy", "easy", "medium",
    ],
    completedAt: new Date(Date.now() - 3600000 * 2),
  });

  // 5. Create demo teacher account
  const teacherHash = await bcrypt.hash("teachmath123", salt);
  await User.create({
    name: "Mr. Ramanujan",
    nickname: "MasterTeacher",
    username: "teacher",
    passwordHash: teacherHash,
    role: "teacher",
    grade: 5,
    avatar: "wizard",
    totalCoins: 1000,
    totalStars: 25,
    totalXP: 1000,
    totalPoints: 1000,
    currentStreak: 10,
    longestStreak: 10,
    settings: { fontScale: 1, highContrast: false, soundEnabled: true, musicEnabled: true, language: "en" },
  });

  console.log("Full game database seeded successfully!");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

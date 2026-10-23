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
import RewardLedger from "../models/RewardLedger.js";
import QuizSession from "../models/QuizSession.js";
import { validateQuestion } from "../utils/validateQuestion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";
  console.log(`Connecting to MongoDB at: ${uri}`);
  await mongoose.connect(uri);

  console.log("Loading seed datasets...");
  const achievements = JSON.parse(fs.readFileSync(path.join(__dirname, "achievements.json"), "utf-8"));
  const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, "lessons.json"), "utf-8"));
  const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf-8"));

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
  ]);

  // 3. Insert collections
  console.log(`Inserting ${achievements.length} achievements...`);
  const insertedAchievements = await Achievement.insertMany(achievements);

  console.log(`Inserting ${lessons.length} lessons...`);
  const insertedLessons = await Lesson.insertMany(lessons);

  console.log(`Inserting ${questions.length} validated questions...`);
  await Question.insertMany(questions);

  // 4. Create or update demo student Priya
  const existingPriya = await User.findOne({ username: "priya" });
  if (!existingPriya) {
    console.log("Creating default student account 'priya' (password: champion123)...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("champion123", salt);

    const firstLesson = insertedLessons.find((l) => l.topic === "Fractions");

    const priya = await User.create({
      name: "Priya Sharma",
      username: "priya",
      passwordHash,
      role: "student",
      grade: 5,
      avatar: "math-explorer",
      displayName: "PriyaChamp",
      showOnLeaderboard: true,
      totalPoints: 250,
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
      completedLessons: firstLesson ? [firstLesson._id] : [],
      settings: { fontScale: 1, highContrast: false, language: "en" },
    });

    // Award 3 initial badges to Priya
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

    console.log("Created demo student 'priya' with sample progress!");
  }

  // 5. Create demo teacher account
  const existingTeacher = await User.findOne({ username: "teacher" });
  if (!existingTeacher) {
    console.log("Creating demo teacher account 'teacher' (password: teachmath123)...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("teachmath123", salt);

    await User.create({
      name: "Mr. Ramanujan",
      username: "teacher",
      passwordHash,
      role: "teacher",
      grade: 5,
      avatar: "wizard",
      totalPoints: 1000,
      currentStreak: 10,
      longestStreak: 10,
      settings: { fontScale: 1, highContrast: false, language: "en" },
    });
  }

  console.log("Database seeded successfully!");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

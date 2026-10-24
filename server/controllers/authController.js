// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Achievement from "../models/Achievement.js";
import StudentAchievement from "../models/StudentAchievement.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Lesson from "../models/Lesson.js";
import { calculateLevel } from "../config/scoring.js";

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET || "fallback_secret_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export function serializeUser(user, badgesCount = 0) {
  return {
    id: user._id,
    name: user.name,
    nickname: user.nickname || user.displayName || user.name,
    username: user.username,
    role: user.role,
    grade: user.grade,
    avatar: user.avatar,
    displayName: user.displayName,
    totalPoints: user.totalPoints || user.totalXP || 0,
    totalCoins: user.totalCoins ?? 100,
    totalStars: user.totalStars ?? 0,
    totalXP: user.totalXP ?? 0,
    currentLevel: user.currentLevel ?? 1,
    selectedCharacter: user.selectedCharacter || { id: "knight", costume: "default", accessory: "none" },
    unlockedWorlds: user.unlockedWorlds?.length ? user.unlockedWorlds : ["number-forest"],
    currentStreak: user.currentStreak || 1,
    longestStreak: user.longestStreak || 1,
    badgesCount,
    settings: user.settings,
    isGuest: !!user.isGuest,
    levelInfo: calculateLevel(user.totalPoints || user.totalXP || 0),
  };
}

export async function register(req, res) {
  try {
    const { name, username, password, grade = 5, avatar = "math-explorer", nickname } = req.body;
    if (!name || !username || !password) {
      return res.status(400).json({ message: "Oops, please fill in your name, username and password!" });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "This username is already taken. Try another cool name!" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      nickname: (nickname || name).trim(),
      username: username.toLowerCase().trim(),
      passwordHash,
      grade: Number(grade) || 5,
      avatar,
      totalPoints: 0,
      totalCoins: 100,
      totalStars: 0,
      totalXP: 0,
      currentLevel: 1,
      selectedCharacter: { id: "knight", costume: "default", accessory: "none" },
      unlockedWorlds: ["number-forest"],
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: serializeUser(user, 0),
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again!" });
  }
}

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Please enter your username and password." });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password. Check and try again!" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password. Check and try again!" });
    }

    const token = generateToken(user);
    const badgesCount = await StudentAchievement.countDocuments({ userId: user._id });

    res.json({
      token,
      user: serializeUser(user, badgesCount),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
}

// Guest / Demo mode: instant access with pre-populated demo data (250 points, 5-day streak, 3 badges)
export async function guestLogin(req, res) {
  try {
    const guestUsername = `guest_${Math.random().toString(36).substring(2, 8)}`;
    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash("demo1234", salt);

    // Find any lesson to mark as completed
    const firstLesson = await Lesson.findOne({ grade: 5 });

    const user = await User.create({
      name: "Demo Explorer",
      nickname: "DemoChampion",
      username: guestUsername,
      passwordHash,
      role: "student",
      grade: 5,
      avatar: "rocket-math",
      isGuest: true,
      displayName: "DemoChampion",
      showOnLeaderboard: false,
      totalPoints: 250,
      totalCoins: 250,
      totalStars: 4,
      totalXP: 200,
      currentLevel: 2,
      selectedCharacter: { id: "knight", costume: "default", accessory: "none" },
      unlockedWorlds: ["number-forest"],
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()),
      completedLessons: firstLesson ? [firstLesson._id] : [],
      settings: { fontScale: 1, highContrast: false, language: "en", soundEnabled: true, musicEnabled: true },
    });

    // Populate 3 sample achievements for guest
    const achievements = await Achievement.find().limit(3);
    for (const ach of achievements) {
      try {
        await StudentAchievement.create({
          userId: user._id,
          achievementId: ach._id,
          unlockedAt: new Date(Date.now() - 86400000 * 2),
        });
      } catch {}
    }

    // Populate a sample quiz attempt so charts render immediately
    await QuizAttempt.create({
      userId: user._id,
      topic: "Fractions",
      grade: 5,
      totalQuestions: 10,
      correctAnswers: 8,
      accuracy: 80,
      pointsEarned: 100,
      difficultyReached: "medium",
      difficultyProgression: [
        "easy",
        "easy",
        "easy",
        "medium",
        "medium",
        "medium",
        "easy",
        "easy",
        "easy",
        "medium",
      ],
      completedAt: new Date(Date.now() - 3600000 * 4),
    });

    const token = generateToken(user);
    res.json({
      token,
      user: serializeUser(user, achievements.length),
    });
  } catch (err) {
    console.error("Guest login error:", err);
    res.status(500).json({ message: "Could not create guest session." });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const badgesCount = await StudentAchievement.countDocuments({ userId: user._id });
    const levelInfo = calculateLevel(user.totalPoints);

    res.json({
      user: serializeUser(user, badgesCount),
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error retrieving profile." });
  }
}

export async function updateProfile(req, res) {
  try {
    const { grade, avatar, displayName, showOnLeaderboard, settings } = req.body;
    const updates = {};

    if (grade && [5, 6].includes(Number(grade))) updates.grade = Number(grade);
    if (avatar) updates.avatar = avatar;
    if (displayName !== undefined) updates.displayName = displayName;
    if (showOnLeaderboard !== undefined) updates.showOnLeaderboard = !!showOnLeaderboard;
    if (settings) {
      updates.settings = {
        fontScale: settings.fontScale || 1,
        highContrast: !!settings.highContrast,
        language: settings.language || "en",
      };
    }

    const updated = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { returnDocument: "after" }).select("-passwordHash");
    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }
    const badgesCount = await StudentAchievement.countDocuments({ userId: updated._id });

    res.json({
      user: serializeUser(updated, badgesCount),
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Error updating profile." });
  }
}

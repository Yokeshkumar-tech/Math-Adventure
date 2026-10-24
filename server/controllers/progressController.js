// server/controllers/progressController.js
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Achievement from "../models/Achievement.js";
import StudentAchievement from "../models/StudentAchievement.js";
import Question from "../models/Question.js";
import { recommend, topicStats } from "../utils/recommend.js";
import { calculateLevel } from "../config/scoring.js";

export async function getProgress(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const attempts = await QuizAttempt.find({ userId: req.user.id }).sort({ completedAt: -1 }).lean();

    const totalQuestions = attempts.reduce((s, a) => s + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((s, a) => s + a.correctAnswers, 0);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Last 7 attempts for the Recharts progress chart
    const recentAttempts = [...attempts]
      .reverse()
      .slice(-7)
      .map((a, i) => ({
        index: i + 1,
        topic: a.topic,
        accuracy: a.accuracy,
        points: a.pointsEarned,
        difficulty: a.difficultyReached,
        date: new Date(a.completedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      }));

    // Topic breakdown
    const topicBreakdown = await topicStats(user._id, user.grade || 5);

    // Mistake Analysis: aggregate frequently missed questions
    const missedMap = {};
    attempts.forEach((att) => {
      (att.missedQuestionIds || []).forEach((qid) => {
        const idStr = String(qid);
        missedMap[idStr] = (missedMap[idStr] || 0) + 1;
      });
    });

    const missedIds = Object.keys(missedMap);
    let frequentlyMissed = [];
    if (missedIds.length > 0) {
      const qDocs = await Question.find({ _id: { $in: missedIds } }).lean();
      frequentlyMissed = qDocs.map((q) => ({
        id: q._id,
        topic: q.topic,
        question: q.question,
        difficulty: q.difficulty,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        timesMissed: missedMap[String(q._id)] || 1,
      }));
      frequentlyMissed.sort((a, b) => b.timesMissed - a.timesMissed);
    }

    const totalLessons = await Lesson.countDocuments({ grade: user.grade || 5 });
    const completedCount = (user.completedLessons || []).length;

    res.json({
      student: {
        name: user.name,
        grade: user.grade,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        levelInfo: calculateLevel(user.totalPoints),
      },
      stats: {
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        quizzesTaken: attempts.length,
        lessonsCompleted: completedCount,
        totalLessons,
        dailyGoal: user.dailyGoal || 5,
        dailyGoalProgress: Math.min(user.dailyGoal || 5, attempts.length),
      },
      recentAttempts,
      topicBreakdown,
      frequentlyMissed: frequentlyMissed.slice(0, 5),
    });
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ message: "Error calculating student progress." });
  }
}

export async function getAchievements(req, res) {
  try {
    const allBadges = await Achievement.find().lean();
    const userUnlocks = await StudentAchievement.find({ userId: req.user.id }).lean();
    const unlockMap = new Map();
    userUnlocks.forEach((u) => unlockMap.set(String(u.achievementId), u.unlockedAt));

    const badges = allBadges.map((b) => ({
      ...b,
      unlocked: unlockMap.has(String(b._id)),
      unlockedAt: unlockMap.get(String(b._id)) || null,
    }));

    res.json(badges);
  } catch (err) {
    console.error("Get achievements error:", err);
    res.status(500).json({ message: "Error loading achievements." });
  }
}

export async function getLeaderboard(req, res) {
  try {
    const topStudents = await User.find({ role: "student" })
      .select("name nickname displayName avatar totalPoints totalStars totalXP currentStreak selectedCharacter")
      .sort({ totalStars: -1, totalPoints: -1, totalXP: -1 })
      .limit(15)
      .lean();

    const ranked = topStudents.map((s, index) => ({
      rank: index + 1,
      id: s._id,
      name: s.nickname || s.displayName || (s.name ? `${s.name.slice(0, 4)}***` : `Hero_${index + 1}`),
      avatar: s.selectedCharacter?.id || s.avatar || "knight",
      costume: s.selectedCharacter?.costume || "default",
      accessory: s.selectedCharacter?.accessory || "none",
      pet: s.selectedCharacter?.pet || "none",
      stars: s.totalStars || 0,
      xp: s.totalXP || s.totalPoints || 0,
      points: s.totalPoints || s.totalXP || 0,
      streak: s.currentStreak || 0,
      isCurrentUser: String(s._id) === String(req.user.id),
    }));

    res.json(ranked);
  } catch (err) {
    console.error("Get leaderboard error:", err);
    res.status(500).json({ message: "Error loading leaderboard." });
  }
}

export async function getRecommendations(req, res) {
  try {
    const recommendation = await recommend(req.user.id);
    res.json(recommendation);
  } catch (err) {
    console.error("Get recommendations error:", err);
    res.status(500).json({ message: "Error generating recommendation." });
  }
}

export async function getTeacherOverview(req, res) {
  try {
    const students = await User.find({ role: "student", isGuest: false })
      .select("name username grade totalPoints currentStreak completedLessons")
      .lean();

    const attempts = await QuizAttempt.find().lean();

    const overview = students.map((s) => {
      const studentAttempts = attempts.filter((a) => String(a.userId) === String(s._id));
      const totalQ = studentAttempts.reduce((acc, a) => acc + a.totalQuestions, 0);
      const totalC = studentAttempts.reduce((acc, a) => acc + a.correctAnswers, 0);
      const accuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

      return {
        id: s._id,
        name: s.name,
        grade: s.grade,
        points: s.totalPoints,
        streak: s.currentStreak,
        lessonsCompleted: (s.completedLessons || []).length,
        quizzesTaken: studentAttempts.length,
        accuracy,
      };
    });

    res.json(overview);
  } catch (err) {
    console.error("Teacher overview error:", err);
    res.status(500).json({ message: "Error fetching teacher overview." });
  }
}

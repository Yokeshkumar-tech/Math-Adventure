// server/utils/achievements.js
import Achievement from "../models/Achievement.js";
import StudentAchievement from "../models/StudentAchievement.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";

const RULES = [
  { key: "first-steps", test: (s) => s.lessonsCompleted >= 1 },
  { key: "math-explorer", test: (s) => s.topicsStudied >= 3 },
  { key: "accuracy-star", test: (s, ctx) => (ctx.accuracy !== undefined ? ctx.accuracy >= 90 && (ctx.total || 10) >= 5 : false) },
  { key: "streak-master", test: (s) => s.currentStreak >= 7 },
  { key: "math-champion", test: (s) => s.topicsCompleted >= 5 && s.badges >= 4 },
];

export async function getStats(userId) {
  const user = await User.findById(userId).lean();
  if (!user) return { lessonsCompleted: 0, topicsStudied: 0, currentStreak: 0, topicsCompleted: 0, badges: 0 };

  const attempts = await QuizAttempt.find({ userId }).lean();
  const studiedTopics = new Set(attempts.map((a) => a.topic));
  (user.completedLessons || []).forEach((l) => studiedTopics.add(String(l)));

  // Topics with high accuracy (>= 80%) considered mastered/completed
  const completedTopics = new Set(
    attempts.filter((a) => a.accuracy >= 80).map((a) => a.topic)
  );

  const badgesCount = await StudentAchievement.countDocuments({ userId });

  return {
    lessonsCompleted: (user.completedLessons || []).length,
    topicsStudied: studiedTopics.size,
    currentStreak: user.currentStreak || 0,
    topicsCompleted: completedTopics.size,
    badges: badgesCount,
  };
}

export async function checkAchievements(userId, ctx = {}) {
  const stats = await getStats(userId);
  const unlocked = [];

  for (const rule of RULES) {
    if (!rule.test(stats, ctx)) continue;

    const ach = await Achievement.findOne({ key: rule.key });
    if (!ach) continue;

    try {
      await StudentAchievement.create({ userId, achievementId: ach._id });
      unlocked.push(ach); // newly unlocked badge returned for celebration!
    } catch (e) {
      if (e.code !== 11000) throw e; // already unlocked, skip safely
    }
  }

  return unlocked;
}

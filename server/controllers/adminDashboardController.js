// server/controllers/adminDashboardController.js
import User from "../models/User.js";
import Question from "../models/Question.js";
import QuizAttempt from "../models/QuizAttempt.js";
import World from "../models/World.js";
import Mission from "../models/Mission.js";
import PlayerProgress from "../models/PlayerProgress.js";
import Message from "../models/Message.js";
import RewardHistory from "../models/RewardHistory.js";
import ActivityEvent from "../models/ActivityEvent.js";
import { getOnlineCount, getOnlinePlayersList } from "../services/socketService.js";

/**
 * Get comprehensive live KPI summary for Admin Overview
 */
export async function getDashboardSummary(req, res) {
  try {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

    const [
      totalPlayers,
      activeToday,
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      reviewQuestions,
      totalAttempts,
      accuracyAgg,
      totalRealms,
      totalMissions,
      completedMissions,
      tutorRequests,
      userCurrencyAgg,
      recentEvents,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", lastActiveDate: todayStr }),
      Question.countDocuments(),
      Question.countDocuments({ status: "published" }),
      Question.countDocuments({ status: "draft" }),
      Question.countDocuments({ status: "review" }),
      QuizAttempt.countDocuments(),
      QuizAttempt.aggregate([
        { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" }, totalEarned: { $sum: "$pointsEarned" } } },
      ]),
      World.countDocuments(),
      Mission.countDocuments(),
      PlayerProgress.countDocuments({ status: "completed" }),
      Message.countDocuments({ role: "user" }),
      User.aggregate([
        { $match: { role: "student" } },
        {
          $group: {
            _id: null,
            totalXP: { $sum: "$totalXP" },
            totalCoins: { $sum: "$totalCoins" },
            totalStars: { $sum: "$totalStars" },
          },
        },
      ]),
      ActivityEvent.find()
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
    ]);

    const avgAccuracy = accuracyAgg[0]?.avgAccuracy ? Math.round(accuracyAgg[0].avgAccuracy) : 0;
    const totalPointsAwarded = userCurrencyAgg[0]?.totalXP || accuracyAgg[0]?.totalEarned || 0;
    const totalCoinsInCirculation = userCurrencyAgg[0]?.totalCoins || 0;
    const totalStarsAwarded = userCurrencyAgg[0]?.totalStars || 0;
    const onlinePlayers = getOnlineCount();

    // If no ActivityEvents exist yet, generate from recent QuizAttempts
    let activityFeed = recentEvents;
    if (!activityFeed || activityFeed.length === 0) {
      const recentAttempts = await QuizAttempt.find()
        .sort({ completedAt: -1 })
        .limit(8)
        .populate("userId", "name username nickname currentLevel avatar")
        .lean();

      activityFeed = recentAttempts.map((att) => ({
        _id: att._id,
        eventType: "quiz_complete",
        category: "quiz",
        playerId: att.userId?._id,
        playerName: att.userId?.nickname || att.userId?.name || "Adventurer",
        playerAvatar: att.userId?.avatar || "knight",
        title: `Completed ${att.topic} Quiz`,
        description: `Scored ${att.accuracy}% with +${att.pointsEarned} XP earned`,
        topic: att.topic,
        score: att.accuracy,
        xpGained: att.pointsEarned,
        coinsGained: Math.round(att.pointsEarned / 2),
        createdAt: att.completedAt,
      }));
    }

    res.json({
      success: true,
      // 14 Live KPIs
      totalPlayers,
      onlinePlayers,
      activeToday,
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      reviewQuestions,
      totalAttempts,
      avgAccuracy,
      totalPointsAwarded,
      totalCoinsInCirculation,
      totalStarsAwarded,
      totalRealms,
      totalMissions,
      completedMissions,
      tutorRequests,
      // Live feed & online users
      activityFeed,
      onlinePlayersList: getOnlinePlayersList(),
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard metrics." });
  }
}

/**
 * Get paginated activity timeline with category filtering
 */
export async function getActivityTimeline(req, res) {
  try {
    const { category = "all", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const [events, total] = await Promise.all([
      ActivityEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      ActivityEvent.countDocuments(filter),
    ]);

    res.json({
      success: true,
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Activity timeline error:", err);
    res.status(500).json({ success: false, message: "Failed to load activity timeline." });
  }
}

/**
 * Get interactive charts data
 */
export async function getDashboardCharts(req, res) {
  try {
    // 1. Attempts over the past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const timelineAgg = await QuizAttempt.aggregate([
      { $match: { completedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          attempts: { $sum: 1 },
          avgAccuracy: { $avg: "$accuracy" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill dates in 7-day window
    const chartTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split("T")[0];
      const found = timelineAgg.find((item) => item._id === dateKey);
      chartTimeline.push({
        date: dateKey.slice(5), // "MM-DD"
        attempts: found ? found.attempts : 0,
        accuracy: found ? Math.round(found.avgAccuracy) : 0,
      });
    }

    // 2. Topic performance breakdown
    const topicAgg = await QuizAttempt.aggregate([
      {
        $group: {
          _id: "$topic",
          attempts: { $sum: 1 },
          avgAccuracy: { $avg: "$accuracy" },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 6 },
    ]);

    const topicPerformance = topicAgg.map((t) => ({
      topic: t._id || "General Math",
      accuracy: Math.round(t.avgAccuracy || 0),
      attempts: t.attempts,
    }));

    // If no attempts recorded yet, provide seed topics
    if (topicPerformance.length === 0) {
      topicPerformance.push(
        { topic: "Fractions", accuracy: 88, attempts: 24 },
        { topic: "Decimals", accuracy: 82, attempts: 18 },
        { topic: "Area & Perimeter", accuracy: 79, attempts: 15 },
        { topic: "Basic Geometry", accuracy: 91, attempts: 22 },
        { topic: "Factors & Multiples", accuracy: 85, attempts: 19 }
      );
    }

    // 3. Question Difficulty Distribution
    const difficultyAgg = await Question.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    const difficultyDistribution = [
      { name: "Easy", count: 0, color: "#10b981" },
      { name: "Medium", count: 0, color: "#f59e0b" },
      { name: "Hard", count: 0, color: "#f43f5e" },
      { name: "Boss", count: 0, color: "#8b5cf6" },
    ];

    difficultyAgg.forEach((d) => {
      const key = String(d._id).toLowerCase();
      if (key === "easy") difficultyDistribution[0].count = d.count;
      else if (key === "medium") difficultyDistribution[1].count = d.count;
      else if (key === "hard") difficultyDistribution[2].count = d.count;
      else if (key === "boss") difficultyDistribution[3].count = d.count;
    });

    // 4. Diagnostic report on questions with failure rates
    const highMissAgg = await QuizAttempt.aggregate([
      { $unwind: "$missedQuestionIds" },
      { $group: { _id: "$missedQuestionIds", missCount: { $sum: 1 } } },
      { $sort: { missCount: -1 } },
      { $limit: 5 },
    ]);

    const questionIds = highMissAgg.map((h) => h._id);
    const missedQuestions = await Question.find({ _id: { $in: questionIds } }).lean();

    const diagnosticQuestions = highMissAgg.map((h) => {
      const q = missedQuestions.find((item) => String(item._id) === String(h._id));
      return {
        id: h._id,
        question: q?.question || "Calculated problem",
        topic: q?.topic || "Arithmetic",
        difficulty: q?.difficulty || "medium",
        failureCount: h.missCount,
        flag: h.missCount >= 5 ? "Review Needed" : "Normal Variation",
      };
    });

    res.json({
      chartTimeline,
      topicPerformance,
      difficultyDistribution,
      diagnosticQuestions,
    });
  } catch (err) {
    console.error("Dashboard charts error:", err);
    res.status(500).json({ message: "Failed to generate dashboard charts." });
  }
}

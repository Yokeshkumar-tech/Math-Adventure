// server/controllers/adminAnalyticsController.js
import QuizAttempt from "../models/QuizAttempt.js";
import QuizSession from "../models/QuizSession.js";
import Question from "../models/Question.js";

export async function getDetailedAnalytics(req, res) {
  try {
    const { topic, timeframe = "30d" } = req.query;

    const days = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const matchFilter = { completedAt: { $gte: sinceDate } };
    if (topic && topic !== "all") {
      matchFilter.topic = topic;
    }

    // 1. Topic performance
    const topicStats = await QuizAttempt.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$topic",
          totalAttempts: { $sum: 1 },
          avgAccuracy: { $avg: "$accuracy" },
          totalPoints: { $sum: "$pointsEarned" },
        },
      },
      { $sort: { totalAttempts: -1 } },
    ]);

    // 2. Session completion vs abandonment rate
    const [totalSessions, finishedSessions] = await Promise.all([
      QuizSession.countDocuments({ createdAt: { $gte: sinceDate } }),
      QuizSession.countDocuments({ createdAt: { $gte: sinceDate }, finished: true }),
    ]);

    const abandonmentRate = totalSessions > 0
      ? Math.round(((totalSessions - finishedSessions) / totalSessions) * 100)
      : 8;

    // 3. Question Diagnostic: Most failed questions
    const missedAgg = await QuizAttempt.aggregate([
      { $match: matchFilter },
      { $unwind: "$missedQuestionIds" },
      { $group: { _id: "$missedQuestionIds", missCount: { $sum: 1 } } },
      { $sort: { missCount: -1 } },
      { $limit: 10 },
    ]);

    const missedIds = missedAgg.map((m) => m._id);
    const questions = await Question.find({ _id: { $in: missedIds } }).lean();

    const diagnosticReport = missedAgg.map((m) => {
      const q = questions.find((item) => String(item._id) === String(m._id));
      return {
        questionId: m._id,
        question: q?.question || "Question data",
        topic: q?.topic || "General Math",
        difficulty: q?.difficulty || "medium",
        failures: m.missCount,
        recommendation: m.missCount > 5 ? "Review hints and phrasing" : "Healthy difficulty challenge",
      };
    });

    res.json({
      timeframe: `${days} days`,
      topicStats: topicStats.map((t) => ({
        topic: t._id,
        attempts: t.totalAttempts,
        accuracy: Math.round(t.avgAccuracy),
        points: t.totalPoints,
      })),
      sessionMetrics: {
        totalSessions,
        finishedSessions,
        abandonmentRate,
        completionRate: 100 - abandonmentRate,
      },
      diagnosticReport,
    });
  } catch (err) {
    console.error("Detailed analytics error:", err);
    res.status(500).json({ message: "Failed to generate analytics." });
  }
}

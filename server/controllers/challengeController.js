// server/controllers/challengeController.js
import DailyChallenge from "../models/DailyChallenge.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import RewardHistory from "../models/RewardHistory.js";
import { publicGameQuestion } from "./gameController.js";

// Helper to get today's date string YYYY-MM-DD in IST
function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export async function getDailyChallenge(req, res) {
  try {
    const today = getTodayDateString();
    let challenge = await DailyChallenge.findOne({ dateString: today }).populate("questionIds");

    if (!challenge) {
      // Find 3 quality questions across topics
      const allCount = await Question.countDocuments();
      const hash = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const skip = Math.max(0, (hash * 5) % Math.max(1, allCount - 3));

      let questions = await Question.find().skip(skip).limit(3);
      if (questions.length < 3) {
        questions = await Question.find().limit(3);
      }

      challenge = await DailyChallenge.create({
        dateString: today,
        title: `Daily Quest — ${today}`,
        description: "Solve 3 daily math challenges to earn bonus coins, stars, and keep your streak blazing!",
        topic: "Mixed Mathematics",
        questionIds: questions.map((q) => q._id),
        rewards: { coins: 50, xp: 30, stars: 1 },
      });
      challenge = await DailyChallenge.findById(challenge._id).populate("questionIds");
    }

    const completedRecord = challenge.completions?.find(
      (c) => String(c.playerId) === String(req.user.id)
    );
    const completedToday = Boolean(completedRecord);

    const publicQuestions = (challenge.questionIds || []).map(publicGameQuestion);

    res.json({
      challenge: {
        id: challenge._id,
        dateString: challenge.dateString,
        title: challenge.title,
        description: challenge.description,
        topic: challenge.topic,
        rewards: challenge.rewards,
        completedToday,
        userScore: completedRecord ? completedRecord.score : null,
      },
      questions: publicQuestions,
      completedToday,
    });
  } catch (err) {
    console.error("Get daily challenge error:", err);
    res.status(500).json({ message: "Could not retrieve daily challenge." });
  }
}

export async function submitDailyChallenge(req, res) {
  try {
    const { answers } = req.body; // array of { questionId, selectedAnswer }
    const today = getTodayDateString();
    const challenge = await DailyChallenge.findOne({ dateString: today });

    if (!challenge) {
      return res.status(404).json({ message: "Daily challenge not found for today." });
    }

    // Check if already completed today
    const alreadyCompleted = challenge.completions?.some(
      (c) => String(c.playerId) === String(req.user.id)
    );
    if (alreadyCompleted) {
      return res.status(409).json({
        message: "You have already completed today's challenge! Streak preserved.",
        alreadyCompleted: true,
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "No answers provided." });
    }

    let correctCount = 0;
    const results = [];

    for (const item of answers) {
      const q = await Question.findById(item.questionId);
      if (!q) continue;

      const normUser = String(item.selectedAnswer ?? "").trim().toLowerCase();
      const normCorrect = String(q.correctAnswer ?? "").trim().toLowerCase();
      const isCorrect = normUser === normCorrect;

      if (isCorrect) correctCount++;

      results.push({
        questionId: q._id,
        isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      });
    }

    const coinsToAward = challenge.rewards?.coins || 50;
    const xpToAward = challenge.rewards?.xp || 30;
    const starsToAward = challenge.rewards?.stars || 1;

    // Calculate streak update: check if last Active was yesterday -> streak + 1, else 1
    const user = await User.findById(req.user.id);
    let newStreak = (user.streak || 0) + 1;

    user.totalCoins = (user.totalCoins || 0) + coinsToAward;
    user.totalXP = (user.totalXP || 0) + xpToAward;
    user.totalStars = (user.totalStars || 0) + starsToAward;
    user.streak = newStreak;
    user.lastActiveDate = today;
    await user.save();

    // Idempotent reward history
    try {
      await RewardHistory.create({
        playerId: user._id,
        rewardType: "daily_challenge",
        amount: coinsToAward,
        reason: `Completed Daily Challenge for ${today}`,
        uniqueTransactionKey: `daily:${today}:${user._id}`,
      });
    } catch {}

    // Record completion in DailyChallenge
    challenge.completions.push({
      playerId: user._id,
      completedAt: new Date(),
      score: correctCount,
    });
    await challenge.save();

    res.json({
      success: true,
      score: correctCount,
      totalQuestions: answers.length,
      coinsEarned: coinsToAward,
      xpEarned: xpToAward,
      starsEarned: starsToAward,
      currentStreak: newStreak,
      totalCoins: user.totalCoins,
      totalStars: user.totalStars,
      totalXP: user.totalXP,
      results,
    });
  } catch (err) {
    console.error("Submit daily challenge error:", err);
    res.status(500).json({ message: "Error recording daily challenge completion." });
  }
}

export async function getRevisionData(req, res) {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .sort({ completedAt: -1 })
      .limit(10);

    const missedIds = [];
    attempts.forEach((att) => {
      (att.missedQuestionIds || []).forEach((id) => missedIds.push(id));
    });

    const uniqueMissed = [...new Set(missedIds.map(String))];

    let questions = [];
    if (uniqueMissed.length > 0) {
      questions = await Question.find({ _id: { $in: uniqueMissed } }).limit(10);
    }

    if (questions.length === 0) {
      // Pick 5 high-value questions from across Grade 5 and 6
      questions = await Question.find({ difficulty: { $in: ["easy", "medium"] } }).limit(5);
    }

    res.json({
      questions: questions.map(publicGameQuestion),
      totalMissed: uniqueMissed.length,
    });
  } catch (err) {
    console.error("Get revision data error:", err);
    res.status(500).json({ message: "Could not load revision questions." });
  }
}

export async function submitRevisionAnswer(req, res) {
  try {
    const { questionId, selectedAnswer } = req.body;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const normUser = String(selectedAnswer ?? "").trim().toLowerCase();
    const normCorrect = String(question.correctAnswer ?? "").trim().toLowerCase();
    const isCorrect = normUser === normCorrect;

    const coinsAwarded = isCorrect ? 10 : 0;
    const xpAwarded = isCorrect ? 5 : 0;

    if (coinsAwarded > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalCoins: coinsAwarded, totalXP: xpAwarded },
      });
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      coinsAwarded,
      xpAwarded,
    });
  } catch (err) {
    console.error("Submit revision answer error:", err);
    res.status(500).json({ message: "Error validating revision answer." });
  }
}

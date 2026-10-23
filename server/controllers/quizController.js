// server/controllers/quizController.js
import QuizSession from "../models/QuizSession.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";
import { SCORING, awardPoints } from "../config/scoring.js";
import { nextDifficulty, startingLevel } from "../utils/adaptiveDifficulty.js";
import { updateStreak } from "../utils/streak.js";
import { checkAchievements } from "../utils/achievements.js";
import { recommend } from "../utils/recommend.js";

// Security: browser NEVER receives correctAnswer before submitting
export const publicView = (q) => ({
  id: q._id,
  question: q.question,
  options: q.options,
  difficulty: q.difficulty,
  topic: q.topic,
  grade: q.grade,
});

async function pickQuestion(session) {
  // Query for question matching topic, grade, and level, excluding already used questions
  let q = await Question.findOne({
    topic: session.topic,
    grade: session.grade,
    difficulty: session.level,
    _id: { $nin: session.usedQuestionIds || [] },
  });

  // If no more questions at this exact level, fall back to any unused question in this topic
  if (!q) {
    q = await Question.findOne({
      topic: session.topic,
      grade: session.grade,
      _id: { $nin: session.usedQuestionIds || [] },
    });
  }

  // If all questions exhausted, allow reuse of any question in this topic
  if (!q) {
    q = await Question.findOne({
      topic: session.topic,
      grade: session.grade,
    });
  }

  return q;
}

export async function startQuiz(req, res) {
  try {
    const { topic, grade = 5 } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const last = await QuizAttempt.findOne({ userId: req.user.id, topic }).sort({ completedAt: -1 });

    const initialLevel = startingLevel(last);

    const session = await QuizSession.create({
      userId: req.user.id,
      topic,
      grade: Number(grade) || 5,
      total: 10,
      level: initialLevel,
      streakCorrect: 0,
      streakWrong: 0,
      answers: [],
      usedQuestionIds: [],
    });

    const q = await pickQuestion(session);
    if (!q) {
      return res.status(404).json({ message: "No questions found for this topic." });
    }

    session.usedQuestionIds.push(q._id);
    await session.save();

    res.json({
      sessionId: session._id,
      question: publicView(q),
      number: 1,
      total: 10,
      level: session.level,
    });
  } catch (err) {
    console.error("Start quiz error:", err);
    res.status(500).json({ message: "Error starting quiz adventure." });
  }
}

export async function submitAnswer(req, res) {
  try {
    const { sessionId, questionId, selected } = req.body;

    const session = await QuizSession.findOne({ _id: sessionId, userId: req.user.id });
    if (!session || session.finished) {
      return res.status(404).json({ message: "No active quiz session found." });
    }

    // Prevent duplicate submission of the same question
    if (session.answers.some((a) => String(a.questionId) === String(questionId))) {
      return res.status(409).json({ message: "Already answered this question." });
    }

    const q = await Question.findById(questionId);
    if (!q) {
      return res.status(404).json({ message: "Question not found." });
    }

    const correct = String(selected).trim() === String(q.correctAnswer).trim();
    const points = correct ? SCORING[q.difficulty] || 10 : 0;

    session.answers.push({
      questionId: q._id,
      selected: String(selected),
      correct,
      difficulty: q.difficulty,
      points,
    });

    // Compute next adaptive difficulty state
    const nextState = nextDifficulty(session, correct);
    session.level = nextState.level;
    session.streakCorrect = nextState.streakCorrect;
    session.streakWrong = nextState.streakWrong;
    session.changed = nextState.changed;

    const isLast = session.answers.length >= session.total;

    let nextQ = null;
    if (!isLast) {
      nextQ = await pickQuestion(session);
      if (nextQ) {
        session.usedQuestionIds.push(nextQ._id);
      }
    }

    await session.save(); // Progress saved after every question

    res.json({
      correct,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      pointsEarned: points,
      nextLevel: session.level,
      levelChanged: session.changed,
      isLast,
      number: session.answers.length + 1,
      nextQuestion: nextQ ? publicView(nextQ) : null,
    });
  } catch (err) {
    console.error("Submit answer error:", err);
    res.status(500).json({ message: "Error submitting answer." });
  }
}

export async function finishQuiz(req, res) {
  try {
    const { sessionId } = req.body;
    const session = await QuizSession.findOne({ _id: sessionId, userId: req.user.id });

    if (!session) {
      return res.status(404).json({ message: "Quiz session not found." });
    }
    if (session.finished) {
      // Return existing attempt if already marked finished
      const existing = await QuizAttempt.findOne({ userId: req.user.id }).sort({ completedAt: -1 });
      return res.json({ attempt: existing, newBadges: [] });
    }

    const total = session.answers.length;
    const correct = session.answers.filter((a) => a.correct).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const pointsEarned = session.answers.reduce((sum, a) => sum + (a.points || 0), 0);
    const progression = session.answers.map((a) => a.difficulty);
    const missed = session.answers.filter((a) => !a.correct).map((a) => a.questionId);

    const attempt = await QuizAttempt.create({
      userId: session.userId,
      topic: session.topic,
      grade: session.grade,
      totalQuestions: total,
      correctAnswers: correct,
      accuracy,
      pointsEarned,
      difficultyReached: progression.length > 0 ? progression[progression.length - 1] : session.level,
      difficultyProgression: progression,
      missedQuestionIds: missed,
      completedAt: new Date(),
    });

    session.finished = true;
    await session.save();

    // Idempotent point award via RewardLedger
    await awardPoints(session.userId, `quiz:${session._id}`, pointsEarned);

    // Update streak in IST
    await updateStreak(session.userId);

    // Check achievement badges
    const newBadges = await checkAchievements(session.userId, { accuracy, total });

    // Recommendation
    const userRecommendation = await recommend(session.userId);

    res.json({
      attempt,
      newBadges,
      recommendation: userRecommendation,
    });
  } catch (err) {
    console.error("Finish quiz error:", err);
    res.status(500).json({ message: "Error calculating quiz results." });
  }
}

// Start a revision quiz from missed questions
export async function startRevisionQuiz(req, res) {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user.id })
      .sort({ completedAt: -1 })
      .limit(5);

    const missedIds = [];
    attempts.forEach((att) => {
      att.missedQuestionIds.forEach((id) => missedIds.push(id));
    });

    const uniqueMissed = [...new Set(missedIds.map(String))];

    let questions = [];
    if (uniqueMissed.length > 0) {
      questions = await Question.find({ _id: { $in: uniqueMissed } }).limit(10);
    }

    if (questions.length === 0) {
      // Pick 5 medium questions as general practice
      questions = await Question.find({ difficulty: "medium" }).limit(5);
    }

    const session = await QuizSession.create({
      userId: req.user.id,
      topic: "Revision Practice",
      grade: 5,
      total: questions.length,
      level: "medium",
      streakCorrect: 0,
      streakWrong: 0,
      answers: [],
      usedQuestionIds: [questions[0]._id],
    });

    res.json({
      sessionId: session._id,
      question: publicView(questions[0]),
      number: 1,
      total: questions.length,
      level: "medium",
    });
  } catch (err) {
    console.error("Revision quiz error:", err);
    res.status(500).json({ message: "Could not create revision quiz." });
  }
}

// Start a daily challenge quiz (5 questions seeded by today's date)
export async function startDailyChallenge(req, res) {
  try {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const count = await Question.countDocuments();
    // Pick 5 questions deterministically based on date string hash
    const hash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const skip = Math.max(0, (hash * 3) % Math.max(1, count - 5));

    const questions = await Question.find().skip(skip).limit(5);

    const session = await QuizSession.create({
      userId: req.user.id,
      topic: `Daily Challenge (${today})`,
      grade: 5,
      total: 5,
      level: "medium",
      streakCorrect: 0,
      streakWrong: 0,
      answers: [],
      usedQuestionIds: [questions[0]._id],
    });

    res.json({
      sessionId: session._id,
      question: publicView(questions[0]),
      number: 1,
      total: 5,
      level: "medium",
    });
  } catch (err) {
    console.error("Daily challenge error:", err);
    res.status(500).json({ message: "Could not start daily challenge." });
  }
}

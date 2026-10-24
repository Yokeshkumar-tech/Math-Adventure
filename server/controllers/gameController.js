// server/controllers/gameController.js
import Mission from "../models/Mission.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import PlayerProgress from "../models/PlayerProgress.js";
import World from "../models/World.js";
import RewardHistory from "../models/RewardHistory.js";
import { checkAchievements } from "../utils/achievements.js";
import crypto from "crypto";

// Active in-memory game sessions cache (can also be saved to DB)
const activeSessions = new Map();

export const publicGameQuestion = (q) => ({
  id: q._id,
  _id: q._id,
  question: q.question,
  questionText: q.question,
  options: q.options || [],
  difficulty: q.difficulty,
  topic: q.topic,
  answerType: q.answerType || (q.options && q.options.length > 0 ? "multiple_choice" : "numerical"),
  points: q.points || 10,
  diagramSvg: q.diagramSvg || null,
  estimatedTimeSeconds: q.estimatedTimeSeconds || 45,
  hint: q.hint || (q.hints && q.hints.clue) || "Take your time and check each step carefully!",
  hints: {
    clue: (q.hints && q.hints.clue) || q.hint || "Look closely at the numbers given in the problem.",
    concept: (q.hints && q.hints.concept) || `Key formula: remember how to apply standard operations for ${q.topic}.`,
    workedExample: (q.hints && q.hints.workedExample) || "Worked example: Solve each operation step-by-step from left to right.",
  },
});

export async function startGame(req, res) {
  try {
    const { missionId } = req.body;
    const mission = await Mission.findById(missionId).populate("questionIds");
    if (!mission) {
      return res.status(404).json({ message: "Mission not found." });
    }

    let questions = mission.questionIds || [];

    // Fallback: if no questions pre-linked, find matching questions for this topic
    if (questions.length === 0) {
      questions = await Question.find({
        $or: [
          { topic: new RegExp(mission.topic, "i") },
          { grade: 5 },
        ],
      }).limit(5);
    }

    const sessionId = `game_${crypto.randomUUID()}`;
    const bossMaxHp = mission.bossData?.maxHp || 100;

    activeSessions.set(sessionId, {
      playerId: req.user.id,
      missionId: mission._id,
      questions,
      currentIndex: 0,
      answers: [],
      bossHp: bossMaxHp,
      playerHp: 100,
      isBoss: mission.isBoss,
      rewardRules: mission.rewardRules || {
        coinsPerCorrect: 20,
        xpPerCorrect: 10,
        bonusCoinsOnComplete: 50,
      },
    });

    const publicQuestions = questions.map(publicGameQuestion);

    res.json({
      sessionId,
      session: { _id: sessionId },
      mission: {
        id: mission._id,
        _id: mission._id,
        title: mission.title,
        story: mission.story,
        objective: mission.objective,
        characterDialogue: mission.characterDialogue,
        topic: mission.topic,
        worldSlug: mission.worldSlug,
        isBoss: mission.isBoss,
        bossData: mission.bossData,
      },
      question: publicQuestions[0],
      questions: publicQuestions,
      number: 1,
      total: questions.length,
      bossHp: bossMaxHp,
      playerHp: 100,
    });
  } catch (err) {
    console.error("Start game error:", err);
    res.status(500).json({ message: "Could not start mission adventure." });
  }
}

export async function getGameSession(req, res) {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);
    if (!session || String(session.playerId) !== String(req.user.id)) {
      return res.status(404).json({ message: "Active game session not found." });
    }
    const currentQ = session.questions[session.currentIndex];
    res.json({
      sessionId,
      session: { _id: sessionId },
      missionId: session.missionId,
      currentIndex: session.currentIndex,
      total: session.questions.length,
      currentQuestion: currentQ ? publicGameQuestion(currentQ) : null,
      bossHp: session.bossHp,
      playerHp: session.playerHp,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching game session." });
  }
}

export async function getGameHint(req, res) {
  try {
    const { questionId, level = 1 } = req.body;
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    let hintText = "";
    if (Number(level) === 1) {
      hintText = question.hints?.clue || question.hint || "Take a closer look at the key values and given units.";
    } else if (Number(level) === 2) {
      hintText = question.hints?.concept || `Concept for ${question.topic}: Remember the key formula or definitions and calculate step by step.`;
    } else if (Number(level) === 3) {
      hintText = question.hints?.workedExample || "Worked example: Try solving with smaller numbers first to see the exact pattern.";
    }

    res.json({
      questionId: question._id,
      level: Number(level),
      hint: hintText,
      topic: question.topic,
    });
  } catch (err) {
    console.error("Hint retrieval error:", err);
    res.status(500).json({ message: "Could not retrieve hint." });
  }
}

export async function submitGameAnswer(req, res) {
  try {
    const { sessionId, questionId, selected, selectedAnswer } = req.body;
    const session = activeSessions.get(sessionId);

    if (!session || String(session.playerId) !== String(req.user.id)) {
      return res.status(404).json({ message: "Active game session not found." });
    }

    const answerVal = selectedAnswer !== undefined ? selectedAnswer : selected;

    // Prevent answering twice
    if (session.answers.some((a) => String(a.questionId) === String(questionId))) {
      return res.status(409).json({ message: "Question already answered." });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Normalized comparison
    const normalizedUser = String(answerVal ?? "").trim().toLowerCase();
    const normalizedCorrect = String(question.correctAnswer ?? "").trim().toLowerCase();
    const correct = normalizedUser === normalizedCorrect;

    const coinsAwarded = correct ? session.rewardRules.coinsPerCorrect || 20 : 0;
    const xpAwarded = correct ? session.rewardRules.xpPerCorrect || 10 : 0;

    // Boss damage calculation
    const hpPerQuestion = Math.ceil(session.bossHp / Math.max(1, session.questions.length - session.answers.length));
    if (correct && session.isBoss) {
      session.bossHp = Math.max(0, session.bossHp - hpPerQuestion);
    } else if (!correct && session.isBoss) {
      session.playerHp = Math.max(20, session.playerHp - 15);
    }

    session.answers.push({
      questionId: question._id,
      selected: answerVal,
      correct,
      coins: coinsAwarded,
      xp: xpAwarded,
    });

    // Award coins and XP in user profile immediately
    if (coinsAwarded > 0 || xpAwarded > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: {
          totalCoins: coinsAwarded,
          totalXP: xpAwarded,
          totalPoints: xpAwarded,
        },
      });

      // Record idempotent transaction in RewardHistory
      try {
        await RewardHistory.create({
          playerId: req.user.id,
          rewardType: "coins",
          amount: coinsAwarded,
          reason: `Correct answer in mission question ${questionId}`,
          uniqueTransactionKey: `q:${sessionId}:${questionId}`,
        });
      } catch {}
    }

    session.currentIndex += 1;
    const isLast = session.currentIndex >= session.questions.length;
    const nextQ = !isLast ? session.questions[session.currentIndex] : null;

    res.json({
      correct,
      isCorrect: correct,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      hint: question.hint || "Review the step-by-step calculation!",
      coinsAwarded,
      coinsEarned: coinsAwarded,
      xpAwarded,
      xpEarned: xpAwarded,
      bossHp: session.bossHp,
      playerHp: session.playerHp,
      bossDamaged: correct && session.isBoss,
      isLast,
      number: session.currentIndex + 1,
      nextQuestion: nextQ ? publicGameQuestion(nextQ) : null,
    });
  } catch (err) {
    console.error("Submit game answer error:", err);
    res.status(500).json({ message: "Error validating game answer." });
  }
}

export async function completeGame(req, res) {
  try {
    const { sessionId, missionId } = req.body;
    const session = activeSessions.get(sessionId);

    if (!session || String(session.playerId) !== String(req.user.id)) {
      return res.status(404).json({ message: "Active game session not found." });
    }

    const targetMissionId = missionId || session.missionId;
    const mission = await Mission.findById(targetMissionId);
    if (!mission) {
      return res.status(404).json({ message: "Mission not found." });
    }

    const total = session.answers.length;
    const correctCount = session.answers.filter((a) => a.correct).length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Stars calculation: >=80% = 3 stars, 60-79% = 2 stars, <60% = 1 star
    let starsEarned = 1;
    if (accuracy >= 80) starsEarned = 3;
    else if (accuracy >= 60) starsEarned = 2;

    const bonusCoins = session.rewardRules.bonusCoinsOnComplete || 50;

    // Award completion bonus coins & XP
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalCoins: bonusCoins,
        totalXP: 50,
        totalPoints: 50,
      },
    });

    // Save or update PlayerProgress
    const existingProgress = await PlayerProgress.findOne({
      playerId: req.user.id,
      missionId: mission._id,
    });

    let newStarsAwarded = starsEarned;
    if (existingProgress) {
      const prevStars = existingProgress.starsEarned || 0;
      newStarsAwarded = Math.max(0, starsEarned - prevStars);

      existingProgress.completed = true;
      existingProgress.bestScore = Math.max(existingProgress.bestScore || 0, correctCount);
      existingProgress.starsEarned = Math.max(existingProgress.starsEarned || 0, starsEarned);
      existingProgress.attempts = (existingProgress.attempts || 1) + 1;
      existingProgress.completedAt = new Date();
      await existingProgress.save();
    } else {
      await PlayerProgress.create({
        playerId: req.user.id,
        missionId: mission._id,
        completed: true,
        bestScore: correctCount,
        totalQuestions: total,
        starsEarned,
        attempts: 1,
        completedAt: new Date(),
      });
    }

    // Add newly earned stars to User profile
    if (newStarsAwarded > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalStars: newStarsAwarded },
      });
    }

    // Check if Boss was defeated: unlock next world!
    let unlockedNextWorld = null;
    if (mission.isBoss) {
      const allWorlds = await World.find().sort({ order: 1 });
      const currentWorld = await World.findOne({ slug: mission.worldSlug });
      if (currentWorld) {
        const nextWorld = allWorlds.find((w) => w.order === currentWorld.order + 1);
        if (nextWorld) {
          await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { unlockedWorlds: nextWorld.slug },
          });
          unlockedNextWorld = nextWorld.slug;
        }
      }
    }

    // Calculate coin and XP totals from questions
    const totalCoinsFromQuestions = session.answers.reduce((acc, a) => acc + (a.coins || 0), 0);
    const totalXpFromQuestions = session.answers.reduce((acc, a) => acc + (a.xp || 0), 0);

    // Remove active session
    activeSessions.delete(sessionId);

    // Refresh user & check achievements
    const updatedUser = await User.findById(req.user.id);
    const newBadges = await checkAchievements(req.user.id, { accuracy, total });

    res.json({
      missionId: mission._id,
      starsEarned,
      accuracy,
      correctCount,
      totalCount: total,
      bonusCoins,
      totalCoinsEarned: totalCoinsFromQuestions + bonusCoins,
      totalXpEarned: totalXpFromQuestions + 50,
      totalCoins: updatedUser.totalCoins,
      totalStars: updatedUser.totalStars,
      totalXP: updatedUser.totalXP,
      unlockedNextWorld,
      nextWorldUnlocked: unlockedNextWorld,
      newBadges,
      unlockedBadge: newBadges && newBadges.length > 0 ? newBadges[0].name : null,
    });
  } catch (err) {
    console.error("Complete game error:", err);
    res.status(500).json({ message: "Error recording mission completion." });
  }
}

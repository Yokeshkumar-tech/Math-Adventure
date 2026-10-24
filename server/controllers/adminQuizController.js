// server/controllers/adminQuizController.js
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";

export async function listQuizzes(req, res) {
  try {
    const { topic, status, search } = req.query;
    const filter = {};
    if (topic && topic !== "all") filter.topic = topic;
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate("questionIds", "question difficulty points topic")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: "Failed to list quizzes." });
  }
}

export async function createQuiz(req, res) {
  try {
    const {
      title,
      description,
      realm = "Number Forest",
      mission = "",
      topic,
      grade = 5,
      difficulty = "medium",
      questionIds = [],
      durationMinutes = 15,
      passThresholdPercent = 60,
      randomizeOrder = true,
      randomizeOptions = false,
      hintsAllowed = true,
      rewardRules = {},
      status = "published",
    } = req.body;

    if (!title || !topic) {
      return res.status(400).json({ message: "Quiz title and topic are required." });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      description,
      realm,
      mission,
      topic: topic.trim(),
      grade: Number(grade) || 5,
      difficulty,
      questionIds,
      durationMinutes: Number(durationMinutes) || 15,
      passThresholdPercent: Number(passThresholdPercent) || 60,
      randomizeOrder,
      randomizeOptions,
      hintsAllowed,
      rewardRules: {
        xpOnPass: Number(rewardRules.xpOnPass) || 50,
        coinsOnPass: Number(rewardRules.coinsOnPass) || 25,
        starsOnMastery: Number(rewardRules.starsOnMastery) || 3,
      },
      status,
      createdBy: req.admin._id,
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_QUIZ",
      resourceType: "quiz",
      resourceId: quiz._id,
      changeSummary: `Created quiz "${quiz.title}" with ${questionIds.length} assigned questions`,
      req,
    });

    res.status(201).json({ quiz, message: "Quiz created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create quiz." });
  }
}

export async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questionIds");
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve quiz." });
  }
}

export async function updateQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    Object.assign(quiz, req.body);
    quiz.updatedBy = req.admin._id;
    await quiz.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_QUIZ",
      resourceType: "quiz",
      resourceId: quiz._id,
      changeSummary: `Updated quiz "${quiz.title}"`,
      req,
    });

    res.json({ quiz, message: "Quiz updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update quiz." });
  }
}

export async function deleteQuiz(req, res) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    await createAuditRecord({
      actor: req.admin,
      action: "DELETE_QUIZ",
      resourceType: "quiz",
      resourceId: req.params.id,
      changeSummary: `Deleted quiz "${quiz.title}"`,
      req,
    });

    res.json({ message: "Quiz deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete quiz." });
  }
}

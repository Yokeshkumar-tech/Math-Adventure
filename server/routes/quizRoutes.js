// server/routes/quizRoutes.js
import express from "express";
import {
  startQuiz,
  submitAnswer,
  finishQuiz,
  startRevisionQuiz,
  startDailyChallenge,
} from "../controllers/quizController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", requireAuth, startQuiz);
router.post("/submit", requireAuth, submitAnswer);
router.post("/finish", requireAuth, finishQuiz);
router.post("/revision", requireAuth, startRevisionQuiz);
router.post("/daily-challenge", requireAuth, startDailyChallenge);

export default router;

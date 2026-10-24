// server/routes/challengeRoutes.js
import express from "express";
import {
  getDailyChallenge,
  submitDailyChallenge,
  getRevisionData,
  submitRevisionAnswer,
} from "../controllers/challengeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/challenges/daily", requireAuth, getDailyChallenge);
router.post("/challenges/daily/submit", requireAuth, submitDailyChallenge);
router.get("/revision", requireAuth, getRevisionData);
router.post("/revision/answer", requireAuth, submitRevisionAnswer);

export default router;

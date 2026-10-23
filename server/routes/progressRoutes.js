// server/routes/progressRoutes.js
import express from "express";
import {
  getProgress,
  getAchievements,
  getLeaderboard,
  getRecommendations,
  getTeacherOverview,
} from "../controllers/progressController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/progress", requireAuth, getProgress);
router.get("/achievements", requireAuth, getAchievements);
router.get("/leaderboard", requireAuth, getLeaderboard);
router.get("/recommendations", requireAuth, getRecommendations);
router.get("/teacher/students", requireAuth, requireRole("teacher", "admin"), getTeacherOverview);

export default router;

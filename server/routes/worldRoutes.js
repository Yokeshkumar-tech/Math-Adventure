// server/routes/worldRoutes.js
import express from "express";
import {
  getAllWorlds,
  getWorldMissions,
  getMissionById,
} from "../controllers/worldController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/worlds", requireAuth, getAllWorlds);
router.get("/worlds/:worldSlug", requireAuth, getWorldMissions);
router.get("/missions/:missionId", requireAuth, getMissionById);

export default router;

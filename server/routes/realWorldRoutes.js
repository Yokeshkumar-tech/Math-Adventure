// server/routes/realWorldRoutes.js
import express from "express";
import {
  getRealWorldLocations,
  submitRealWorldMission,
} from "../controllers/realWorldController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/real-world/locations", optionalAuth, getRealWorldLocations);
router.post("/real-world/submit", optionalAuth, submitRealWorldMission);

export default router;

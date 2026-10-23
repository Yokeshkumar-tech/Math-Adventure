// server/routes/aiRoutes.js
import express from "express";
import { generateExplanation, summarizeLesson, tutorChat } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/explanation", requireAuth, generateExplanation);
router.post("/summary", requireAuth, summarizeLesson);
router.post("/tutor", requireAuth, tutorChat);

export default router;

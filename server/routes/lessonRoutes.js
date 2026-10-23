// server/routes/lessonRoutes.js
import express from "express";
import { getTopicsForGrade, getLessonById, completeLesson } from "../controllers/lessonController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/grades/:grade/topics", requireAuth, getTopicsForGrade);
router.get("/lessons/:id", requireAuth, getLessonById);
router.post("/lessons/:id/complete", requireAuth, completeLesson);

export default router;

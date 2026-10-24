// server/routes/gameRoutes.js
import express from "express";
import {
  startGame,
  getGameSession,
  getGameHint,
  submitGameAnswer,
  completeGame,
} from "../controllers/gameController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/game/start", requireAuth, startGame);
router.get("/game/session/:sessionId", requireAuth, getGameSession);
router.post("/game/hint", requireAuth, getGameHint);
router.post("/game/answer", requireAuth, submitGameAnswer);
router.post("/game/complete", requireAuth, completeGame);

export default router;

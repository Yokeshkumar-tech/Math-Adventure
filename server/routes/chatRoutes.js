// server/routes/chatRoutes.js
import express from "express";
import {
  handleChatMessage,
  getConversations,
  createConversation,
  getConversation,
  renameConversation,
  deleteConversation,
  submitFeedback,
  generateQuiz,
  verifyMath,
} from "../controllers/chatController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Real-time AI Chatbot endpoints
router.post("/chat", optionalAuth, handleChatMessage);
router.post("/chat/feedback", optionalAuth, submitFeedback);

// Conversation management
router.get("/conversations", optionalAuth, getConversations);
router.post("/conversations", optionalAuth, createConversation);
router.get("/conversations/:id", optionalAuth, getConversation);
router.patch("/conversations/:id", optionalAuth, renameConversation);
router.delete("/conversations/:id", optionalAuth, deleteConversation);

// Educational & Verification tools
router.post("/quiz/generate", optionalAuth, generateQuiz);
router.post("/math/verify", optionalAuth, verifyMath);

export default router;

// server/routes/authRoutes.js
import express from "express";
import { register, login, guestLogin, getMe, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/guest", guestLogin);
router.get("/me", requireAuth, getMe);
router.patch("/users/me", requireAuth, updateProfile);

export default router;

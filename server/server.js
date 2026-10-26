// server/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import dns from "node:dns";

if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (_) {}
}

import http from "http";
import authRoutes from "./routes/authRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import worldRoutes from "./routes/worldRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import realWorldRoutes from "./routes/realWorldRoutes.js";
import { getActiveAnnouncements } from "./controllers/adminAnnouncementController.js";
import { setupMultiplayerSocket } from "./multiplayer/socketHandler.js";
import { initSocketService } from "./services/socketService.js";

const app = express();
const httpServer = http.createServer(app);
const io = setupMultiplayerSocket(httpServer);
initSocketService(io);

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));

// Rate limit AI endpoints to protect from abuse and cost overruns
app.use(
  "/api/ai",
  rateLimit({
    windowMs: 60_000,
    max: 30,
    message: { message: "The tutor is resting. Here is a saved explanation." },
  })
);

// Root endpoint for status & monitoring
app.get("/", (req, res) => {
  res.json({
    name: "Math Adventure API",
    status: "online",
    environment: process.env.NODE_ENV || "development",
    health: "/api/health",
  });
});

// Health check endpoint for Render & monitoring
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api", lessonRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api", progressRoutes);
app.use("/api", worldRoutes);
app.use("/api", gameRoutes);
app.use("/api", shopRoutes);
app.use("/api", challengeRoutes);
app.use("/api", chatRoutes);
app.use("/api", realWorldRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/announcements/active", getActiveAnnouncements);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Your progress is safe.",
  });
});

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";

// Graceful port and network error handling
httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use. Stop the existing backend process or configure another port.\n`);
    process.exit(1);
  } else {
    console.error("Server startup error:", err.message);
    process.exit(1);
  }
});

// Connect to MongoDB and start listening
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const sanitizedUri = MONGODB_URI.replace(/:([^@]+)@/, ":****@");
      console.log(`Connected to MongoDB: ${sanitizedUri}`);
      httpServer.listen(PORT, () => {
        console.log(`Math Adventure API & Multiplayer Socket running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
}

export default app;

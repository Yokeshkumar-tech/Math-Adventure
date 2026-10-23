// server/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/authRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
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

// Health check endpoint for Render & monitoring
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api", lessonRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api", progressRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong. Your progress is safe.",
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";

// Connect to MongoDB and start listening
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log(`Connected to MongoDB: ${MONGODB_URI}`);
      app.listen(PORT, () => {
        console.log(`Math Adventure API running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

export default app;

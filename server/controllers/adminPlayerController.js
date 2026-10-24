// server/controllers/adminPlayerController.js
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import PlayerProgress from "../models/PlayerProgress.js";
import StudentAchievement from "../models/StudentAchievement.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";

export async function listPlayers(req, res) {
  try {
    const {
      page = 1,
      limit = 15,
      search = "",
      grade,
      status,
      sortBy = "totalXP",
      sortOrder = "desc",
    } = req.query;

    const query = { role: "student" };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { username: { $regex: search.trim(), $options: "i" } },
        { nickname: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (grade && grade !== "all") {
      query.grade = Number(grade);
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [players, total] = await Promise.all([
      User.find(query).select("-passwordHash").sort(sortObj).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    res.json({
      players,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("List players error:", err);
    res.status(500).json({ message: "Failed to list players." });
  }
}

export async function getPlayerById(req, res) {
  try {
    const player = await User.findOne({ _id: req.params.id, role: "student" }).select("-passwordHash");
    if (!player) {
      return res.status(404).json({ message: "Player account not found." });
    }

    const [attempts, progress, achievements] = await Promise.all([
      QuizAttempt.find({ userId: player._id }).sort({ completedAt: -1 }).limit(20).lean(),
      PlayerProgress.find({ playerId: player._id }).populate("missionId", "title worldSlug").lean(),
      StudentAchievement.find({ userId: player._id }).populate("achievementId").lean(),
    ]);

    res.json({
      player,
      attempts,
      progress,
      achievements,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load player profile." });
  }
}

export async function updatePlayerStatus(req, res) {
  try {
    const { status, reason = "" } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'active' or 'suspended'." });
    }

    const player = await User.findOne({ _id: req.params.id, role: "student" });
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }

    player.status = status;
    player.suspendedReason = status === "suspended" ? reason : "";
    await player.save();

    await createAuditRecord({
      actor: req.admin,
      action: status === "suspended" ? "SUSPEND_PLAYER" : "ACTIVATE_PLAYER",
      resourceType: "player",
      resourceId: player._id,
      changeSummary: `${status === "suspended" ? "Suspended" : "Reactivated"} player account '${player.username}'`,
      reason,
      req,
    });

    res.json({ player, message: `Player status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update player status." });
  }
}

export async function resetPlayerProgress(req, res) {
  try {
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ message: "A documented reason is required to reset player progress." });
    }

    const player = await User.findOne({ _id: req.params.id, role: "student" });
    if (!player) {
      return res.status(404).json({ message: "Player not found." });
    }

    // Reset statistics
    player.totalCoins = 100;
    player.totalStars = 0;
    player.totalXP = 0;
    player.totalPoints = 0;
    player.currentLevel = 1;
    player.currentStreak = 0;
    player.unlockedWorlds = ["number-forest"];
    player.completedLessons = [];
    await player.save();

    // Clear attempts and mission completions
    await Promise.all([
      QuizAttempt.deleteMany({ userId: player._id }),
      PlayerProgress.deleteMany({ playerId: player._id }),
    ]);

    await createAuditRecord({
      actor: req.admin,
      action: "RESET_PROGRESS",
      resourceType: "player",
      resourceId: player._id,
      changeSummary: `Reset all progress and currency for player '${player.username}'`,
      reason,
      req,
    });

    res.json({ message: "Player progress reset successfully.", player });
  } catch (err) {
    console.error("Reset progress error:", err);
    res.status(500).json({ message: "Failed to reset player progress." });
  }
}

// server/controllers/adminPlayerController.js
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import PlayerProgress from "../models/PlayerProgress.js";
import StudentAchievement from "../models/StudentAchievement.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";
import { isUserOnline, getOnlinePlayersList } from "../services/socketService.js";

export async function listPlayers(req, res) {
  try {
    const {
      page = 1,
      limit = 15,
      search = "",
      grade,
      status,
      online,
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

    const [rawPlayers, total] = await Promise.all([
      User.find(query).select("-passwordHash").sort(sortObj).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    // Gather aggregated quiz and mission stats for these players
    const playerIds = rawPlayers.map((p) => p._id);

    const [attemptStats, missionCounts, badgeCounts] = await Promise.all([
      QuizAttempt.aggregate([
        { $match: { userId: { $in: playerIds } } },
        {
          $group: {
            _id: "$userId",
            totalAttempts: { $sum: 1 },
            totalQuestions: { $sum: "$totalQuestions" },
            correctAnswers: { $sum: "$correctAnswers" },
            avgAccuracy: { $avg: "$accuracy" },
            lastAttemptTime: { $max: "$completedAt" },
          },
        },
      ]),
      PlayerProgress.aggregate([
        { $match: { playerId: { $in: playerIds }, status: "completed" } },
        { $group: { _id: "$playerId", completedCount: { $sum: 1 } } },
      ]),
      StudentAchievement.aggregate([
        { $match: { userId: { $in: playerIds } } },
        { $group: { _id: "$userId", badgeCount: { $sum: 1 } } },
      ]),
    ]);

    const statsMap = new Map(attemptStats.map((s) => [String(s._id), s]));
    const missionMap = new Map(missionCounts.map((m) => [String(m._id), m.completedCount]));
    const badgeMap = new Map(badgeCounts.map((b) => [String(b._id), b.badgeCount]));
    const onlineMap = new Map(getOnlinePlayersList().map((o) => [String(o.userId), o]));

    const enrichedPlayers = rawPlayers.map((p) => {
      const pId = String(p._id);
      const st = statsMap.get(pId);
      const isOnline = isUserOnline(p._id);
      const liveInfo = onlineMap.get(pId);

      const totalQ = st?.totalQuestions || 0;
      const correctA = st?.correctAnswers || 0;
      const incorrectA = Math.max(0, totalQ - correctA);
      const accuracy = st?.avgAccuracy ? Math.round(st.avgAccuracy) : 0;

      // Current Realm & Mission
      const lastRealmSlug = p.unlockedWorlds && p.unlockedWorlds.length > 0
        ? p.unlockedWorlds[p.unlockedWorlds.length - 1]
        : "number-forest";
      const realmName = lastRealmSlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        ...p,
        isOnline,
        currentActivity: liveInfo?.currentActivity || (isOnline ? "Exploring" : "Offline"),
        currentRealm: liveInfo?.realm || realmName,
        currentMission: liveInfo?.mission || "Mission 1",
        questionsAttempted: totalQ,
        correctAnswers: correctA,
        incorrectAnswers: incorrectA,
        quizAccuracy: accuracy,
        completedMissions: missionMap.get(pId) || 0,
        badgesCount: badgeMap.get(pId) || 0,
        lastActiveTime: liveInfo ? "Active now" : (st?.lastAttemptTime || p.updatedAt || p.createdAt),
      };
    });

    // If online filter was requested
    const filteredByOnline = online === "true"
      ? enrichedPlayers.filter((p) => p.isOnline)
      : enrichedPlayers;

    res.json({
      success: true,
      players: filteredByOnline,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("List players error:", err);
    res.status(500).json({ success: false, message: "Failed to list players." });
  }
}

export async function getPlayerById(req, res) {
  try {
    const player = await User.findOne({ _id: req.params.id, role: "student" }).select("-passwordHash");
    if (!player) {
      return res.status(404).json({ success: false, message: "Player account not found." });
    }

    const [attempts, progress, achievements] = await Promise.all([
      QuizAttempt.find({ userId: player._id }).sort({ completedAt: -1 }).limit(20).lean(),
      PlayerProgress.find({ playerId: player._id }).populate("missionId", "title worldSlug").lean(),
      StudentAchievement.find({ userId: player._id }).populate("achievementId").lean(),
    ]);

    const isOnline = isUserOnline(player._id);

    res.json({
      success: true,
      player: {
        ...player.toObject(),
        isOnline,
      },
      attempts,
      progress,
      achievements,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load player profile." });
  }
}

export async function updatePlayerStatus(req, res) {
  try {
    const { status, reason = "" } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'suspended'." });
    }

    const player = await User.findOne({ _id: req.params.id, role: "student" });
    if (!player) {
      return res.status(404).json({ success: false, message: "Player not found." });
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

    res.json({ success: true, player, message: `Player status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update player status." });
  }
}

export async function resetPlayerProgress(req, res) {
  try {
    const { reason } = req.body;
    if (!reason || String(reason).trim().length < 5) {
      return res.status(400).json({ success: false, message: "A documented reason is required to reset player progress." });
    }

    const player = await User.findOne({ _id: req.params.id, role: "student" });
    if (!player) {
      return res.status(404).json({ success: false, message: "Player not found." });
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

    res.json({ success: true, message: "Player progress reset successfully.", player });
  } catch (err) {
    console.error("Reset progress error:", err);
    res.status(500).json({ success: false, message: "Failed to reset player progress." });
  }
}

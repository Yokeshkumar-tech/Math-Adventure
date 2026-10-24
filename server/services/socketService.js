// server/services/socketService.js
import ActivityEvent from "../models/ActivityEvent.js";

let ioInstance = null;

// Map of userId -> { socketId, userId, name, username, grade, avatar, realm, mission, currentActivity, lastSeen }
const onlinePlayers = new Map();

// Map of socketId -> userId
const socketToUser = new Map();

/**
 * Initialize Socket.IO real-time event listener and presence manager
 */
export function initSocketService(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    // 1. Admin joins admin room for live monitoring
    socket.on("admin:join", () => {
      socket.join("admin_room");
      // Send current live online players immediately
      socket.emit("presence:sync", Array.from(onlinePlayers.values()));
    });

    // 2. Student presence heartbeat
    socket.on("student:presence", (data) => {
      if (!data || !data.userId) return;

      const userId = String(data.userId);
      const playerRecord = {
        userId,
        socketId: socket.id,
        name: data.name || "Adventurer",
        username: data.username || "student",
        grade: data.grade || 5,
        avatar: data.avatar || "knight",
        realm: data.realm || "Number Forest",
        mission: data.mission || "M1: Addition Trail",
        currentActivity: data.currentActivity || "Exploring",
        lastSeen: Date.now(),
      };

      onlinePlayers.set(userId, playerRecord);
      socketToUser.set(socket.id, userId);

      // Notify admins of presence update
      io.to("admin_room").emit("player:presence", {
        type: "online",
        player: playerRecord,
        onlineCount: onlinePlayers.size,
      });
    });

    // 3. Disconnect cleanup
    socket.on("disconnect", () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const player = onlinePlayers.get(userId);
        onlinePlayers.delete(userId);
        socketToUser.delete(socket.id);

        io.to("admin_room").emit("player:presence", {
          type: "offline",
          userId,
          name: player?.name,
          onlineCount: onlinePlayers.size,
        });
      }
    });
  });

  // Expiring presence heartbeat check (every 30 seconds)
  setInterval(() => {
    const now = Date.now();
    for (const [userId, record] of onlinePlayers.entries()) {
      if (now - record.lastSeen > 60000) { // 60s timeout
        onlinePlayers.delete(userId);
        socketToUser.delete(record.socketId);
        io.to("admin_room").emit("player:presence", {
          type: "offline",
          userId,
          name: record.name,
          onlineCount: onlinePlayers.size,
        });
      }
    }
  }, 30000);

  return io;
}

/**
 * Get Socket.IO instance
 */
export function getSocketIO() {
  return ioInstance;
}

/**
 * Get count of currently online players
 */
export function getOnlineCount() {
  return onlinePlayers.size;
}

/**
 * Get list of currently online players
 */
export function getOnlinePlayersList() {
  return Array.from(onlinePlayers.values());
}

/**
 * Check if a specific user is currently online
 */
export function isUserOnline(userId) {
  return onlinePlayers.has(String(userId));
}

/**
 * Broadcast game activity event to admin dashboard and persist to MongoDB
 */
export async function broadcastActivity({
  eventType = "quiz_complete",
  category = "quiz",
  playerId = null,
  playerName = "Adventurer",
  playerAvatar = "knight",
  title = "Activity completed",
  description = "",
  topic = "",
  score = 0,
  xpGained = 0,
  coinsGained = 0,
  activityId = "",
  metadata = {},
}) {
  try {
    // 1. Persist to MongoDB ActivityEvent collection
    const eventDoc = await ActivityEvent.create({
      eventType,
      category,
      playerId,
      playerName,
      playerAvatar,
      title,
      description,
      topic,
      score,
      xpGained,
      coinsGained,
      activityId,
      metadata,
    });

    const payload = {
      _id: eventDoc._id,
      eventType: eventDoc.eventType,
      category: eventDoc.category,
      playerId: eventDoc.playerId,
      playerName: eventDoc.playerName,
      playerAvatar: eventDoc.playerAvatar,
      title: eventDoc.title,
      description: eventDoc.description,
      topic: eventDoc.topic,
      score: eventDoc.score,
      xpGained: eventDoc.xpGained,
      coinsGained: eventDoc.coinsGained,
      activityId: eventDoc.activityId,
      metadata: eventDoc.metadata,
      createdAt: eventDoc.createdAt,
    };

    // 2. Broadcast via Socket.IO to admin room
    if (ioInstance) {
      ioInstance.to("admin_room").emit("player:activity", payload);

      // Emit specific event for listeners looking for a particular action
      const specificEventName = mapToSpecificEvent(eventType);
      if (specificEventName) {
        ioInstance.to("admin_room").emit(specificEventName, payload);
      }
    }

    return eventDoc;
  } catch (err) {
    console.warn("Failed to broadcast or record activity event:", err.message);
    return null;
  }
}

/**
 * Map eventType to standard socket event names
 */
function mapToSpecificEvent(eventType) {
  switch (eventType) {
    case "login":
      return "player:login";
    case "quiz_start":
      return "quiz:started";
    case "quiz_complete":
      return "quiz:completed";
    case "answer_submit":
      return "quiz:answerSubmitted";
    case "mission_start":
      return "mission:started";
    case "mission_complete":
      return "mission:completed";
    case "reward_earned":
      return "reward:earned";
    case "tutor_query":
      return "tutor:requestCompleted";
    case "admin_publish":
      return "question:published";
    default:
      return null;
  }
}

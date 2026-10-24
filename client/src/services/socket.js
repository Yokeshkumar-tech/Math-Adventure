// client/src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : "http://localhost:5000";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

/**
 * Join admin room and listen to real-time events
 */
export function subscribeAdminSocket(onEvent) {
  const socket = getSocket();
  socket.emit("admin:join");

  const onActivity = (data) => onEvent && onEvent("activity", data);
  const onPresence = (data) => onEvent && onEvent("presence", data);
  const onPresenceSync = (data) => onEvent && onEvent("presence:sync", data);

  socket.on("player:activity", onActivity);
  socket.on("player:presence", onPresence);
  socket.on("presence:sync", onPresenceSync);

  return () => {
    socket.off("player:activity", onActivity);
    socket.off("player:presence", onPresence);
    socket.off("presence:sync", onPresenceSync);
  };
}

/**
 * Send student presence heartbeat to server
 */
export function sendStudentPresence(userData, currentActivity = "Exploring", realm = "Number Forest", mission = "Mission 1") {
  const socket = getSocket();
  if (userData && (userData.id || userData._id)) {
    socket.emit("student:presence", {
      userId: userData.id || userData._id,
      name: userData.nickname || userData.name,
      username: userData.username,
      grade: userData.grade || 5,
      avatar: userData.avatar || "knight",
      realm,
      mission,
      currentActivity,
    });
  }
}

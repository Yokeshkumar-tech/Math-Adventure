// server/multiplayer/socketHandler.js
import { Server } from "socket.io";
import Question from "../models/Question.js";
import User from "../models/User.js";
import RewardHistory from "../models/RewardHistory.js";

// Active multiplayer rooms stored in-memory
// roomCode -> { code, hostId, status: 'waiting'|'countdown'|'in_round'|'round_summary'|'finished', participants: Map, questions: [], currentRound: 0, totalRounds: 5, roundTimer: null, roundTimeLeft: 15 }
const rooms = new Map();

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "MATH-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function setupMultiplayerSocket(httpServer, allowedOrigins = []) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    let currentRoomCode = null;
    let currentUser = null;

    // 1. Create a room
    socket.on("create_room", async ({ user, topic = "Mixed Math", totalRounds = 5 }) => {
      try {
        const roomCode = generateRoomCode();
        currentRoomCode = roomCode;
        currentUser = {
          id: user?._id || user?.id || socket.id,
          name: user?.name || user?.nickname || "Adventurer",
          avatar: user?.selectedCharacter?.id || "knight",
          costume: user?.selectedCharacter?.costume || "default",
          accessory: user?.selectedCharacter?.accessory || "none",
          pet: user?.selectedCharacter?.pet || null,
          level: user?.currentLevel || 1,
          socketId: socket.id,
          isHost: true,
          isReady: true,
          score: 0,
          correctAnswers: 0,
          currentRoundAnswered: false,
          streak: 0,
        };

        // Fetch questions from DB
        let questions = await Question.find({
          $or: [{ grade: { $in: [5, 6] } }],
        }).limit(30);

        // Shuffle questions
        questions = questions.sort(() => 0.5 - Math.random()).slice(0, Math.min(totalRounds, 5));

        // Format questions without leaking correctAnswer to client
        const safeQuestions = questions.map((q) => ({
          id: String(q._id),
          question: q.question,
          options: q.options || [],
          topic: q.topic,
          hint: q.hint || "Think step by step!",
          explanation: q.explanation,
          _rawCorrectAnswer: q.correctAnswer, // kept server-side
        }));

        rooms.set(roomCode, {
          code: roomCode,
          hostId: currentUser.id,
          topic,
          status: "waiting",
          participants: new Map([[socket.id, currentUser]]),
          questions: safeQuestions,
          currentRound: 0,
          totalRounds: safeQuestions.length || 5,
          roundTimeLimit: 15,
          roundTimeLeft: 15,
          roundTimer: null,
          roundStartTime: 0,
        });

        socket.join(roomCode);

        socket.emit("room_created", {
          roomCode,
          room: getPublicRoomState(roomCode),
          you: currentUser,
        });
      } catch (err) {
        console.error("Create room error:", err);
        socket.emit("error_message", { message: "Could not create multiplayer room." });
      }
    });

    // 2. Join room
    socket.on("join_room", ({ roomCode, user }) => {
      try {
        const code = String(roomCode || "").toUpperCase().trim();
        const room = rooms.get(code);

        if (!room) {
          return socket.emit("error_message", { message: "Room not found. Check the code and try again." });
        }

        if (room.status !== "waiting") {
          return socket.emit("error_message", { message: "Match is already in progress or completed." });
        }

        if (room.participants.size >= 8) {
          return socket.emit("error_message", { message: "Room is full (max 8 players)." });
        }

        currentRoomCode = code;
        currentUser = {
          id: user?._id || user?.id || socket.id,
          name: user?.name || user?.nickname || `Adventurer_${Math.floor(Math.random() * 900 + 100)}`,
          avatar: user?.selectedCharacter?.id || "archer",
          costume: user?.selectedCharacter?.costume || "default",
          accessory: user?.selectedCharacter?.accessory || "none",
          pet: user?.selectedCharacter?.pet || null,
          level: user?.currentLevel || 1,
          socketId: socket.id,
          isHost: false,
          isReady: false,
          score: 0,
          correctAnswers: 0,
          currentRoundAnswered: false,
          streak: 0,
        };

        room.participants.set(socket.id, currentUser);
        socket.join(code);

        socket.emit("room_joined", {
          roomCode: code,
          room: getPublicRoomState(code),
          you: currentUser,
        });

        io.to(code).emit("participant_update", {
          participants: Array.from(room.participants.values()),
        });
      } catch (err) {
        console.error("Join room error:", err);
        socket.emit("error_message", { message: "Could not join room." });
      }
    });

    // 3. Toggle ready
    socket.on("toggle_ready", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || !currentUser) return;

      currentUser.isReady = !currentUser.isReady;
      room.participants.set(socket.id, currentUser);

      io.to(currentRoomCode).emit("participant_update", {
        participants: Array.from(room.participants.values()),
      });
    });

    // 4. Host starts match
    socket.on("start_match", () => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.hostId !== currentUser?.id) return;

      room.status = "countdown";
      let count = 3;

      io.to(currentRoomCode).emit("match_countdown", { countdown: count });

      const countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
          io.to(currentRoomCode).emit("match_countdown", { countdown: count });
        } else {
          clearInterval(countdownTimer);
          startRound(currentRoomCode);
        }
      }, 1000);
    });

    // 5. Submit round answer
    socket.on("submit_answer", ({ answer }) => {
      if (!currentRoomCode) return;
      const room = rooms.get(currentRoomCode);
      if (!room || room.status !== "in_round") return;

      const participant = room.participants.get(socket.id);
      if (!participant || participant.currentRoundAnswered) return;

      participant.currentRoundAnswered = true;

      const currentQ = room.questions[room.currentRound];
      const timeSpent = (Date.now() - room.roundStartTime) / 1000;
      const normalizedUser = String(answer ?? "").trim().toLowerCase();
      const normalizedCorrect = String(currentQ._rawCorrectAnswer ?? "").trim().toLowerCase();
      const isCorrect = normalizedUser === normalizedCorrect;

      let pointsEarned = 0;
      if (isCorrect) {
        // Base 100 points + time bonus up to 50 points + streak bonus
        const timeBonus = Math.max(0, Math.round((15 - timeSpent) * 3.3));
        const streakBonus = Math.min(participant.streak * 10, 50);
        pointsEarned = 100 + timeBonus + streakBonus;
        participant.streak += 1;
        participant.correctAnswers += 1;
      } else {
        participant.streak = 0;
      }

      participant.score += pointsEarned;
      participant.lastAnswerCorrect = isCorrect;
      participant.lastPointsEarned = pointsEarned;
      participant.lastAnswerTime = timeSpent.toFixed(1);

      socket.emit("answer_feedback", {
        isCorrect,
        correctAnswer: currentQ._rawCorrectAnswer,
        explanation: currentQ.explanation,
        pointsEarned,
        totalScore: participant.score,
        streak: participant.streak,
      });

      io.to(currentRoomCode).emit("live_scores", {
        participants: Array.from(room.participants.values()).sort((a, b) => b.score - a.score),
      });

      // Check if everyone has answered
      const allAnswered = Array.from(room.participants.values()).every((p) => p.currentRoundAnswered);
      if (allAnswered) {
        clearInterval(room.roundTimer);
        endRound(currentRoomCode);
      }
    });

    // 6. Cheer emoji reaction
    socket.on("send_cheer", ({ emoji }) => {
      if (!currentRoomCode) return;
      io.to(currentRoomCode).emit("player_cheer", {
        senderId: currentUser?.id,
        senderName: currentUser?.name,
        emoji: emoji || "👏",
      });
    });

    // 7. Disconnect or leave
    socket.on("disconnect", () => {
      handlePlayerLeave(socket, currentRoomCode);
    });

    socket.on("leave_room", () => {
      handlePlayerLeave(socket, currentRoomCode);
      currentRoomCode = null;
    });
  });

  function startRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    if (room.currentRound >= room.totalRounds) {
      return finishMatch(roomCode);
    }

    room.status = "in_round";
    room.roundTimeLeft = room.roundTimeLimit;
    room.roundStartTime = Date.now();

    // Reset round answer states
    for (const p of room.participants.values()) {
      p.currentRoundAnswered = false;
      p.lastAnswerCorrect = null;
      p.lastPointsEarned = 0;
    }

    const currentQ = room.questions[room.currentRound];
    const clientQuestion = {
      roundNumber: room.currentRound + 1,
      totalRounds: room.totalRounds,
      id: currentQ.id,
      question: currentQ.question,
      options: currentQ.options,
      topic: currentQ.topic,
      hint: currentQ.hint,
      timeLimit: room.roundTimeLimit,
    };

    io.to(roomCode).emit("round_started", {
      question: clientQuestion,
      roundNumber: room.currentRound + 1,
      totalRounds: room.totalRounds,
      timeLeft: room.roundTimeLeft,
      participants: Array.from(room.participants.values()),
    });

    // Round timer ticker
    clearInterval(room.roundTimer);
    room.roundTimer = setInterval(() => {
      room.roundTimeLeft--;
      io.to(roomCode).emit("timer_tick", { timeLeft: room.roundTimeLeft });

      if (room.roundTimeLeft <= 0) {
        clearInterval(room.roundTimer);
        endRound(roomCode);
      }
    }, 1000);
  }

  function endRound(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.status = "round_summary";
    const currentQ = room.questions[room.currentRound];

    io.to(roomCode).emit("round_ended", {
      correctAnswer: currentQ._rawCorrectAnswer,
      explanation: currentQ.explanation,
      leaderboard: Array.from(room.participants.values()).sort((a, b) => b.score - a.score),
    });

    room.currentRound++;

    // Wait 4 seconds for round summary then advance
    setTimeout(() => {
      if (rooms.has(roomCode)) {
        if (room.currentRound < room.totalRounds) {
          startRound(roomCode);
        } else {
          finishMatch(roomCode);
        }
      }
    }, 4000);
  }

  async function finishMatch(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.status = "finished";
    const sortedLeaderboard = Array.from(room.participants.values()).sort((a, b) => b.score - a.score);
    const winner = sortedLeaderboard[0] || null;

    // Distribute rewards to real registered users
    for (let i = 0; i < sortedLeaderboard.length; i++) {
      const p = sortedLeaderboard[i];
      let coinsReward = 20;
      let xpReward = 25;
      let starsReward = 0;

      if (i === 0) {
        coinsReward = 100;
        xpReward = 80;
        starsReward = 2;
      } else if (i === 1) {
        coinsReward = 60;
        xpReward = 50;
        starsReward = 1;
      } else if (i === 2) {
        coinsReward = 40;
        xpReward = 35;
        starsReward = 1;
      }

      p.rewardCoins = coinsReward;
      p.rewardXp = xpReward;
      p.rewardStars = starsReward;

      // Update in MongoDB if user is authenticated
      if (p.id && String(p.id).length === 24) {
        try {
          await User.findByIdAndUpdate(p.id, {
            $inc: {
              totalCoins: coinsReward,
              totalXP: xpReward,
              totalStars: starsReward,
            },
          });
          await RewardHistory.create({
            playerId: p.id,
            rewardType: "multiplayer_arena",
            amount: coinsReward,
            reason: `Multiplayer Arena Rank #${i + 1} (${p.score} pts)`,
            uniqueTransactionKey: `arena:${roomCode}:${p.id}`,
          });
        } catch {}
      }
    }

    io.to(roomCode).emit("match_finished", {
      winner,
      leaderboard: sortedLeaderboard,
      roomCode,
    });

    // Cleanup room after 10 minutes
    setTimeout(() => {
      rooms.delete(roomCode);
    }, 600000);
  }

  function handlePlayerLeave(socket, roomCode) {
    if (!roomCode) return;
    const room = rooms.get(roomCode);
    if (!room) return;

    room.participants.delete(socket.id);

    if (room.participants.size === 0) {
      clearInterval(room.roundTimer);
      rooms.delete(roomCode);
    } else {
      // If host left, assign new host
      if (room.hostId === socket.id) {
        const nextParticipant = room.participants.values().next().value;
        if (nextParticipant) {
          nextParticipant.isHost = true;
          room.hostId = nextParticipant.id;
        }
      }
      io.to(roomCode).emit("participant_update", {
        participants: Array.from(room.participants.values()),
      });
      io.to(roomCode).emit("player_left", { socketId: socket.id });
    }
  }

  function getPublicRoomState(roomCode) {
    const room = rooms.get(roomCode);
    if (!room) return null;
    return {
      code: room.code,
      topic: room.topic,
      status: room.status,
      hostId: room.hostId,
      totalRounds: room.totalRounds,
      participants: Array.from(room.participants.values()),
    };
  }

  return io;
}

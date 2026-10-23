import RewardLedger from "../models/RewardLedger.js";
import User from "../models/User.js";

export const SCORING = {
  easy: 10,
  medium: 20,
  hard: 30,
  lessonComplete: 25,
  dailyGoal: 50,
  topicComplete: 100,
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000]; // Level 1..7

export function calculateLevel(points) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    }
  }
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const progressPercent = Math.min(
    100,
    Math.round(((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  );

  return {
    level,
    points,
    currentThreshold,
    nextThreshold,
    progressPercent: isNaN(progressPercent) ? 100 : progressPercent,
  };
}

// Idempotent award: unique index on (userId, rewardKey) blocks double claims
export async function awardPoints(userId, rewardKey, points) {
  if (points <= 0) return false;
  try {
    await RewardLedger.create({ userId, rewardKey, points });
    await User.updateOne({ _id: userId }, { $inc: { totalPoints: points } });
    return true;
  } catch (e) {
    if (e.code === 11000) return false; // already awarded
    throw e;
  }
}

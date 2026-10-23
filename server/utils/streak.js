// server/utils/streak.js - compute days in the student's timezone (IST)
import User from "../models/User.js";

export const todayIST = (d = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); // YYYY-MM-DD

export async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return 0;

  const today = todayIST();
  if (user.lastActiveDate === today) {
    return user.currentStreak; // already counted today
  }

  const yesterdayDate = new Date(Date.now() - 86_400_000);
  const yesterday = todayIST(yesterdayDate);

  if (user.lastActiveDate === yesterday) {
    user.currentStreak = (user.currentStreak || 0) + 1;
  } else {
    user.currentStreak = 1;
  }

  user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak);
  user.lastActiveDate = today;
  await user.save();
  return user.currentStreak;
}

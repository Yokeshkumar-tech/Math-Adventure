// server/utils/adaptiveDifficulty.js

export const LEVELS = ["easy", "medium", "hard"];
export const RULES = { promoteAfter: 3, demoteAfter: 2 }; // configurable

// state = { level, streakCorrect, streakWrong }
export function nextDifficulty(state, wasCorrect, rules = RULES) {
  let { level, streakCorrect = 0, streakWrong = 0 } = state;
  let idx = LEVELS.indexOf(level);
  if (idx === -1) idx = 0;

  if (wasCorrect) {
    streakCorrect += 1;
    streakWrong = 0;
  } else {
    streakWrong += 1;
    streakCorrect = 0;
  }

  let changed = null;
  if (streakCorrect >= rules.promoteAfter && idx < LEVELS.length - 1) {
    idx += 1;
    changed = "up";
    streakCorrect = 0; // reset after change
  } else if (streakWrong >= rules.demoteAfter && idx > 0) {
    idx -= 1;
    changed = "down";
    streakWrong = 0; // reset after change
  }

  return {
    level: LEVELS[idx],
    streakCorrect,
    streakWrong,
    changed,
  };
}

// Starting level for a new quiz: based on last attempt on the same topic
export function startingLevel(lastAttempt) {
  if (!lastAttempt) return "easy";
  if (lastAttempt.accuracy >= 85) {
    return lastAttempt.difficultyReached || "easy";
  }
  if (lastAttempt.accuracy < 50) {
    return "easy";
  }
  const prevIdx = LEVELS.indexOf(lastAttempt.difficultyReached || "easy");
  return LEVELS[Math.max(0, prevIdx - 1)];
}

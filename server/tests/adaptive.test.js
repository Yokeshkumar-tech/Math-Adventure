// server/tests/adaptive.test.js
import { nextDifficulty, startingLevel } from "../utils/adaptiveDifficulty.js";

describe("Adaptive Difficulty State Machine", () => {
  test("3 correct in a row promotes easy -> medium", () => {
    let s = { level: "easy", streakCorrect: 0, streakWrong: 0 };
    s = nextDifficulty(s, true);
    s = nextDifficulty(s, true);
    s = nextDifficulty(s, true);
    expect(s.level).toBe("medium");
    expect(s.changed).toBe("up");
    expect(s.streakCorrect).toBe(0); // counters reset after change
  });

  test("2 wrong in a row demotes medium -> easy", () => {
    let s = { level: "medium", streakCorrect: 0, streakWrong: 0 };
    s = nextDifficulty(s, false);
    s = nextDifficulty(s, false);
    expect(s.level).toBe("easy");
    expect(s.changed).toBe("down");
    expect(s.streakWrong).toBe(0); // counters reset after change
  });

  test("never goes above hard or below easy", () => {
    let s = { level: "hard", streakCorrect: 2, streakWrong: 0 };
    const promoted = nextDifficulty(s, true);
    expect(promoted.level).toBe("hard");

    let low = { level: "easy", streakCorrect: 0, streakWrong: 1 };
    const demoted = nextDifficulty(low, false);
    expect(demoted.level).toBe("easy");
  });

  test("mixed answers stay at current level", () => {
    let s = { level: "medium", streakCorrect: 0, streakWrong: 0 };
    s = nextDifficulty(s, true); // 1 correct
    s = nextDifficulty(s, false); // streak reset
    expect(s.level).toBe("medium");
    expect(s.streakCorrect).toBe(0);
    expect(s.streakWrong).toBe(1);
    expect(s.changed).toBeNull();
  });

  test("startingLevel selects appropriate level from last attempt", () => {
    expect(startingLevel(null)).toBe("easy");
    expect(startingLevel({ accuracy: 90, difficultyReached: "hard" })).toBe("hard");
    expect(startingLevel({ accuracy: 40, difficultyReached: "hard" })).toBe("easy");
    expect(startingLevel({ accuracy: 75, difficultyReached: "hard" })).toBe("medium");
    expect(startingLevel({ accuracy: 75, difficultyReached: "medium" })).toBe("easy");
  });
});

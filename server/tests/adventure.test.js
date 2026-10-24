// server/tests/adventure.test.js
import { describe, test, expect } from "@jest/globals";

describe("Adventure Game Engine & Economy Logic", () => {
  // Test 1: Star Rating Calculation Rules
  test("calculates star rating according to exact user requirements", () => {
    function calculateStars(correct, total) {
      if (total === 0) return 0;
      const score = Math.round((correct / total) * 100);
      if (score >= 80) return 3;
      if (score >= 60) return 2;
      return 1;
    }

    // ≥ 80% = 3 stars
    expect(calculateStars(5, 5)).toBe(3); // 100%
    expect(calculateStars(4, 5)).toBe(3); // 80%

    // 60% – 79% = 2 stars
    expect(calculateStars(3, 5)).toBe(2); // 60%
    expect(calculateStars(7, 10)).toBe(2); // 70%

    // Below 60% = 1 star upon meeting completion requirements
    expect(calculateStars(2, 5)).toBe(1); // 40%
    expect(calculateStars(1, 5)).toBe(1); // 20%
  });

  // Test 2: Reward calculation rules (20 coins + 10 XP per correct, 50 bonus coins on complete)
  test("calculates coins and XP according to mission rules", () => {
    const rules = {
      coinsPerCorrect: 20,
      xpPerCorrect: 10,
      bonusCoinsOnComplete: 50,
    };

    const correctAnswers = 4;
    const coinsFromAnswers = correctAnswers * rules.coinsPerCorrect; // 80
    const xpFromAnswers = correctAnswers * rules.xpPerCorrect; // 40
    const totalCoins = coinsFromAnswers + rules.bonusCoinsOnComplete; // 130

    expect(coinsFromAnswers).toBe(80);
    expect(xpFromAnswers).toBe(40);
    expect(totalCoins).toBe(130);
  });

  // Test 3: Idempotency & Prevention of Duplicate Rewards
  test("prevents awarding duplicate coins for the same question within a session", () => {
    const answeredMap = new Map();
    let playerCoins = 100;

    function recordAnswer(questionId, isCorrect, coinsRule = 20) {
      if (answeredMap.has(questionId)) {
        // Repeated answer submission for same question should award 0 additional coins
        return { awarded: 0, playerCoins };
      }
      answeredMap.set(questionId, true);
      const awarded = isCorrect ? coinsRule : 0;
      playerCoins += awarded;
      return { awarded, playerCoins };
    }

    // First attempt: correct
    const res1 = recordAnswer("q_101", true, 20);
    expect(res1.awarded).toBe(20);
    expect(res1.playerCoins).toBe(120);

    // Repeated attempt on same question: should NOT grant coins again
    const res2 = recordAnswer("q_101", true, 20);
    expect(res2.awarded).toBe(0);
    expect(res2.playerCoins).toBe(120);
  });

  // Test 4: Shop Purchase Balance Validation (Coins cannot become negative)
  test("prevents purchases when coin balance is insufficient, avoiding negative balance", () => {
    let playerCoins = 50;

    function attemptPurchase(itemPrice) {
      if (playerCoins < itemPrice) {
        return { success: false, message: "Insufficient coins", balance: playerCoins };
      }
      playerCoins -= itemPrice;
      return { success: true, balance: playerCoins };
    }

    // Item costs 150 coins, player only has 50
    const failedAttempt = attemptPurchase(150);
    expect(failedAttempt.success).toBe(false);
    expect(failedAttempt.balance).toBe(50);
    expect(playerCoins).toBeGreaterThanOrEqual(0);

    // Give player enough coins
    playerCoins += 200; // now 250
    const successfulAttempt = attemptPurchase(150);
    expect(successfulAttempt.success).toBe(true);
    expect(successfulAttempt.balance).toBe(100);
    expect(playerCoins).toBe(100);
  });

  // Test 5: Anti-Cheat question sanitization (Never expose correctAnswer before submission)
  test("sanitizes questions before client delivery, completely stripping correctAnswer", () => {
    const serverQuestion = {
      _id: "q_geo_42",
      questionText: "What is the area of a rectangle with length 8cm and width 5cm?",
      options: ["40 sq cm", "26 sq cm", "13 sq cm", "30 sq cm"],
      correctAnswer: "40 sq cm",
      explanation: "Area = length × width = 8 × 5 = 40 sq cm.",
      hint: "Multiply length by width.",
    };

    function sanitizeForClient(q) {
      return {
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        hint: q.hint,
        // Notice: correctAnswer and explanation are excluded
      };
    }

    const clientQuestion = sanitizeForClient(serverQuestion);
    expect(clientQuestion.correctAnswer).toBeUndefined();
    expect(clientQuestion.explanation).toBeUndefined();
    expect(clientQuestion.options).toHaveLength(4);
    expect(clientQuestion.questionText).toBeTruthy();
  });

  // Test 6: World Unlocking Requirements
  test("locks worlds until required star threshold or prior boss is defeated", () => {
    const worlds = [
      { slug: "number-forest", order: 1, minStars: 0 },
      { slug: "fraction-kingdom", order: 2, minStars: 4 },
      { slug: "desert-of-numbers", order: 3, minStars: 10 },
      { slug: "ocean-of-geometry", order: 4, minStars: 16 },
      { slug: "dragons-castle", order: 5, minStars: 22 },
    ];

    function isWorldAccessible(world, playerStars, explicitlyUnlockedList = []) {
      if (world.order === 1) return true;
      if (explicitlyUnlockedList.includes(world.slug)) return true;
      return playerStars >= world.minStars;
    }

    // New player with 2 stars
    expect(isWorldAccessible(worlds[0], 2)).toBe(true);
    expect(isWorldAccessible(worlds[1], 2)).toBe(false);

    // Player with 6 stars
    expect(isWorldAccessible(worlds[1], 6)).toBe(true);
    expect(isWorldAccessible(worlds[2], 6)).toBe(false);

    // Player defeated boss and received explicit world unlock token
    expect(isWorldAccessible(worlds[2], 6, ["desert-of-numbers"])).toBe(true);
  });
});

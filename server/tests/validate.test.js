// server/tests/validate.test.js
import { Frac, parseAnswer, evaluate, validateQuestion } from "../utils/validateQuestion.js";

describe("Validation and Math Engine", () => {
  test("exact fraction arithmetic adds fractions correctly", () => {
    const half1 = new Frac(1, 2);
    const half2 = new Frac(1, 2);
    const sum = half1.add(half2);
    expect(sum.equals(new Frac(1, 1))).toBe(true);
    expect(sum.toString()).toBe("1");
  });

  test("parses answers in various formats", () => {
    expect(parseAnswer("3/4").equals(new Frac(3, 4))).toBe(true);
    expect(parseAnswer("0.75").equals(new Frac(3, 4))).toBe(true);
    expect(parseAnswer("15").equals(new Frac(15, 1))).toBe(true);
    expect(parseAnswer("2 1/2").equals(new Frac(5, 2))).toBe(true);
    expect(parseAnswer("15 m").equals(new Frac(15, 1))).toBe(true);
    expect(parseAnswer("Rs 40").equals(new Frac(40, 1))).toBe(true);
  });

  test("safely evaluates mathematical expressions", () => {
    const res1 = evaluate("1/2+1/2");
    expect(res1.equals(new Frac(1, 1))).toBe(true);

    const res2 = evaluate("3/4*20");
    expect(res2.equals(new Frac(15, 1))).toBe(true);

    const res3 = evaluate("25-(3/5*25)");
    expect(res3.equals(new Frac(10, 1))).toBe(true);
  });

  test("rejects a wrong AI answer", () => {
    const q = {
      question: "Find 3/4 of 20",
      options: ["12", "15", "16", "20"],
      correctAnswer: "16", // WRONG answer!
      expression: "3/4*20",
    };
    expect(validateQuestion(q).ok).toBe(false);
  });

  test("accepts a correct mathematical question", () => {
    const q = {
      question: "Find 3/4 of 20",
      options: ["12", "15", "16", "20"],
      correctAnswer: "15", // CORRECT
      expression: "3/4*20",
    };
    expect(validateQuestion(q).ok).toBe(true);
  });

  test("rejects questions with duplicate options", () => {
    const q = {
      question: "What is 2 + 2?",
      options: ["4", "4", "5", "6"],
      correctAnswer: "4",
      expression: "2+2",
    };
    expect(validateQuestion(q).ok).toBe(false);
    expect(validateQuestion(q).errors).toContain("duplicate options");
  });

  test("rejects questions where correctAnswer is not in options", () => {
    const q = {
      question: "What is 5 * 2?",
      options: ["8", "9", "11", "12"],
      correctAnswer: "10",
      expression: "5*2",
    };
    expect(validateQuestion(q).ok).toBe(false);
    expect(validateQuestion(q).errors).toContain("answer not in options");
  });
});

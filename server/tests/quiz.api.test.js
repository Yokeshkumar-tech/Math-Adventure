// server/tests/quiz.api.test.js
import request from "supertest";
import mongoose from "mongoose";
import app from "../server.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("API Integration Tests", () => {
  let guestToken = "";
  let sessionId = "";
  let questionId = "";

  test("GET /api/health returns status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /api/auth/guest creates temporary user with token", async () => {
    const res = await request(app).post("/api/auth/guest");
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.totalPoints).toBe(250);
    expect(res.body.user.currentStreak).toBe(5);
    guestToken = res.body.token;
  });

  test("GET /api/grades/5/topics returns 5 topics", async () => {
    const res = await request(app)
      .get("/api/grades/5/topics")
      .set("Authorization", `Bearer ${guestToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
  });

  test("POST /api/quizzes/start starts a quiz and HIDES correctAnswer (Security Q7)", async () => {
    const res = await request(app)
      .post("/api/quizzes/start")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({ topic: "Fractions", grade: 5 });

    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.question).toBeDefined();
    expect(res.body.question.options.length).toBe(4);
    // CRITICAL SECURITY TEST Q7: browser must NOT receive correctAnswer before submit!
    expect(res.body.question.correctAnswer).toBeUndefined();

    sessionId = res.body.sessionId;
    questionId = res.body.question.id;
  });

  test("POST /api/quizzes/submit submits answer and reveals result with points", async () => {
    const res = await request(app)
      .post("/api/quizzes/submit")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        sessionId,
        questionId,
        selected: "1", // try option "1"
      });

    expect(res.status).toBe(200);
    expect(res.body.correct).toBeDefined();
    expect(res.body.correctAnswer).toBeDefined();
    expect(res.body.pointsEarned).toBeDefined();
  });

  test("POST /api/quizzes/submit prevents duplicate answer submission (409)", async () => {
    const res = await request(app)
      .post("/api/quizzes/submit")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        sessionId,
        questionId,
        selected: "1",
      });

    expect(res.status).toBe(409);
  });
});

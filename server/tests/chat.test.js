// server/tests/chat.test.js
import request from "supertest";
import mongoose from "mongoose";
import express from "express";
import chatRoutes from "../routes/chatRoutes.js";
import { solveOrVerify } from "../services/mathService.js";

const app = express();
app.use(express.json());
app.use("/api", chatRoutes);

describe("Professor Pi - AI & Symbolic Math Engine Tests", () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure_test";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  // 1. Math Service Unit Tests for Core Capabilities
  describe("Mathematical Accuracy & Verification (mathService)", () => {
    test("1. Arithmetic: 25 × 48 = 1200", () => {
      const res = solveOrVerify("25 × 48");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toBe("1200");
    });

    test("2. Percentages: What is 15% of 800? = 120", () => {
      const res = solveOrVerify("What is 15% of 800?");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toBe("120");
    });

    test("3. Linear Algebra: Solve 2x + 5 = 17 -> x = 6", () => {
      const res = solveOrVerify("Solve 2x + 5 = 17");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toBe("x = 6");
      expect(res.steps.length).toBeGreaterThanOrEqual(2);
    });

    test("4. Quadratic Equations: Solve x^2 - 5x + 6 = 0 -> x = 3, 2", () => {
      const res = solveOrVerify("Solve x^2 - 5x + 6 = 0");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toContain("x_1 = 3");
      expect(res.finalAnswer).toContain("x_2 = 2");
    });

    test("5. Fractions: Add 1/2 + 1/3 = 5/6", () => {
      const res = solveOrVerify("1/2 + 1/3");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toContain("{5}{6}");
    });

    test("6. Geometry: Area of circle with radius 7 cm", () => {
      const res = solveOrVerify("Find the area of a circle with radius 7 cm");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toContain("154");
    });

    test("7. Statistics: Mean, median, and mode of 10, 20, 20, 30, 40", () => {
      const res = solveOrVerify("Find the mean, median, and mode of 10, 20, 20, 30, 40");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toContain("Mean} = 24");
      expect(res.finalAnswer).toContain("Median} = 20");
      expect(res.finalAnswer).toContain("Mode} = 20");
    });

    test("8. Calculus: Differentiate x^3 + 2x -> 3x^2 + 2", () => {
      const res = solveOrVerify("Differentiate x^3 + 2x");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toBe("f'(x) = 3x^2 + 2");
    });

    test("9. Calculus: Integrate 2x + 3 -> x^2 + 3x + C", () => {
      const res = solveOrVerify("Integrate 2x + 3");
      expect(res).not.toBeNull();
      expect(res.success).toBe(true);
      expect(res.finalAnswer).toContain("x^2 + 3x + C");
    });
  });

  // 2. Integration Tests for REST Endpoints
  describe("Professor Pi API Endpoints", () => {
    let createdConvId = null;
    let createdMsgId = null;

    test("POST /api/chat rejects empty or whitespace messages (400)", async () => {
      const res = await request(app).post("/api/chat").send({ message: "   " });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("POST /api/chat responds with step-by-step mathematical solution", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({
          message: "Solve 2x + 5 = 17",
          level: "middle",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.conversationId).toBeDefined();
      expect(res.body.answer).toContain("x = 6");
      expect(Array.isArray(res.body.steps)).toBe(true);

      createdConvId = res.body.conversationId;
      createdMsgId = res.body.messageId;
    });

    test("GET /api/conversations/:id retrieves conversation history with messages", async () => {
      expect(createdConvId).not.toBeNull();
      const res = await request(app).get(`/api/conversations/${createdConvId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.conversation._id.toString()).toBe(createdConvId.toString());
      expect(res.body.messages.length).toBeGreaterThanOrEqual(2); // user + assistant
    });

    test("PATCH /api/conversations/:id renames conversation", async () => {
      expect(createdConvId).not.toBeNull();
      const res = await request(app)
        .patch(`/api/conversations/${createdConvId}`)
        .send({ title: "Algebra Mystery Solved" });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.conversation.title).toBe("Algebra Mystery Solved");
    });

    test("POST /api/chat/feedback records upvote/downvote", async () => {
      expect(createdMsgId).not.toBeNull();
      const res = await request(app).post("/api/chat/feedback").send({
        messageId: createdMsgId,
        feedback: "up",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.feedback).toBe("up");
    });

    test("POST /api/math/verify returns verification breakdown", async () => {
      const res = await request(app).post("/api/math/verify").send({
        query: "Solve 3x - 7 = 11",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.verified).toBe(true);
      expect(res.body.finalAnswer).toBe("x = 6");
    });

    test("POST /api/quiz/generate produces targeted practice questions", async () => {
      const res = await request(app).post("/api/quiz/generate").send({
        topic: "Algebra",
        count: 2,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.questions.length).toBe(2);
      expect(res.body.questions[0].correctAnswer).toBeDefined();
    });

    test("DELETE /api/conversations/:id deletes conversation and related messages", async () => {
      expect(createdConvId).not.toBeNull();
      const res = await request(app).delete(`/api/conversations/${createdConvId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const checkRes = await request(app).get(`/api/conversations/${createdConvId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});

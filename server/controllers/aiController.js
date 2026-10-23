// server/controllers/aiController.js
import OpenAI from "openai";
import { z } from "zod";
import { lessonPrompt, simplerPrompt, tutorPrompt, summaryPrompt } from "../utils/prompts.js";
import { validateQuestion } from "../utils/validateQuestion.js";
import Lesson from "../models/Lesson.js";

const client = process.env.AI_API_KEY
  ? new OpenAI({ apiKey: process.env.AI_API_KEY })
  : null;

const LessonSchema = z.object({
  topic: z.string(),
  learningObjectives: z.array(z.string()).min(1),
  explanation: z.string().min(20),
  workedExamples: z
    .array(
      z.object({
        problem: z.string(),
        steps: z.array(z.string()).min(1),
        answer: z.string(),
      })
    )
    .min(1)
    .max(3),
  realLifeExample: z.string().optional(),
  keyPoints: z.array(z.string()).min(1),
  practiceQuestions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z.string(),
        explanation: z.string(),
        expression: z.string().nullable().optional(),
      })
    )
    .optional(),
});

export async function generateExplanation(req, res) {
  const { grade = 5, topic = "Fractions", difficulty = "medium", mode = "generate", currentText } = req.body;

  try {
    if (process.env.AI_ENABLED !== "true" || !client) {
      throw new Error("AI disabled or no key provided; using validated fallback.");
    }

    if (mode === "simpler") {
      const completion = await client.chat.completions.create({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [{ role: "user", content: simplerPrompt(currentText || topic) }],
      });
      return res.json({
        source: "ai",
        mode: "simpler",
        explanation: completion.choices[0].message.content,
      });
    }

    if (mode === "example") {
      const prompt = `Give one new real-life worked example for Grade ${grade} topic "${topic}".
Difficulty: ${difficulty}.
Return ONLY JSON: { "problem": string, "steps": string[], "answer": string, "expression": string|null }`;
      const completion = await client.chat.completions.create({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }],
      });
      const parsed = JSON.parse(completion.choices[0].message.content);
      return res.json({
        source: "ai",
        mode: "example",
        workedExample: parsed,
      });
    }

    // Default: full structured lesson
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [{ role: "user", content: lessonPrompt({ grade, topic, difficulty }) }],
    });

    const parsed = LessonSchema.parse(JSON.parse(completion.choices[0].message.content));

    // Filter practice questions to ensure mathematical correctness
    if (parsed.practiceQuestions) {
      parsed.practiceQuestions = parsed.practiceQuestions.filter((q) => validateQuestion(q).ok);
    }

    return res.json({ source: "ai", lesson: parsed });
  } catch (err) {
    // Graceful degradation: serve pre-written teacher-validated lesson from MongoDB
    const fallback = await Lesson.findOne({
      $or: [{ topic: new RegExp(`^${topic}$`, "i") }, { grade: Number(grade) || 5 }],
      published: true,
    }).lean();

    if (mode === "simpler") {
      return res.json({
        source: "fallback",
        mode: "simpler",
        explanation: `Here is a simpler picture: Imagine a birthday cake cut into 4 equal slices. If you take 1 slice, you have 1 out of 4, which is 1/4! Denominator 4 is the total pieces, and numerator 1 is what you hold.`,
        note: "Showing pre-written simplified explanation",
      });
    }

    if (mode === "example") {
      return res.json({
        source: "fallback",
        mode: "example",
        workedExample: {
          problem: "A fruit basket has 12 apples. You give 1/3 of them to your sister. How many apples does she get?",
          steps: [
            "Step 1: Divide the total 12 apples into 3 equal groups: 12 ÷ 3 = 4 apples per group.",
            "Step 2: She gets 1 of those groups: 1 × 4 = 4 apples.",
          ],
          answer: "4 apples",
        },
        note: "Showing teacher-verified example",
      });
    }

    return res.json({
      source: "fallback",
      lesson: fallback,
      note: "Showing saved teacher-validated lesson",
    });
  }
}

export async function summarizeLesson(req, res) {
  const { topic = "Mathematics", explanation = "" } = req.body;

  try {
    if (process.env.AI_ENABLED !== "true" || !client) {
      throw new Error("AI disabled");
    }

    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: summaryPrompt(topic, explanation) }],
    });

    return res.json({
      source: "ai",
      summary: completion.choices[0].message.content,
    });
  } catch {
    return res.json({
      source: "fallback",
      summary: `• 🍕 ${topic} helps us understand parts of a whole and real-world math!\n• 🔢 Always identify the total pieces first, then what you are measuring.\n• 💡 Remember to check your calculations step by step!\n• 🏆 Practise 3 problems today to earn your next badge!`,
      note: "Showing verified summary takeaways",
    });
  }
}

export async function tutorChat(req, res) {
  const { topic = "Fractions", grade = 5, conversation = [], message = "" } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Please type a math question for Professor Pi!" });
  }

  // Safety checks for child user
  const sanitized = message.trim();
  const lower = sanitized.toLowerCase();

  // If user asks for direct quiz cheat
  if (lower.includes("give me quiz answer") || lower.includes("tell me the answer to question")) {
    return res.json({
      reply: "Haha, nice try adventurer! 🕵️ I can't give you direct quiz answers during your adventure, but I can show you how to solve a similar problem step-by-step! What part feels tricky?",
    });
  }

  try {
    if (process.env.AI_ENABLED !== "true" || !client) {
      throw new Error("AI disabled");
    }

    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 180,
      messages: [
        {
          role: "user",
          content: tutorPrompt({
            topic,
            grade,
            conversationHistory: conversation.slice(-6),
            studentMessage: sanitized,
          }),
        },
      ],
    });

    return res.json({
      reply: completion.choices[0].message.content,
      source: "ai",
    });
  } catch {
    // Friendly fallback tutor responses for the topic
    let cannedReply = `Great question about ${topic}! 🌟 When solving this, think of breaking the problem down into 2 smaller pieces: first identify what you already know, and second check what the question asks for. Would you like a pizza slice example or a money example?`;
    if (lower.includes("fraction") || topic.toLowerCase().includes("fraction")) {
      cannedReply = `Fractions are like sharing a pizza equally! 🍕 The top number (numerator) tells you how many slices you take, and the bottom number (denominator) tells you how many slices the whole pizza was cut into! Does that make sense?`;
    } else if (lower.includes("decimal") || topic.toLowerCase().includes("decimal")) {
      cannedReply = `Decimals are like coins in rupees! 💰 0.50 is fifty paise, which is half of a rupee (1/2). The dot separates full units from parts!`;
    } else if (lower.includes("area") || lower.includes("perimeter")) {
      cannedReply = `Perimeter is the fence around your garden (add all sides!), while Area is the grass inside (multiply length times width for a rectangle)! 📐`;
    }

    return res.json({
      reply: cannedReply,
      source: "fallback",
    });
  }
}

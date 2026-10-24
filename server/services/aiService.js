// server/services/aiService.js
import OpenAI from "openai";
import { solveOrVerify } from "./mathService.js";

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const isAIConfigured =
  process.env.AI_ENABLED === "true" &&
  Boolean(apiKey) &&
  apiKey !== "mock-or-set-your-key-here";

let openaiClient = null;
if (isAIConfigured) {
  openaiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
}

/**
 * Build system prompt based on user's grade / level
 */
export function buildSystemPrompt(level = "middle") {
  const levelDescriptions = {
    elementary: "Grades 1-5 (elementary school). Use joyful, visual analogies like pizza slices, rupees, and toy blocks. Keep sentences short and vocabulary clear.",
    middle: "Grades 6-8 (middle school). Focus on pre-algebra, ratios, fractions, percentages, and basic geometry.",
    high: "Grades 9-12 (high school). Focus on rigorous algebra, geometry theorems, trigonometry, and statistics.",
    college: "College & University level. Support single and multivariable calculus, linear algebra, differential equations, and abstract mathematics.",
    advanced: "Advanced undergraduate / graduate mathematics. Use precise symbolic notation, formal proofs, and rigorous justifications.",
  };

  const levelGuide = levelDescriptions[level] || levelDescriptions.middle;

  return `You are Professor Pi, a friendly, patient, and accurate mathematics tutor. You can answer mathematics questions across school, college, and advanced mathematics.

Target Audience & Level: ${levelGuide}

Core Guidelines:
1. Understand the student's actual question before solving it.
2. Explain the solution in clear, simple language with enthusiasm and warmth.
3. Show formulas, substitutions, calculations, and intermediate steps where appropriate. Number each step clearly (Step 1:, Step 2:, etc.).
4. Verify arithmetic and algebraic results before responding. Distinguish exact answers from approximations.
5. Explain why each important step works (the intuition and principles).
6. Adapt the difficulty to the student. If the question is ambiguous, ask a clarifying question.
7. If the student made a mistake in their calculations, correct it kindly, point out exactly where the mistake occurred, and show how to fix it.
8. For follow-up questions, use the existing conversation context. Do not force the student to repeat information already provided.
9. Format all mathematical equations using LaTeX notation ($...$ for inline formulas, $$...$$ for block equations).
10. End explanations with a clearly formatted section:
### Final Answer
**[Final result]**

Encourage mathematical thinking rather than simply spitting out answers!`;
}

/**
 * Generate AI chat response with streaming support
 */
export async function generateChatResponse({
  messages = [],
  level = "middle",
  onToken = null, // callback for streaming tokens
  signal = null,
}) {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 1. Check if OpenAI is enabled and configured
  if (openaiClient && isAIConfigured) {
    try {
      const formattedMessages = [
        { role: "system", content: buildSystemPrompt(level) },
        ...messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ];

      // If streaming is requested and callback is provided
      if (onToken) {
        const stream = await openaiClient.chat.completions.create(
          {
            model: process.env.AI_MODEL || "gpt-4o-mini",
            messages: formattedMessages,
            temperature: 0.4,
            stream: true,
          },
          { signal }
        );

        let fullContent = "";
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            fullContent += delta;
            onToken(delta);
          }
        }

        return {
          content: fullContent,
          source: "ai",
        };
      } else {
        const completion = await openaiClient.chat.completions.create(
          {
            model: process.env.AI_MODEL || "gpt-4o-mini",
            messages: formattedMessages,
            temperature: 0.4,
          },
          { signal }
        );

        return {
          content: completion.choices[0]?.message?.content || "",
          source: "ai",
        };
      }
    } catch (err) {
      console.warn("OpenAI API call failed or timed out. Falling back to Symbolic Math Engine:", err.message);
    }
  }

  // 2. Symbolic Math Engine fallback
  const solved = solveOrVerify(lastUserMessage);
  if (solved && solved.success) {
    let reply = `Hello! 🦉 Let's solve this step by step together:\n\n`;
    if (solved.formula) {
      reply += `**Key Formula:**\n$$${solved.formula}$$\n\n`;
    }
    reply += `**Step-by-Step Solution:**\n`;
    solved.steps.forEach((step, i) => {
      reply += `${i + 1}. ${step}\n`;
    });
    reply += `\n### Final Answer\n$$${solved.finalAnswer}$$\n\n`;
    if (solved.explanation) {
      reply += `💡 **Why this works:** ${solved.explanation}\n\n`;
    }
    if (solved.similarProblem) {
      reply += `🎯 **Practice for you:** *${solved.similarProblem}*`;
    }

    if (onToken) {
      // Simulate fast token streaming for the symbolic solver so UX remains fluid
      const words = reply.split(" ");
      for (const word of words) {
        onToken(word + " ");
        await new Promise((r) => setTimeout(r, 15));
      }
    }

    return {
      content: reply,
      source: "symbolic_math",
      steps: solved.steps,
      finalAnswer: solved.finalAnswer,
      formula: solved.formula,
    };
  }

  // 3. Conversational / Contextual fallback when outside of pre-programmed symbolic cases and AI key is not set
  let fallbackReply = `Hello math explorer! 🦉 I am Professor Pi.\n\n` +
    `I received your question: **"${lastUserMessage}"**.\n\n` +
    `I am currently operating in **Symbolic Math Mode**. To ask open-ended questions and general college-level natural language queries, please configure your \`OPENAI_API_KEY\` and set \`AI_ENABLED=true\` in \`server/.env\`.\n\n` +
    `In the meantime, you can ask me to solve:\n` +
    `• **Linear & Quadratic Equations** (e.g. *"Solve 2x + 5 = 15"* or *"3x - 7 = 11"*)\n` +
    `• **Fraction Arithmetic** (e.g. *"Add 1/2 + 1/3"* or *"Explain fractions using a pizza example"*)\n` +
    `• **Percentages** (e.g. *"Calculate 15% of 800"*)\n` +
    `• **Geometry & Area** (e.g. *"Find the area of a circle with radius 7"* or *"Pythagorean theorem"*)\n` +
    `• **Statistics & Probability** (e.g. *"Calculate the mean of 10, 20, and 30"* or *"Coin flip probability"*)\n` +
    `• **Calculus** (e.g. *"Find the derivative of x^3 - 4x + 1"*)\n\n` +
    `What problem would you like to solve next?`;

  if (onToken) {
    const words = fallbackReply.split(" ");
    for (const word of words) {
      onToken(word + " ");
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  return {
    content: fallbackReply,
    source: "symbolic_math",
  };
}

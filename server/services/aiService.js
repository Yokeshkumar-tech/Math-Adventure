// server/services/aiService.js
import OpenAI from "openai";
import { solveOrVerify } from "./mathService.js";

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const isAIConfigured =
  process.env.AI_ENABLED === "true" &&
  Boolean(apiKey) &&
  apiKey !== "mock-or-set-your-key-here" &&
  apiKey.length > 5;

let openaiClient = null;
if (isAIConfigured) {
  try {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL || undefined,
    });
  } catch (err) {
    console.warn("Failed to initialize OpenAI client:", err.message);
  }
}

/**
 * Build tailored system prompt based on user's grade / level
 */
export function buildSystemPrompt(level = "middle") {
  const levelDescriptions = {
    elementary: "Grades 1-5 (elementary school). Use joyful, visual analogies like pizza slices, rupees, and toy blocks. Keep sentences short, warm, and vocabulary clear.",
    middle: "Grades 6-8 (middle school). Focus on pre-algebra, ratios, fractions, percentages, and basic geometry with intuitive step-by-step guidance.",
    high: "Grades 9-12 (high school). Focus on rigorous algebra, quadratic equations, geometry theorems, trigonometry, and statistics.",
    college: "College & University level. Support single and multivariable calculus, linear algebra, differential equations, and abstract mathematics.",
    advanced: "Advanced undergraduate / graduate mathematics. Use precise symbolic notation, formal proofs, and rigorous justifications.",
  };

  const levelGuide = levelDescriptions[level] || levelDescriptions.middle;

  return `You are Professor Pi 🦉, a friendly, patient, and highly accurate real-time AI Mathematics Tutor and Solver in the Math Adventure universe.

Target Student Level: ${levelGuide}

Strict Educational Response Structure:
When answering mathematical questions, follow this structured format where appropriate:
1. **Understand the question:** Summarize what we are asked to find.
2. **Formula or mathematical concept:** State the relevant formula, rule, or theorem using LaTeX notation.
3. **Step-by-step solution:** Number every step clearly (Step 1, Step 2, etc.), showing all intermediate work and arithmetic.
4. **Final answer:** Highlight clearly in this format:
### Final Answer
**[Final result with units]**
5. **Simple explanation:** Explain in 1-2 friendly sentences WHY this method works or what it means intuitively.
6. **Real-world example:** Provide a practical everyday analogy (such as shopping, cooking, pizza sharing, or sports).

Formatting & Mathematical Guidelines:
- Render ALL mathematical expressions, equations, variables, and symbols in LaTeX ($...$ for inline, $$...$$ for block formulas).
- Format code blocks using triple backticks with language tags if programming or algorithms are involved.
- Be context-aware: If the student asks follow-up questions (such as "Why?", "Show another method", "Explain that again", "Make it easier"), refer directly to the previous solution and adapt immediately.
- If the student made a mistake, point it out kindly, explain why it happened, and guide them to the correct answer.
- Distinguish exact numbers from decimal approximations.
- Never use JavaScript eval or invent fake numbers.`;
}

/**
 * Generate AI chat response with real streaming support
 */
export async function generateChatResponse({
  messages = [],
  level = "middle",
  onToken = null, // callback for streaming tokens
  signal = null,
}) {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // 1. If OpenAI or compatible AI provider is configured and enabled
  if (openaiClient && isAIConfigured) {
    try {
      const formattedMessages = [
        { role: "system", content: buildSystemPrompt(level) },
        ...messages.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      ];

      if (onToken) {
        const stream = await openaiClient.chat.completions.create(
          {
            model: process.env.AI_MODEL || "gpt-4o-mini",
            messages: formattedMessages,
            temperature: 0.3,
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
            temperature: 0.3,
          },
          { signal }
        );

        return {
          content: completion.choices[0]?.message?.content || "",
          source: "ai",
        };
      }
    } catch (err) {
      console.warn("AI Provider API call failed or timed out. Falling back to deterministic math engine:", err.message);
    }
  }

  // 2. Deterministic & Symbolic Math Engine Fallback
  // Handles arithmetic, percentages, algebra, quadratics, geometry, calculus, statistics, fractions, and contextual follow-ups!
  const solved = solveOrVerify(lastUserMessage, messages, level);
  if (solved && solved.success) {
    let reply = `Hello! 🦉 Let's solve and understand this step by step:\n\n`;

    if (solved.formula) {
      reply += `**Key Mathematical Formula:**\n$$${solved.formula}$$\n\n`;
    }

    reply += `**Step-by-Step Solution:**\n`;
    solved.steps.forEach((step, i) => {
      reply += `${i + 1}. ${step}\n\n`;
    });

    reply += `### Final Answer\n**${solved.finalAnswer}**\n\n`;

    if (solved.explanation) {
      reply += `💡 **Simple Explanation:** ${solved.explanation}\n\n`;
    }

    if (solved.similarProblem) {
      reply += `🎯 **Practice Challenge for You:** *${solved.similarProblem}*`;
    }

    // Stream the deterministic response progressively
    if (onToken) {
      const tokens = reply.split(" ");
      for (const token of tokens) {
        if (signal?.aborted) break;
        onToken(token + " ");
        await new Promise((r) => setTimeout(r, 16));
      }
    }

    return {
      content: reply,
      source: "symbolic_math",
      steps: solved.steps,
      finalAnswer: solved.finalAnswer,
      formula: solved.formula,
      gameLink: solved.gameLink || null,
    };
  }

  // 3. Fallback when query is outside deterministic solver and AI API key is unconfigured
  let fallbackReply =
    `Hello math adventurer! 🦉 I am Professor Pi.\n\n` +
    `I received your question: **"${lastUserMessage}"**.\n\n` +
    `Currently, I am operating in **Deterministic Math Engine Mode**.\n` +
    `To enable general conversational AI similar to ChatGPT with full free-form chat across any topic, set \`AI_ENABLED=true\` and add your valid \`AI_API_KEY\` (or OpenAI / Groq / OpenRouter key) in \`server/.env\`.\n\n` +
    `### What I Can Solve Deterministically Right Now:\n` +
    `• **Arithmetic & Powers:** *"What is 25 × 48?"* or *"1500 - 875"*\n` +
    `• **Percentages & Discounts:** *"What is 15% of 800?"* or *"20% of 450"*\n` +
    `• **Linear Equations:** *"Solve 2x + 5 = 17"* or *"3x - 7 = 11"*\n` +
    `• **Quadratic Equations:** *"Solve x^2 - 5x + 6 = 0"*\n` +
    `• **Fraction Arithmetic & Visuals:** *"Add 1/2 + 1/3"* or *"Explain fractions using a pizza example"*\n` +
    `• **Geometry & Mensuration:** *"Find the area of a circle with radius 7 cm"* or *"Pythagorean theorem"*\n` +
    `• **Statistics:** *"Find the mean, median, and mode of 10, 20, 20, 30, 40"*\n` +
    `• **Calculus:** *"Differentiate x^3 + 2x"* or *"Integrate 2x + 3"*\n` +
    `• **Follow-ups:** Click **Explain More Simply**, **Show Another Method**, or **Give Another Example**!\n\n` +
    `Which question would you like to explore next?`;

  if (onToken) {
    const tokens = fallbackReply.split(" ");
    for (const token of tokens) {
      if (signal?.aborted) break;
      onToken(token + " ");
      await new Promise((r) => setTimeout(r, 14));
    }
  }

  return {
    content: fallbackReply,
    source: "symbolic_math",
    steps: [],
    finalAnswer: "",
    formula: "",
  };
}

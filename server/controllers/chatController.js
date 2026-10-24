// server/controllers/chatController.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import LearningProgress from "../models/LearningProgress.js";
import { generateChatResponse } from "../services/aiService.js";
import { solveOrVerify } from "../services/mathService.js";

/**
 * Extract numbered steps and final answer from markdown content
 */
function extractStepsAndFinalAnswer(content) {
  const steps = [];
  let finalAnswer = "";

  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+\.\s+/.test(trimmed)) {
      steps.push(trimmed.replace(/^\d+\.\s+/, ""));
    } else if (trimmed.startsWith("### Final Answer") || trimmed.startsWith("**Final Answer")) {
      finalAnswer = trimmed;
    }
  }

  // Check for Final Answer block if not captured in single line
  const faMatch = content.match(/### Final Answer\s*\n+([\s\S]*?)(?:\n\n|$)/i);
  if (faMatch && faMatch[1]) {
    finalAnswer = faMatch[1].trim();
  }

  return { steps, finalAnswer };
}

/**
 * Send a chat message (supports SSE streaming and JSON)
 */
export async function handleChatMessage(req, res) {
  try {
    const {
      conversationId: reqConvId,
      message,
      level = "middle",
      topic = "General Math",
      stream = false,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a valid math question." });
    }

    const userId = req.user?.id || null;
    let conversation = null;

    // 1. Find or create conversation
    if (reqConvId) {
      conversation = await Conversation.findById(reqConvId);
    }

    if (!conversation) {
      const title = message.trim().slice(0, 40) + (message.length > 40 ? "..." : "");
      conversation = await Conversation.create({
        userId,
        title,
        level,
        topic,
      });
    } else {
      conversation.updatedAt = new Date();
      if (level && conversation.level !== level) conversation.level = level;
      await conversation.save();
    }

    // 2. Fetch past conversation messages for multi-turn context
    const pastMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const historyForModel = pastMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Add current user message
    historyForModel.push({ role: "user", content: message.trim() });

    // Save user message to database
    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message.trim(),
    });

    // 3. Handle Streaming (SSE)
    const wantsStream = stream === true || req.headers.accept === "text/event-stream";

    if (wantsStream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      let fullContent = "";

      const result = await generateChatResponse({
        messages: historyForModel,
        level: conversation.level || level,
        onToken: (token) => {
          fullContent += token;
          res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`);
        },
      });

      const responseText = fullContent || result.content;
      const { steps, finalAnswer } = extractStepsAndFinalAnswer(responseText);

      // Save assistant message to database
      const assistantMsg = await Message.create({
        conversationId: conversation._id,
        role: "assistant",
        content: responseText,
        steps: result.steps?.length ? result.steps : steps,
        finalAnswer: result.finalAnswer || finalAnswer,
        formula: result.formula || "",
        source: result.source || "ai",
      });

      // Update progress if user is authenticated
      if (userId) {
        await LearningProgress.findOneAndUpdate(
          { userId, topic: conversation.topic || "General Math" },
          {
            $inc: { questionsAttempted: 1 },
            $addToSet: { topicsPracticed: conversation.topic || "General Math" },
          },
          { upsert: true }
        );
      }

      res.write(
        `data: ${JSON.stringify({
          type: "done",
          conversationId: conversation._id,
          messageId: assistantMsg._id,
          content: responseText,
          steps: assistantMsg.steps,
          finalAnswer: assistantMsg.finalAnswer,
          formula: assistantMsg.formula,
          source: assistantMsg.source,
        })}\n\n`
      );

      return res.end();
    }

    // 4. Standard Non-Streaming JSON Response
    const result = await generateChatResponse({
      messages: historyForModel,
      level: conversation.level || level,
    });

    const { steps, finalAnswer } = extractStepsAndFinalAnswer(result.content);

    const assistantMsg = await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: result.content,
      steps: result.steps?.length ? result.steps : steps,
      finalAnswer: result.finalAnswer || finalAnswer,
      formula: result.formula || "",
      source: result.source || "ai",
    });

    if (userId) {
      await LearningProgress.findOneAndUpdate(
        { userId, topic: conversation.topic || "General Math" },
        {
          $inc: { questionsAttempted: 1 },
          $addToSet: { topicsPracticed: conversation.topic || "General Math" },
        },
        { upsert: true }
      );
    }

    return res.json({
      success: true,
      conversationId: conversation._id,
      messageId: assistantMsg._id,
      answer: result.content,
      steps: assistantMsg.steps,
      finalAnswer: assistantMsg.finalAnswer,
      formula: assistantMsg.formula,
      source: assistantMsg.source,
    });
  } catch (err) {
    console.error("Chat Controller Error:", err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Professor Pi encountered an error processing your mathematical query.",
        error: err.message,
      });
    }
    res.end();
  }
}

/**
 * List conversations
 */
export async function getConversations(req, res) {
  try {
    const userId = req.user?.id || null;
    const filter = userId ? { userId } : {};
    const conversations = await Conversation.find(filter)
      .sort({ updatedAt: -1 })
      .limit(30);

    return res.json({ success: true, conversations });
  } catch (err) {
    console.error("Get Conversations Error:", err);
    return res.status(500).json({ success: false, message: "Error fetching conversations" });
  }
}

/**
 * Create a new conversation thread
 */
export async function createConversation(req, res) {
  try {
    const { title = "New Math Chat", level = "middle", topic = "General Math" } = req.body;
    const userId = req.user?.id || null;

    const conversation = await Conversation.create({
      userId,
      title,
      level,
      topic,
    });

    return res.status(201).json({ success: true, conversation });
  } catch (err) {
    console.error("Create Conversation Error:", err);
    return res.status(500).json({ success: false, message: "Error creating conversation" });
  }
}

/**
 * Get a specific conversation with all its messages
 */
export async function getConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    // Security check: if conversation has userId and requester is logged in, ensure matching
    if (conversation.userId && req.user?.id && conversation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied to this conversation" });
    }

    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      conversation,
      messages,
    });
  } catch (err) {
    console.error("Get Conversation Error:", err);
    return res.status(500).json({ success: false, message: "Error loading conversation" });
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.userId && req.user?.id && conversation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied to delete this conversation" });
    }

    await Promise.all([
      Conversation.findByIdAndDelete(id),
      Message.deleteMany({ conversationId: id }),
    ]);

    return res.json({ success: true, message: "Conversation and messages deleted successfully" });
  } catch (err) {
    console.error("Delete Conversation Error:", err);
    return res.status(500).json({ success: false, message: "Error deleting conversation" });
  }
}

/**
 * Submit feedback on a message
 */
export async function submitFeedback(req, res) {
  try {
    const { messageId, feedback } = req.body;

    if (!["up", "down", null].includes(feedback)) {
      return res.status(400).json({ success: false, message: "Feedback must be 'up' or 'down'" });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { feedback },
      { returnDocument: "after" }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.json({ success: true, feedback: updated.feedback });
  } catch (err) {
    console.error("Submit Feedback Error:", err);
    return res.status(500).json({ success: false, message: "Error submitting feedback" });
  }
}

/**
 * Generate practice quiz questions based on topic
 */
export async function generateQuiz(req, res) {
  try {
    const { topic = "Algebra", level = "middle", count = 3 } = req.body;

    const sampleQuizzes = {
      algebra: [
        {
          question: "Solve for x: 3x - 7 = 11",
          options: ["x = 4", "x = 6", "x = 9", "x = 18"],
          correctAnswer: "x = 6",
          explanation: "Add 7 to both sides: 3x = 18. Divide by 3: x = 6.",
        },
        {
          question: "Solve for y: 2y + 8 = 20",
          options: ["y = 4", "y = 6", "y = 8", "y = 12"],
          correctAnswer: "y = 6",
          explanation: "Subtract 8 from both sides: 2y = 12. Divide by 2: y = 6.",
        },
        {
          question: "If 5z = 45, what is the value of z + 5?",
          options: ["9", "14", "15", "50"],
          correctAnswer: "14",
          explanation: "z = 45 / 5 = 9. Therefore, z + 5 = 9 + 5 = 14.",
        },
      ],
      fractions: [
        {
          question: "What is 1/2 + 1/3?",
          options: ["2/5", "5/6", "1/6", "3/5"],
          correctAnswer: "5/6",
          explanation: "Find common denominator 6: 3/6 + 2/6 = 5/6.",
        },
        {
          question: "What is 3/4 - 1/4 in simplest form?",
          options: ["2/4", "1/2", "1/4", "2/0"],
          correctAnswer: "1/2",
          explanation: "3/4 - 1/4 = 2/4. Divide top and bottom by 2 to get 1/2.",
        },
        {
          question: "What is 2/3 × 3/4?",
          options: ["6/12", "1/2", "5/7", "8/9"],
          correctAnswer: "1/2",
          explanation: "2 × 3 = 6, 3 × 4 = 12. 6/12 simplifies to 1/2.",
        },
      ],
      geometry: [
        {
          question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
          options: ["26 cm²", "40 cm²", "13 cm²", "80 cm²"],
          correctAnswer: "40 cm²",
          explanation: "Area = length × width = 8 × 5 = 40 cm².",
        },
        {
          question: "In a right triangle with legs a = 3 and b = 4, what is hypotenuse c?",
          options: ["5", "7", "12", "25"],
          correctAnswer: "5",
          explanation: "c² = a² + b² = 9 + 16 = 25. c = √25 = 5.",
        },
        {
          question: "What is the perimeter of a square with side length 9 m?",
          options: ["18 m", "36 m", "81 m", "27 m"],
          correctAnswer: "36 m",
          explanation: "Perimeter = 4 × side = 4 × 9 = 36 m.",
        },
      ],
    };

    const key = topic.toLowerCase().includes("fraction")
      ? "fractions"
      : topic.toLowerCase().includes("geo")
      ? "geometry"
      : "algebra";

    const questions = sampleQuizzes[key].slice(0, count);

    return res.json({
      success: true,
      topic,
      level,
      questions,
    });
  } catch (err) {
    console.error("Generate Quiz Error:", err);
    return res.status(500).json({ success: false, message: "Error generating quiz" });
  }
}

/**
 * Verify mathematical expression using symbolic engine
 */
export async function verifyMath(req, res) {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a math expression to verify" });
    }

    const result = solveOrVerify(query);

    if (!result) {
      return res.json({
        success: false,
        verified: false,
        message: "Could not symbolically verify with current solver rules. Try standard form like '3x - 7 = 11' or '1/2 + 1/3'.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      ...result,
    });
  } catch (err) {
    console.error("Verify Math Error:", err);
    return res.status(500).json({ success: false, message: "Error during mathematical verification" });
  }
}

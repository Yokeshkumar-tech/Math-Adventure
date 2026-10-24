// server/controllers/chatController.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import LearningProgress from "../models/LearningProgress.js";
import { generateChatResponse } from "../services/aiService.js";
import { solveOrVerify } from "../services/mathService.js";
import { broadcastActivity } from "../services/socketService.js";

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
 * Send a chat message (supports SSE streaming and JSON fallback)
 */
export async function handleChatMessage(req, res) {
  const abortController = new AbortController();

  // If the client disconnects, abort the internal stream
  req.on("close", () => {
    abortController.abort();
  });

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

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: "Question exceeds maximum character length (2000 chars)." });
    }

    const userId = req.user?.id || null;
    let conversation = null;

    // 1. Find or create conversation
    if (reqConvId) {
      conversation = await Conversation.findById(reqConvId);
      // Ownership check: if owned by a registered user, ensure requester matches
      if (conversation && conversation.userId && userId && conversation.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Access denied to this conversation" });
      }
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
      .limit(12);

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
        signal: abortController.signal,
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
        metadata: {
          gameLink: result.gameLink || null,
        },
      });

      // Update student learning progress if user is authenticated
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
          gameLink: result.gameLink || null,
        })}\n\n`
      );

      broadcastActivity({
        eventType: "tutor_query",
        category: "tutor",
        playerId: userId,
        playerName: req.user?.nickname || req.user?.name || "Student Adventurer",
        title: "Professor Pi answered question",
        description: message.slice(0, 60),
        topic: conversation.topic || "General Math",
        activityId: String(assistantMsg._id),
      });

      return res.end();
    }

    // 4. Standard Non-Streaming JSON Response
    const result = await generateChatResponse({
      messages: historyForModel,
      level: conversation.level || level,
      signal: abortController.signal,
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
      metadata: {
        gameLink: result.gameLink || null,
      },
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
      gameLink: result.gameLink || null,
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
 * List conversations (enforces user ownership when authenticated)
 */
export async function getConversations(req, res) {
  try {
    const userId = req.user?.id || null;
    const filter = userId ? { userId } : { userId: null };
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
 * Rename a conversation
 */
export async function renameConversation(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "A valid title is required" });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conversation.userId && req.user?.id && conversation.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied to rename this conversation" });
    }

    conversation.title = title.trim();
    await conversation.save();

    return res.json({ success: true, conversation });
  } catch (err) {
    console.error("Rename Conversation Error:", err);
    return res.status(500).json({ success: false, message: "Error renaming conversation" });
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
          question: "Solve for x: 2x + 5 = 17",
          options: ["x = 5", "x = 6", "x = 7", "x = 12"],
          correctAnswer: "x = 6",
          explanation: "Subtract 5 from both sides: 2x = 12. Divide by 2: x = 6.",
        },
        {
          question: "Solve for x: 3x - 7 = 11",
          options: ["x = 4", "x = 6", "x = 9", "x = 18"],
          correctAnswer: "x = 6",
          explanation: "Add 7 to both sides: 3x = 18. Divide by 3: x = 6.",
        },
        {
          question: "Solve for y: 5y + 10 = 35",
          options: ["y = 3", "y = 5", "y = 7", "y = 9"],
          correctAnswer: "y = 5",
          explanation: "Subtract 10 from both sides: 5y = 25. Divide by 5: y = 5.",
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
          question: "What is the area of a circle with radius 7 cm (using π ≈ 22/7)?",
          options: ["44 cm²", "154 cm²", "49 cm²", "308 cm²"],
          correctAnswer: "154 cm²",
          explanation: "Area = πr² = (22/7) × 7 × 7 = 22 × 7 = 154 cm².",
        },
        {
          question: "In a right triangle with legs a = 3 and b = 4, what is hypotenuse c?",
          options: ["5", "7", "12", "25"],
          correctAnswer: "5",
          explanation: "c² = a² + b² = 9 + 16 = 25. c = √25 = 5.",
        },
        {
          question: "What is the perimeter of a rectangle with length 8 cm and width 5 cm?",
          options: ["13 cm", "26 cm", "40 cm", "80 cm"],
          correctAnswer: "26 cm",
          explanation: "Perimeter = 2 × (length + width) = 2 × (8 + 5) = 26 cm.",
        },
      ],
      percentages: [
        {
          question: "What is 15% of 800?",
          options: ["100", "120", "140", "150"],
          correctAnswer: "120",
          explanation: "(15 / 100) × 800 = 15 × 8 = 120.",
        },
        {
          question: "What is 25% of 240?",
          options: ["40", "60", "80", "120"],
          correctAnswer: "60",
          explanation: "25% = 1/4. 240 ÷ 4 = 60.",
        },
      ],
    };

    const key = topic.toLowerCase().includes("fraction")
      ? "fractions"
      : topic.toLowerCase().includes("geo")
      ? "geometry"
      : topic.toLowerCase().includes("percent")
      ? "percentages"
      : "algebra";

    const questions = (sampleQuizzes[key] || sampleQuizzes.algebra).slice(0, count);

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
        message: "Could not symbolically verify with current solver rules. Try standard form like '2x + 5 = 17' or '1/2 + 1/3'.",
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

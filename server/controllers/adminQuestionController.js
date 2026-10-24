import Question from "../models/Question.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";
import { broadcastActivity } from "../services/socketService.js";

export async function listQuestions(req, res) {
  try {
    const {
      page = 1,
      limit = 15,
      search = "",
      topic,
      realm,
      difficulty,
      status,
      grade,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        { question: { $regex: search.trim(), $options: "i" } },
        { topic: { $regex: search.trim(), $options: "i" } },
        { title: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (topic && topic !== "all") {
      query.topic = { $regex: new RegExp(`^${topic.trim()}$`, "i") };
    }

    if (realm && realm !== "all") {
      query.realm = { $regex: new RegExp(`^${realm.trim()}$`, "i") };
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty.toLowerCase();
    }

    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    if (grade && grade !== "all") {
      query.grade = Number(grade);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [questions, total] = await Promise.all([
      Question.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Question.countDocuments(query),
    ]);

    const distinctTopics = await Question.distinct("topic");
    const distinctRealms = await Question.distinct("realm");

    res.json({
      questions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        topics: distinctTopics.filter(Boolean),
        realms: distinctRealms.filter(Boolean),
      },
    });
  } catch (err) {
    console.error("List questions error:", err);
    res.status(500).json({ message: "Failed to load questions." });
  }
}

export async function getQuestionById(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: "Error retrieving question details." });
  }
}

export async function createQuestion(req, res) {
  try {
    const {
      title,
      question,
      topic,
      realm,
      grade = 5,
      difficulty = "easy",
      answerType = "multiple_choice",
      options = [],
      correctAnswer,
      explanation,
      hint,
      hints = {},
      points = 10,
      expression,
      formula,
      stepByStep = [],
      commonMistakes,
      realLifeExample,
      diagramSvg,
      status = "published",
    } = req.body;

    if (!question || !topic || !correctAnswer || !explanation) {
      return res.status(400).json({ message: "Question text, topic, correct answer, and explanation are required." });
    }

    // Validation for multiple choice
    if (answerType === "multiple_choice") {
      if (!options || options.length < 2) {
        return res.status(400).json({ message: "Multiple choice questions require at least 2 options." });
      }
      const trimmedOpts = options.map((o) => String(o).trim());
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size !== trimmedOpts.length) {
        return res.status(400).json({ message: "Duplicate answer options are not allowed." });
      }
      if (!trimmedOpts.includes(String(correctAnswer).trim())) {
        return res.status(400).json({ message: "Correct answer must match one of the provided options exactly." });
      }
    }

    const newQuestion = await Question.create({
      title: title || `${topic} Problem`,
      question: question.trim(),
      topic: topic.trim(),
      realm: realm ? realm.trim() : "",
      grade: Number(grade) || 5,
      difficulty,
      answerType,
      options: options.map((o) => String(o).trim()),
      correctAnswer: String(correctAnswer).trim(),
      explanation: explanation.trim(),
      hint: hint || "Break the problem down step by step!",
      hints: {
        clue: hints.clue || null,
        concept: hints.concept || null,
        workedExample: hints.workedExample || null,
      },
      points: Number(points) || 10,
      expression: expression || null,
      formula: formula || null,
      stepByStep: Array.isArray(stepByStep) ? stepByStep : [],
      commonMistakes: commonMistakes || null,
      realLifeExample: realLifeExample || null,
      diagramSvg: diagramSvg || null,
      status,
      version: 1,
      createdBy: req.admin._id,
      publishedAt: status === "published" ? new Date() : null,
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_QUESTION",
      resourceType: "question",
      resourceId: newQuestion._id,
      changeSummary: `Created ${difficulty} question in topic "${topic}": "${newQuestion.question.slice(0, 40)}..."`,
      req,
    });

    res.status(201).json({ question: newQuestion, message: "Question created successfully." });
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ message: err.message || "Failed to create question." });
  }
}

export async function updateQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const {
      title,
      question: qText,
      topic,
      realm,
      grade,
      difficulty,
      answerType,
      options,
      correctAnswer,
      explanation,
      hint,
      hints,
      points,
      expression,
      formula,
      stepByStep,
      commonMistakes,
      realLifeExample,
      diagramSvg,
      status,
    } = req.body;

    if (options && (answerType === "multiple_choice" || question.answerType === "multiple_choice")) {
      const trimmedOpts = options.map((o) => String(o).trim());
      const uniqueOpts = new Set(trimmedOpts);
      if (uniqueOpts.size !== trimmedOpts.length) {
        return res.status(400).json({ message: "Duplicate answer options are not allowed." });
      }
      const effectiveAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
      if (!trimmedOpts.includes(String(effectiveAnswer).trim())) {
        return res.status(400).json({ message: "Correct answer must match one of the options." });
      }
      question.options = trimmedOpts;
    }

    if (title !== undefined) question.title = title;
    if (qText !== undefined) question.question = qText.trim();
    if (topic !== undefined) question.topic = topic.trim();
    if (realm !== undefined) question.realm = realm.trim();
    if (grade !== undefined) question.grade = Number(grade);
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (answerType !== undefined) question.answerType = answerType;
    if (correctAnswer !== undefined) question.correctAnswer = String(correctAnswer).trim();
    if (explanation !== undefined) question.explanation = explanation.trim();
    if (hint !== undefined) question.hint = hint;
    if (hints !== undefined) question.hints = { ...question.hints, ...hints };
    if (points !== undefined) question.points = Number(points);
    if (expression !== undefined) question.expression = expression;
    if (formula !== undefined) question.formula = formula;
    if (stepByStep !== undefined) question.stepByStep = stepByStep;
    if (commonMistakes !== undefined) question.commonMistakes = commonMistakes;
    if (realLifeExample !== undefined) question.realLifeExample = realLifeExample;
    if (diagramSvg !== undefined) question.diagramSvg = diagramSvg;
    if (status !== undefined) {
      if (status === "published" && question.status !== "published") {
        question.publishedAt = new Date();
      }
      question.status = status;
    }

    question.version = (question.version || 1) + 1;
    question.updatedBy = req.admin._id;

    await question.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_QUESTION",
      resourceType: "question",
      resourceId: question._id,
      changeSummary: `Updated question "${question.question.slice(0, 40)}..." (Version ${question.version})`,
      req,
    });

    res.json({ question, message: "Question updated successfully." });
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ message: err.message || "Failed to update question." });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    await Question.findByIdAndDelete(req.params.id);

    await createAuditRecord({
      actor: req.admin,
      action: "DELETE_QUESTION",
      resourceType: "question",
      resourceId: req.params.id,
      changeSummary: `Deleted question ID ${req.params.id}: "${question.question.slice(0, 40)}..."`,
      req,
    });

    res.json({ message: "Question deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete question." });
  }
}

export async function togglePublish(req, res) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    const nextStatus = question.status === "published" ? "draft" : "published";
    question.status = nextStatus;
    if (nextStatus === "published") question.publishedAt = new Date();
    await question.save();

    await createAuditRecord({
      actor: req.admin,
      action: nextStatus === "published" ? "PUBLISH_QUESTION" : "UNPUBLISH_QUESTION",
      resourceType: "question",
      resourceId: question._id,
      changeSummary: `Changed status of question to '${nextStatus}'`,
      req,
    });

    if (nextStatus === "published") {
      broadcastActivity({
        eventType: "admin_publish",
        category: "admin",
        title: "Question published to student game",
        description: `New ${question.difficulty} question active in ${question.topic}`,
        topic: question.topic,
        activityId: String(question._id),
      });
    }

    res.json({ question, message: `Question is now ${nextStatus}.` });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle publication status." });
  }
}

// Bulk Upload: Step 1 Preview and Validate without committing
export async function previewImport(req, res) {
  try {
    const { rows = [] } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "No data rows provided for preview." });
    }

    const previewResults = [];
    let validCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors = [];

      const qText = row.question_text || row.question;
      const topic = row.topic;
      const difficulty = (row.difficulty || "easy").toLowerCase();
      const correctAnswer = String(row.correct_answer || row.correctAnswer || "").trim();
      const explanation = row.explanation;

      // Extract options
      let options = [];
      if (Array.isArray(row.options)) {
        options = row.options.map(String).map((s) => s.trim());
      } else {
        const optKeys = ["option_a", "option_b", "option_c", "option_d", "opt1", "opt2", "opt3", "opt4"];
        options = optKeys.map((k) => row[k]).filter(Boolean).map(String).map((s) => s.trim());
      }

      if (!qText || String(qText).trim().length < 5) {
        errors.push("Question text is required (min 5 characters).");
      }
      if (!topic || String(topic).trim().length < 2) {
        errors.push("Topic is required.");
      }
      if (!["easy", "medium", "hard", "boss"].includes(difficulty)) {
        errors.push(`Invalid difficulty '${difficulty}'. Must be easy, medium, hard, or boss.`);
      }
      if (!correctAnswer) {
        errors.push("Correct answer is required.");
      }
      if (options.length < 2) {
        errors.push("At least two answer options are required.");
      } else {
        const uniqueSet = new Set(options);
        if (uniqueSet.size !== options.length) {
          errors.push("Duplicate answer options detected.");
        }
        if (!options.includes(correctAnswer)) {
          errors.push(`Correct answer '${correctAnswer}' does not match any of the options [${options.join(", ")}].`);
        }
      }
      if (!explanation || String(explanation).trim().length < 5) {
        errors.push("Explanation is required.");
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else errorCount++;

      previewResults.push({
        rowIndex: i + 1,
        question: qText,
        topic,
        realm: row.realm || "Number Forest",
        difficulty,
        options,
        correctAnswer,
        explanation,
        hint: row.hint || "Think step by step",
        points: Number(row.points) || 10,
        isValid,
        errors,
      });
    }

    res.json({
      totalRows: rows.length,
      validCount,
      errorCount,
      rows: previewResults,
    });
  } catch (err) {
    console.error("Preview import error:", err);
    res.status(500).json({ message: "Failed to parse and validate import rows." });
  }
}

// Bulk Upload: Step 2 Commit validated rows
export async function commitImport(req, res) {
  try {
    const { rows = [], defaultStatus = "published" } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "No validated rows provided for commit." });
    }

    const toInsert = rows.map((r) => ({
      title: r.title || `${r.topic} Challenge`,
      question: String(r.question).trim(),
      topic: String(r.topic).trim(),
      realm: r.realm ? String(r.realm).trim() : "Number Forest",
      grade: Number(r.grade) || 5,
      difficulty: r.difficulty || "easy",
      answerType: "multiple_choice",
      options: r.options.map(String).map((s) => s.trim()),
      correctAnswer: String(r.correctAnswer).trim(),
      explanation: String(r.explanation).trim(),
      hint: r.hint || "Break the problem down step by step!",
      hints: {
        clue: r.hint || null,
        concept: null,
        workedExample: null,
      },
      points: Number(r.points) || 10,
      status: defaultStatus,
      version: 1,
      source: "bulk_import",
      createdBy: req.admin._id,
      publishedAt: defaultStatus === "published" ? new Date() : null,
    }));

    const inserted = await Question.insertMany(toInsert);

    await createAuditRecord({
      actor: req.admin,
      action: "BULK_IMPORT_QUESTIONS",
      resourceType: "question",
      changeSummary: `Bulk imported ${inserted.length} questions (Status: ${defaultStatus})`,
      metadata: { count: inserted.length, status: defaultStatus },
      req,
    });

    res.status(201).json({
      message: `Successfully imported ${inserted.length} questions into the question bank.`,
      insertedCount: inserted.length,
    });
  } catch (err) {
    console.error("Commit import error:", err);
    res.status(500).json({ message: "Failed to commit question import." });
  }
}

// Export Questions in JSON
export async function exportQuestions(req, res) {
  try {
    const { topic, difficulty, status } = req.query;
    const filter = {};
    if (topic && topic !== "all") filter.topic = topic;
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (status && status !== "all") filter.status = status;

    const questions = await Question.find(filter).lean();
    res.json({
      exportDate: new Date(),
      count: questions.length,
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to export questions." });
  }
}

// Download Sample Template for CSV / JSON
export async function getImportTemplate(req, res) {
  const sampleData = [
    {
      question_text: "What is the perimeter of a square with side 6 cm?",
      topic: "Area and Perimeter",
      realm: "Geometry Mountains",
      difficulty: "easy",
      option_a: "18 cm",
      option_b: "20 cm",
      option_c: "24 cm",
      option_d: "36 cm",
      correct_answer: "24 cm",
      hint: "A square has four equal sides. Multiply side length by 4.",
      explanation: "Perimeter of square = 4 × side = 4 × 6 = 24 cm.",
      points: 10,
    },
    {
      question_text: "What is 3/4 + 2/4 in simplest form?",
      topic: "Fractions",
      realm: "Fraction Kingdom",
      difficulty: "easy",
      option_a: "5/8",
      option_b: "5/4",
      option_c: "6/4",
      option_d: "1/4",
      correct_answer: "5/4",
      hint: "With equal denominators, add the numerators 3 + 2.",
      explanation: "Keep the denominator 4 and add numerators 3 + 2 = 5, giving 5/4.",
      points: 10,
    },
  ];

  res.json({ template: sampleData });
}

// server/controllers/lessonController.js
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { awardPoints } from "../config/scoring.js";
import { checkAchievements } from "../utils/achievements.js";

export async function getTopicsForGrade(req, res) {
  try {
    const grade = Number(req.params.grade);
    if (![5, 6].includes(grade)) {
      return res.status(400).json({ message: "Grade must be 5 or 6" });
    }

    const lessons = await Lesson.find({ grade, published: true }).sort({ createdAt: 1 }).lean();
    const user = await User.findById(req.user.id).lean();
    const completedLessonIds = (user?.completedLessons || []).map(String);

    const attempts = await QuizAttempt.find({ userId: req.user.id, grade }).lean();

    const topicsWithProgress = lessons.map((l) => {
      const topicAttempts = attempts.filter((a) => a.topic.toLowerCase() === l.topic.toLowerCase());
      const isLessonCompleted = completedLessonIds.includes(String(l._id));
      const hasQuizAttempt = topicAttempts.length > 0;
      const bestAccuracy = hasQuizAttempt ? Math.max(...topicAttempts.map((a) => a.accuracy)) : 0;

      let status = "not-started";
      if (bestAccuracy >= 80 || (isLessonCompleted && hasQuizAttempt)) {
        status = "completed";
      } else if (isLessonCompleted || hasQuizAttempt) {
        status = "in-progress";
      }

      return {
        id: l._id,
        topic: l.topic,
        slug: l.slug,
        grade: l.grade,
        difficulty: l.difficulty,
        objectives: l.objectives,
        infographicType: l.infographicType,
        estimatedMinutes: l.estimatedMinutes,
        status,
        bestAccuracy,
        attemptsCount: topicAttempts.length,
      };
    });

    res.json(topicsWithProgress);
  } catch (err) {
    console.error("Get topics error:", err);
    res.status(500).json({ message: "Server error retrieving topics" });
  }
}

export async function getLessonById(req, res) {
  try {
    const { id } = req.params;
    let lesson;

    // Check if id is mongo ObjectId or slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      lesson = await Lesson.findById(id).lean();
    } else {
      lesson = await Lesson.findOne({ slug: id }).lean();
    }

    if (!lesson) {
      return res.status(404).json({ message: "We could not find that lesson." });
    }

    const user = await User.findById(req.user.id).lean();
    const isCompleted = (user?.completedLessons || []).some(
      (cid) => String(cid) === String(lesson._id)
    );

    res.json({
      ...lesson,
      completed: isCompleted,
    });
  } catch (err) {
    console.error("Get lesson error:", err);
    res.status(500).json({ message: "Error fetching lesson details." });
  }
}

export async function completeLesson(req, res) {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const user = await User.findById(req.user.id);
    const alreadyCompleted = user.completedLessons.some((cid) => String(cid) === String(lesson._id));

    let pointsAwarded = 0;
    if (!alreadyCompleted) {
      user.completedLessons.push(lesson._id);
      await user.save();
      const awarded = await awardPoints(user._id, `lesson:${lesson._id}`, 25);
      if (awarded) pointsAwarded = 25;
    }

    const updatedUser = await User.findById(req.user.id);
    const newBadges = await checkAchievements(user._id);

    res.json({
      message: "Lesson completed! Well done! 🎉",
      pointsAwarded,
      totalPoints: updatedUser.totalPoints,
      newBadges,
    });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ message: "Error completing lesson." });
  }
}

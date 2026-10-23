// server/utils/recommend.js
import QuizAttempt from "../models/QuizAttempt.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";

export async function topicStats(userId, grade = 5) {
  const lessons = await Lesson.find({ grade }).lean();
  const attempts = await QuizAttempt.find({ userId }).lean();

  return lessons.map((lesson) => {
    const topicAttempts = attempts.filter((a) => a.topic.toLowerCase() === lesson.topic.toLowerCase());
    const totalAttempts = topicAttempts.length;
    const avgAccuracy =
      totalAttempts > 0
        ? Math.round(topicAttempts.reduce((s, a) => s + a.accuracy, 0) / totalAttempts)
        : 0;
    const bestAccuracy = totalAttempts > 0 ? Math.max(...topicAttempts.map((a) => a.accuracy)) : 0;
    const completed = bestAccuracy >= 80;

    return {
      topic: lesson.topic,
      slug: lesson.slug,
      lessonId: lesson._id,
      attempts: totalAttempts,
      accuracy: avgAccuracy,
      bestAccuracy,
      completed,
    };
  });
}

export async function recommend(userId) {
  const user = await User.findById(userId).lean();
  const grade = user?.grade || 5;
  const stats = await topicStats(userId, grade);

  // 1. Weakest topic with accuracy < 70%
  const weak = stats
    .filter((t) => t.attempts > 0 && t.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)[0];

  if (weak) {
    return {
      type: "revise",
      topic: weak.topic,
      slug: weak.slug,
      lessonId: weak.lessonId,
      message: `Let's practise ${weak.topic} again — you can do it! 🚀`,
      difficulty: "medium",
    };
  }

  // 2. Next unfinished topic
  const next = stats.find((t) => !t.completed);
  if (next) {
    return {
      type: "lesson",
      topic: next.topic,
      slug: next.slug,
      lessonId: next.lessonId,
      message: `Next adventure: Master ${next.topic}! 🌟`,
      difficulty: "easy",
    };
  }

  // 3. All finished - challenge mode!
  return {
    type: "challenge",
    topic: stats[0]?.topic || "Fractions",
    message: "Awesome job! Try the Math Champion challenge at hard level! 🏆",
    difficulty: "hard",
  };
}

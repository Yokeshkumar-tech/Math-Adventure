// server/controllers/worldController.js
import World from "../models/World.js";
import Mission from "../models/Mission.js";
import PlayerProgress from "../models/PlayerProgress.js";
import User from "../models/User.js";

export async function getAllWorlds(req, res) {
  try {
    const user = await User.findById(req.user.id).lean();
    const worlds = await World.find().sort({ order: 1 }).lean();
    const progressList = await PlayerProgress.find({ playerId: req.user.id }).lean();

    const progressMap = new Map();
    progressList.forEach((p) => {
      progressMap.set(String(p.missionId), p);
    });

    const userStars = user?.totalStars || 0;
    const unlockedList = user?.unlockedWorlds || ["number-forest"];

    const enrichedWorlds = await Promise.all(
      worlds.map(async (w) => {
        const missions = await Mission.find({ worldSlug: w.slug, isActive: true })
          .sort({ missionNumber: 1 })
          .lean();

        let worldStars = 0;
        let completedMissionsCount = 0;

        missions.forEach((m) => {
          const p = progressMap.get(String(m._id));
          if (p && p.completed) {
            completedMissionsCount++;
            worldStars += p.starsEarned || 0;
          }
        });

        // Check unlock status
        const isExplicitlyUnlocked = unlockedList.includes(w.slug);
        const hasEnoughStars = userStars >= (w.unlockRequirements?.minStars || 0);
        const isUnlocked = w.order === 1 || isExplicitlyUnlocked || hasEnoughStars;

        return {
          id: w._id,
          name: w.name,
          slug: w.slug,
          description: w.description,
          topic: w.topic,
          themeColor: w.themeColor,
          icon: w.icon,
          order: w.order,
          bossName: w.bossName,
          isUnlocked,
          minStarsRequired: w.unlockRequirements?.minStars || 0,
          totalMissions: missions.length,
          completedMissions: completedMissionsCount,
          starsEarned: worldStars,
          maxStars: missions.length * 3,
        };
      })
    );

    res.json({
      worlds: enrichedWorlds,
      playerStats: {
        totalStars: userStars,
        totalCoins: user?.totalCoins || 0,
        totalXP: user?.totalXP || 0,
        currentLevel: user?.currentLevel || 1,
      },
    });
  } catch (err) {
    console.error("Get worlds error:", err);
    res.status(500).json({ message: "Error loading adventure worlds." });
  }
}

export async function getWorldMissions(req, res) {
  try {
    const { worldSlug } = req.params;
    const slugAliases = {
      "percentage-desert": ["percentage-desert", "desert-of-numbers"],
      "desert-of-numbers": ["percentage-desert", "desert-of-numbers"],
      "geometry-mountains": ["geometry-mountains", "ocean-of-geometry"],
      "ocean-of-geometry": ["geometry-mountains", "ocean-of-geometry"],
      "probability-galaxy": ["probability-galaxy", "dragons-castle"],
      "dragons-castle": ["probability-galaxy", "dragons-castle"],
    };
    const possibleSlugs = slugAliases[worldSlug] || [worldSlug];
    const world = await World.findOne({ slug: { $in: possibleSlugs } }).lean();
    if (!world) {
      return res.status(404).json({ message: "Adventure world not found." });
    }

    const user = await User.findById(req.user.id).lean();
    const missions = await Mission.find({ worldSlug: { $in: possibleSlugs }, isActive: true })
      .sort({ missionNumber: 1 })
      .lean();

    const progressList = await PlayerProgress.find({ playerId: req.user.id }).lean();
    const progressMap = new Map();
    progressList.forEach((p) => {
      progressMap.set(String(p.missionId), p);
    });

    let previousCompleted = true; // First mission is always unlocked
    const enrichedMissions = missions.map((m, idx) => {
      const p = progressMap.get(String(m._id));
      const completed = p?.completed || false;
      const stars = p?.starsEarned || 0;
      const bestScore = p?.bestScore || 0;

      // Mission is unlocked if it's the first or previous mission is completed
      const unlocked = idx === 0 || previousCompleted;
      previousCompleted = completed;

      return {
        id: m._id,
        missionNumber: m.missionNumber,
        title: m.title,
        story: m.story,
        objective: m.objective,
        characterDialogue: m.characterDialogue,
        topic: m.topic,
        difficulty: m.difficulty,
        isBoss: m.isBoss,
        bossData: m.bossData,
        rewardRules: m.rewardRules,
        questionCount: m.questionIds?.length || 5,
        completed,
        starsEarned: stars,
        bestScore,
        unlocked,
      };
    });

    res.json({
      world,
      missions: enrichedMissions,
    });
  } catch (err) {
    console.error("Get world missions error:", err);
    res.status(500).json({ message: "Error fetching mission trail." });
  }
}

export async function getMissionById(req, res) {
  try {
    const { missionId } = req.params;
    const mission = await Mission.findById(missionId).lean();
    if (!mission) {
      return res.status(404).json({ message: "Mission not found." });
    }

    const progress = await PlayerProgress.findOne({
      playerId: req.user.id,
      missionId,
    }).lean();

    res.json({
      ...mission,
      progress: progress || { completed: false, starsEarned: 0, bestScore: 0 },
    });
  } catch (err) {
    console.error("Get mission error:", err);
    res.status(500).json({ message: "Error loading mission details." });
  }
}

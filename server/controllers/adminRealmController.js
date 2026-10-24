// server/controllers/adminRealmController.js
import World from "../models/World.js";
import Mission from "../models/Mission.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";

export async function listRealms(req, res) {
  try {
    const realms = await World.find().sort({ order: 1 }).lean();
    const missions = await Mission.find().lean();

    const enriched = realms.map((r) => {
      const realmMissions = missions.filter((m) => m.worldSlug === r.slug);
      return {
        ...r,
        missionCount: realmMissions.length,
        bossMission: realmMissions.find((m) => m.isBoss) || null,
      };
    });

    res.json({ realms: enriched });
  } catch (err) {
    res.status(500).json({ message: "Failed to list realms." });
  }
}

export async function createRealm(req, res) {
  try {
    const { name, slug, description, topic, order, themeColor, icon, unlockRequirements } = req.body;
    if (!name || !slug || !topic) {
      return res.status(400).json({ message: "Name, slug, and topic are required." });
    }

    const realm = await World.create({
      name,
      slug: slug.toLowerCase().trim(),
      description: description || "An exciting mathematics realm.",
      topic,
      order: Number(order) || 1,
      themeColor: themeColor || "#10B981",
      icon: icon || "⛰️",
      unlockRequirements: unlockRequirements || { minStars: 0, prevWorldSlug: null },
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_REALM",
      resourceType: "realm",
      resourceId: realm._id,
      changeSummary: `Created realm "${realm.name}" (${realm.slug})`,
      req,
    });

    res.status(201).json({ realm, message: "Realm created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create realm." });
  }
}

export async function updateRealm(req, res) {
  try {
    const realm = await World.findById(req.params.id);
    if (!realm) return res.status(404).json({ message: "Realm not found." });

    Object.assign(realm, req.body);
    await realm.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_REALM",
      resourceType: "realm",
      resourceId: realm._id,
      changeSummary: `Updated realm "${realm.name}" (Min Stars: ${realm.unlockRequirements?.minStars})`,
      req,
    });

    res.json({ realm, message: "Realm updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update realm." });
  }
}

export async function listMissions(req, res) {
  try {
    const { realmSlug } = req.query;
    const filter = {};
    if (realmSlug && realmSlug !== "all") filter.worldSlug = realmSlug;

    const missions = await Mission.find(filter)
      .populate("questionIds", "question difficulty topic points")
      .sort({ worldSlug: 1, missionNumber: 1 })
      .lean();

    res.json({ missions });
  } catch (err) {
    res.status(500).json({ message: "Failed to list missions." });
  }
}

export async function createMission(req, res) {
  try {
    const {
      worldSlug,
      missionNumber,
      title,
      story,
      objective,
      topic,
      difficulty = "easy",
      questionIds = [],
      rewardRules,
      requiredStars = 0,
      isBoss = false,
      bossData,
    } = req.body;

    const world = await World.findOne({ slug: worldSlug });
    if (!world) return res.status(404).json({ message: "Associated realm not found." });

    const mission = await Mission.create({
      worldId: world._id,
      worldSlug,
      missionNumber: Number(missionNumber) || 1,
      title,
      story: story || "A brave explorer faces mathematical challenges.",
      objective: objective || "Solve all challenges correctly to advance.",
      topic,
      difficulty,
      questionIds,
      rewardRules: rewardRules || { coinsPerCorrect: 20, xpPerCorrect: 10, bonusCoinsOnComplete: 50 },
      requiredStars: Number(requiredStars) || 0,
      isBoss,
      bossData: bossData || {},
      isActive: true,
    });

    await createAuditRecord({
      actor: req.admin,
      action: "CREATE_MISSION",
      resourceType: "mission",
      resourceId: mission._id,
      changeSummary: `Created mission "${mission.title}" in realm "${worldSlug}"`,
      req,
    });

    res.status(201).json({ mission, message: "Mission created successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create mission." });
  }
}

export async function updateMission(req, res) {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: "Mission not found." });

    Object.assign(mission, req.body);
    await mission.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_MISSION",
      resourceType: "mission",
      resourceId: mission._id,
      changeSummary: `Updated mission "${mission.title}" (Questions: ${mission.questionIds.length})`,
      req,
    });

    res.json({ mission, message: "Mission updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update mission." });
  }
}

// server/controllers/adminEconomyController.js
import GameConfig from "../models/GameConfig.js";
import { createAuditRecord } from "../middleware/adminAuthMiddleware.js";

export async function getEconomyConfig(req, res) {
  try {
    let config = await GameConfig.findOne({ key: "global_economy" });
    if (!config) {
      config = await GameConfig.create({ key: "global_economy" });
    }
    res.json({ config });
  } catch (err) {
    res.status(500).json({ message: "Failed to load economy configuration." });
  }
}

export async function updateEconomyConfig(req, res) {
  try {
    const {
      xpPerCorrect,
      bonusCoinsOnComplete,
      dailyGoalQuestions,
      streakThresholds,
      powerUpPricing,
      realmUnlockRequirements,
      maintenanceMode,
      registrationOpen,
    } = req.body;

    let config = await GameConfig.findOne({ key: "global_economy" });
    if (!config) {
      config = new GameConfig({ key: "global_economy" });
    }

    if (xpPerCorrect !== undefined) config.xpPerCorrect = Math.max(1, Number(xpPerCorrect));
    if (bonusCoinsOnComplete !== undefined) config.bonusCoinsOnComplete = Math.max(0, Number(bonusCoinsOnComplete));
    if (dailyGoalQuestions !== undefined) config.dailyGoalQuestions = Math.max(1, Number(dailyGoalQuestions));
    if (streakThresholds !== undefined) config.streakThresholds = streakThresholds;
    if (powerUpPricing !== undefined) config.powerUpPricing = powerUpPricing;
    if (realmUnlockRequirements !== undefined) config.realmUnlockRequirements = realmUnlockRequirements;
    if (maintenanceMode !== undefined) config.maintenanceMode = Boolean(maintenanceMode);
    if (registrationOpen !== undefined) config.registrationOpen = Boolean(registrationOpen);

    config.updatedBy = req.admin._id;
    await config.save();

    await createAuditRecord({
      actor: req.admin,
      action: "UPDATE_REWARDS",
      resourceType: "reward",
      changeSummary: `Updated economy rules: Base XP ${config.xpPerCorrect}, Bonus Coins ${config.bonusCoinsOnComplete}`,
      req,
    });

    res.json({ config, message: "Economy and reward rules updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update economy configuration." });
  }
}

// server/controllers/shopController.js
import ShopItem from "../models/ShopItem.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";

export async function getShopItems(req, res) {
  try {
    const items = await ShopItem.find().lean();
    const inventory = await Inventory.find({ playerId: req.user.id }).lean();

    const ownedMap = new Map();
    inventory.forEach((inv) => {
      ownedMap.set(inv.itemId, inv.equipped);
    });

    const user = await User.findById(req.user.id).select("totalCoins selectedCharacter");

    const enriched = items.map((item) => ({
      ...item,
      isOwned: ownedMap.has(item.itemId),
      isEquipped: ownedMap.get(item.itemId) === true,
    }));

    res.json({
      items: enriched,
      playerCoins: user?.totalCoins || 0,
      selectedCharacter: user?.selectedCharacter,
    });
  } catch (err) {
    console.error("Get shop items error:", err);
    res.status(500).json({ message: "Could not load shop items." });
  }
}

export async function purchaseItem(req, res) {
  try {
    const { itemId } = req.body;
    const item = await ShopItem.findOne({ itemId });
    if (!item) {
      return res.status(404).json({ message: "Shop item not found." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if already owned
    const alreadyOwned = await Inventory.findOne({
      playerId: user._id,
      itemId,
    });
    if (alreadyOwned) {
      return res.status(400).json({ message: "You already own this item!" });
    }

    // CRITICAL VALIDATION: Verify coins balance to prevent negative coins
    if (user.totalCoins < item.priceCoins) {
      return res.status(400).json({
        message: `Not enough coins! You have ${user.totalCoins} coins, but need ${item.priceCoins}.`,
      });
    }

    // Deduct coins safely
    user.totalCoins -= item.priceCoins;
    await user.save();

    // Create Inventory record
    const inv = await Inventory.create({
      playerId: user._id,
      itemId: item.itemId,
      category: item.category,
      purchased: true,
      equipped: false,
    });

    res.json({
      success: true,
      message: `Purchased ${item.name}!`,
      remainingCoins: user.totalCoins,
      inventoryItem: inv,
    });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ message: "Error processing item purchase." });
  }
}

export async function equipItem(req, res) {
  try {
    const { itemId, category } = req.body; // category: "costume" or "accessory"

    // Unequip all items in the same category for this player
    await Inventory.updateMany(
      { playerId: req.user.id, category },
      { $set: { equipped: false } }
    );

    // If itemId is "default" or "none", unequip
    if (itemId !== "default" && itemId !== "none") {
      const inv = await Inventory.findOne({
        playerId: req.user.id,
        itemId,
      });
      if (!inv) {
        return res.status(404).json({ message: "You do not own this item." });
      }
      inv.equipped = true;
      await inv.save();
    }

    const user = await User.findById(req.user.id);
    if (category === "costume") {
      user.selectedCharacter.costume = itemId;
    } else if (category === "accessory") {
      user.selectedCharacter.accessory = itemId;
    } else if (category === "pet") {
      user.selectedCharacter.pet = itemId;
    }
    await user.save();

    res.json({
      success: true,
      message: `Equipped ${itemId}!`,
      selectedCharacter: user.selectedCharacter,
    });
  } catch (err) {
    console.error("Equip error:", err);
    res.status(500).json({ message: "Error equipping item." });
  }
}

export async function updateCharacter(req, res) {
  try {
    const { nickname, characterId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (nickname) user.nickname = nickname.trim();
    if (characterId) {
      user.selectedCharacter.id = characterId;
      user.avatar = characterId;
    }

    await user.save();
    res.json({
      success: true,
      nickname: user.nickname,
      selectedCharacter: user.selectedCharacter,
    });
  } catch (err) {
    console.error("Update character error:", err);
    res.status(500).json({ message: "Could not update character." });
  }
}

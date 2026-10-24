// server/routes/shopRoutes.js
import express from "express";
import {
  getShopItems,
  purchaseItem,
  equipItem,
  updateCharacter,
} from "../controllers/shopController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shop", requireAuth, getShopItems);
router.post("/shop/purchase", requireAuth, purchaseItem);
router.post("/shop/equip", requireAuth, equipItem);
router.post("/player/character", requireAuth, updateCharacter);

export default router;

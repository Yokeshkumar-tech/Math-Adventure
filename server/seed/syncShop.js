// server/seed/syncShop.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import dns from "node:dns";

if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (_) {}
}

import ShopItem from "../models/ShopItem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncShop() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mathadventure";
  await mongoose.connect(uri);
  const items = JSON.parse(fs.readFileSync(path.join(__dirname, "shopItems.json"), "utf-8"));
  for (const item of items) {
    await ShopItem.findOneAndUpdate({ itemId: item.itemId }, item, { upsert: true, new: true });
  }
  console.log(`Synced ${items.length} shop items and pets successfully.`);
  await mongoose.disconnect();
}

syncShop().catch(console.error);

import { Router } from "express";
import { store, authMiddleware } from "./store.js";
import { dbSetSetting } from "../lib/db.js";

const router = Router();

router.get("/settings", authMiddleware, (req, res) => {
  res.json({
    restaurantName: store.settings.restaurantName,
    logo: store.settings.logo,
  });
});

router.patch("/settings", authMiddleware, async (req, res) => {
  const body = req.body as Partial<{
    restaurantName: string;
    logo: string | null;
    adminPin: string;
    newAdminPin: string;
    newWaiterPin: string;
  }>;

  if (body.restaurantName !== undefined) {
    store.settings.restaurantName = body.restaurantName;
    await dbSetSetting("restaurant_name", body.restaurantName).catch(() => {});
  }

  if (body.logo !== undefined) {
    store.settings.logo = body.logo;
    await dbSetSetting("logo", body.logo ?? "").catch(() => {});
  }

  if (body.newAdminPin !== undefined) {
    if (body.adminPin !== store.settings.adminPin) {
      return res.status(400).json({ error: "Wrong current PIN" });
    }
    store.settings.adminPin = body.newAdminPin;
  }

  if (body.newWaiterPin !== undefined) {
    store.settings.waiterPin = body.newWaiterPin;
  }

  res.json({
    restaurantName: store.settings.restaurantName,
    logo: store.settings.logo,
  });
});

export async function initSettings() {
  try {
    const { dbGetSetting } = await import("../lib/db.js");
    const logo = await dbGetSetting("logo");
    const name = await dbGetSetting("restaurant_name");
    if (logo) store.settings.logo = logo;
    if (name) store.settings.restaurantName = name;
    process.stdout.write(`[settings] Loaded from Supabase: logo=${!!logo}, name=${name}\n`);
  } catch {
    process.stdout.write(`[settings] Supabase not ready, using defaults\n`);
  }
}

export default router;

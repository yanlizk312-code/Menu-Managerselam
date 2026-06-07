import { Router } from "express";
import { store, authMiddleware } from "./store.js";
import { saveConfig } from "../lib/persist.js";

const router = Router();

router.get("/settings", authMiddleware, (req, res) => {
  res.json({
    restaurantName: store.settings.restaurantName,
    logo: store.settings.logo,
  });
});

router.patch("/settings", authMiddleware, (req, res) => {
  const body = req.body as Partial<{
    restaurantName: string;
    logo: string | null;
    adminPin: string;
    newAdminPin: string;
    newWaiterPin: string;
  }>;

  if (body.restaurantName !== undefined) {
    store.settings.restaurantName = body.restaurantName;
    saveConfig({ restaurantName: body.restaurantName });
  }

  if (body.logo !== undefined) {
    store.settings.logo = body.logo;
    saveConfig({ logo: body.logo });
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

export default router;

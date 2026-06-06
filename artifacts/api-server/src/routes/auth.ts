import { Router } from "express";
import { store } from "./store.js";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { role, pin } = req.body as { role?: string; pin?: string };
  if (!role || !pin) return res.status(400).json({ error: "Missing role or pin" });

  if (role === "admin" && pin === store.settings.adminPin) {
    return res.json({ token: "admin-token-alrisala", role: "admin" });
  }
  if (role === "waiter" && pin === store.settings.waiterPin) {
    return res.json({ token: "admin-token-alrisala", role: "waiter" });
  }
  return res.status(401).json({ error: "Wrong PIN" });
});

export default router;

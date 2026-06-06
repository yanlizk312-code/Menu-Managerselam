import { Router } from "express";
import { store, authMiddleware, type MenuItem } from "./store.js";
import { nanoid } from "nanoid";

const router = Router();

router.get("/menu", (req, res) => {
  const showHidden = req.query["showHidden"] === "1";
  const items = showHidden ? store.menu : store.menu.filter(m => !m.hidden);
  res.json(items);
});

router.post("/menu", authMiddleware, (req, res) => {
  const body = req.body as Partial<MenuItem>;
  const item: MenuItem = {
    id: body.id || nanoid(8),
    name: body.name || { tr: "", en: "", or: "", am: "" },
    description: body.description || { tr: "", en: "", or: "", am: "" },
    price: body.price || 0,
    category: body.category || "main",
    image: body.image || "",
    hidden: body.hidden || false,
  };
  store.menu.push(item);
  res.status(201).json(item);
});

router.put("/menu/:id", authMiddleware, (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const body = req.body as Partial<MenuItem>;
  store.menu[idx] = { ...store.menu[idx], ...body, id: req.params.id };
  res.json(store.menu[idx]);
});

router.patch("/menu/:id", authMiddleware, (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const body = req.body as Partial<MenuItem>;
  store.menu[idx] = { ...store.menu[idx], ...body, id: req.params.id };
  res.json(store.menu[idx]);
});

router.delete("/menu/:id", authMiddleware, (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.menu.splice(idx, 1);
  res.status(204).end();
});

export default router;

import { Router } from "express";
import { store, authMiddleware, type Category } from "./store.js";
import { nanoid } from "nanoid";

const router = Router();

router.get("/categories", (req, res) => {
  res.json([...store.categories].sort((a, b) => a.order - b.order));
});

router.post("/categories", authMiddleware, (req, res) => {
  const body = req.body as Partial<Category>;
  const cat: Category = {
    id: body.id || nanoid(8),
    name: body.name || { tr: "", en: "", or: "", am: "" },
    order: body.order ?? store.categories.length + 1,
  };
  store.categories.push(cat);
  res.status(201).json(cat);
});

router.put("/categories/:id", authMiddleware, (req, res) => {
  const idx = store.categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.categories[idx] = { ...store.categories[idx], ...req.body, id: req.params.id };
  res.json(store.categories[idx]);
});

router.patch("/categories/:id", authMiddleware, (req, res) => {
  const idx = store.categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.categories[idx] = { ...store.categories[idx], ...req.body, id: req.params.id };
  res.json(store.categories[idx]);
});

router.delete("/categories/:id", authMiddleware, (req, res) => {
  const idx = store.categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.categories.splice(idx, 1);
  res.status(204).end();
});

export default router;

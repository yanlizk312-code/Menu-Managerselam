import { Router } from "express";
import { store, authMiddleware, type Table } from "./store.js";
import { nanoid } from "nanoid";

const router = Router();

router.get("/tables", (req, res) => {
  res.json(store.tables);
});

router.post("/tables", authMiddleware, (req, res) => {
  const body = req.body as Partial<Table> & { number?: number; location?: string };
  const table: Table = {
    id: nanoid(8),
    number: body.number ?? store.tables.length + 1,
    location: body.location || "",
    status: body.status || "available",
    activeOrderCount: 0,
  };
  store.tables.push(table);
  res.status(201).json(table);
});

router.put("/tables/:id", authMiddleware, (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables[idx] = { ...store.tables[idx], ...req.body, id: req.params.id };
  res.json(store.tables[idx]);
});

router.patch("/tables/:id", authMiddleware, (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables[idx] = { ...store.tables[idx], ...req.body, id: req.params.id };
  res.json(store.tables[idx]);
});

router.delete("/tables/:id", authMiddleware, (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables.splice(idx, 1);
  res.status(204).end();
});

export default router;

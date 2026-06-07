import { Router } from "express";
import { store, authMiddleware, type Table } from "./store.js";
import { dbLoadTables, dbSaveTable, dbDeleteTable } from "../lib/db.js";
import { nanoid } from "nanoid";

const router = Router();

router.get("/tables", (req, res) => {
  res.json(store.tables);
});

router.post("/tables", authMiddleware, async (req, res) => {
  const body = req.body as Partial<Table> & { number?: number; location?: string };
  const table: Table = {
    id: nanoid(8),
    number: body.number ?? store.tables.length + 1,
    location: body.location || "",
    status: body.status || "available",
    activeOrderCount: 0,
  };
  store.tables.push(table);
  await dbSaveTable(table);
  res.status(201).json(table);
});

router.put("/tables/:id", authMiddleware, async (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables[idx] = { ...store.tables[idx], ...req.body, id: req.params.id };
  await dbSaveTable(store.tables[idx]);
  res.json(store.tables[idx]);
});

router.patch("/tables/:id", authMiddleware, async (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables[idx] = { ...store.tables[idx], ...req.body, id: req.params.id };
  await dbSaveTable(store.tables[idx]);
  res.json(store.tables[idx]);
});

router.delete("/tables/:id", authMiddleware, async (req, res) => {
  const idx = store.tables.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  store.tables.splice(idx, 1);
  await dbDeleteTable(req.params.id);
  res.status(204).end();
});

export async function initTables() {
  try {
    const rows = await dbLoadTables();
    store.tables = rows;
    req_log(`Loaded ${rows.length} tables from Supabase`);
  } catch (e) {
    // Supabase tables not yet created — will work from memory
  }
}

function req_log(msg: string) {
  process.stdout.write(`[tables] ${msg}\n`);
}

export default router;

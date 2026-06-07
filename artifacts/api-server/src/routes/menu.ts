import { Router } from "express";
import { store, authMiddleware, type MenuItem } from "./store.js";
import { dbLoadMenu, dbSaveMenuItem, dbDeleteMenuItem, dbSeedMenu } from "../lib/db.js";
import { nanoid } from "nanoid";

const router = Router();

router.get("/menu", (req, res) => {
  const showHidden = req.query["showHidden"] === "1";
  const items = showHidden ? store.menu : store.menu.filter(m => !m.hidden);
  res.json(items);
});

router.post("/menu", authMiddleware, async (req, res) => {
  const body = req.body as Partial<MenuItem>;
  const item: MenuItem = {
    id: body.id || nanoid(8),
    name: body.name || { en: "", am: "" },
    description: body.description || { en: "", am: "" },
    price: body.price || 0,
    category: body.category || "main",
    image: body.image || "",
    hidden: body.hidden || false,
  };
  store.menu.push(item);
  await dbSaveMenuItem(item, store.menu.length - 1);
  res.status(201).json(item);
});

router.put("/menu/:id", authMiddleware, async (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const body = req.body as Partial<MenuItem>;
  store.menu[idx] = { ...store.menu[idx], ...body, id: req.params.id };
  await dbSaveMenuItem(store.menu[idx], idx);
  res.json(store.menu[idx]);
});

router.patch("/menu/:id", authMiddleware, async (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const body = req.body as Partial<MenuItem>;
  store.menu[idx] = { ...store.menu[idx], ...body, id: req.params.id };
  await dbSaveMenuItem(store.menu[idx], idx);
  res.json(store.menu[idx]);
});

router.delete("/menu/:id", authMiddleware, async (req, res) => {
  const idx = store.menu.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [removed] = store.menu.splice(idx, 1);
  await dbDeleteMenuItem(removed.id);
  res.status(204).end();
});

export async function initMenu(initialData: MenuItem[]) {
  try {
    const rows = await dbLoadMenu();
    if (rows.length > 0) {
      store.menu = rows;
      log(`Loaded ${rows.length} menu items from Supabase`);
    } else {
      // First run — seed initial data
      await dbSeedMenu(initialData);
      store.menu = [...initialData];
      log(`Seeded ${initialData.length} initial menu items to Supabase`);
    }
  } catch (e: any) {
    log(`Supabase not ready, using defaults: ${e.message}`);
  }
}

function log(msg: string) { process.stdout.write(`[menu] ${msg}\n`); }

export default router;

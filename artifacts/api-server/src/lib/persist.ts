import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, "../data/config.json");

export interface PersistedTable {
  id: string;
  number: number;
  location: string;
  status: string;
  activeOrderCount: number;
}

export interface PersistedConfig {
  logo: string | null;
  restaurantName: string;
  tables: PersistedTable[];
}

export function loadConfig(): PersistedConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return { logo: null, restaurantName: "AL-RISALA", tables: [] };
    }
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedConfig>;
    return {
      logo: parsed.logo ?? null,
      restaurantName: parsed.restaurantName ?? "AL-RISALA",
      tables: parsed.tables ?? [],
    };
  } catch {
    return { logo: null, restaurantName: "AL-RISALA", tables: [] };
  }
}

export function saveConfig(patch: Partial<PersistedConfig>) {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const current = loadConfig();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...patch }, null, 2));
  } catch {
    // non-fatal: in-memory store still works
  }
}

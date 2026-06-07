import fs from "fs";
import path from "path";

const CONFIG_PATH = path.resolve(process.cwd(), "artifacts/api-server/data/config.json");

interface PersistedConfig {
  logo: string | null;
  restaurantName: string;
}

export function loadConfig(): PersistedConfig {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return { logo: null, restaurantName: "AL-RISALA" };
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as PersistedConfig;
  } catch {
    return { logo: null, restaurantName: "AL-RISALA" };
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

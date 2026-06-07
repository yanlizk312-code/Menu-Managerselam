import app from "./app";
import { logger } from "./lib/logger";
import { initSettings } from "./routes/settings.js";
import { initTables } from "./routes/tables.js";
import { initMenu } from "./routes/menu.js";
import { initCategories } from "./routes/categories.js";
import { INITIAL_MENU, INITIAL_CATEGORIES } from "./routes/data/initial-data.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

app.listen(port, async (err) => {
  if (err) { logger.error({ err }, "Error listening on port"); process.exit(1); }
  logger.info({ port }, "Server listening");

  await initSettings();
  await initTables();
  await initCategories(INITIAL_CATEGORIES as any);
  await initMenu(INITIAL_MENU as any);
});

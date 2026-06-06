import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import menuRouter from "./menu.js";
import categoriesRouter from "./categories.js";
import tablesRouter from "./tables.js";
import waiterCallsRouter from "./waiter-calls.js";
import bundleRouter from "./bundle.js";
import settingsRouter from "./settings.js";
import uploadRouter from "./upload.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(menuRouter);
router.use(categoriesRouter);
router.use(tablesRouter);
router.use(waiterCallsRouter);
router.use(bundleRouter);
router.use(settingsRouter);
router.use(uploadRouter);

export default router;

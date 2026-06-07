import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware, store } from "./store.js";
import { saveConfig } from "../lib/persist.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../restoran-menu/public/images");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `upload-${Date.now()}${ext}`);
  },
});

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `restaurant-logo${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
const logoUpload = multer({ storage: logoStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/images/${req.file.filename}`;
  res.json({ url });
});

router.post("/upload/logo", authMiddleware, logoUpload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const ext = path.extname(req.file.filename);
  const cacheBuster = Date.now();
  const url = `/images/restaurant-logo${ext}?v=${cacheBuster}`;
  store.settings.logo = url;
  saveConfig({ logo: url });
  res.json({ url });
});

export default router;

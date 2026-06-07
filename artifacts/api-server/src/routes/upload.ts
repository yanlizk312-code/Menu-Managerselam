import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware, store } from "./store.js";
import { uploadLogoToSupabase } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../restoran-menu/public/images");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const memStorage = multer.memoryStorage();
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `upload-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: diskStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const logoUpload = multer({ storage: memStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/images/${req.file.filename}`;
  res.json({ url });
});

router.post("/upload/logo", authMiddleware, logoUpload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  try {
    const ext = path.extname(req.file.originalname) || ".jpg";
    const url = await uploadLogoToSupabase(req.file.buffer, ext);
    store.settings.logo = url;
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

export default router;

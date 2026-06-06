import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "./store.js";

const UPLOAD_DIR = path.resolve(process.cwd(), "artifacts/restoran-menu/public/images");

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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/images/${req.file.filename}`;
  res.json({ url });
});

export default router;

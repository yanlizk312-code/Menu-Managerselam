import { Router } from "express";
import multer from "multer";
import path from "path";
import { authMiddleware, store } from "./store.js";
import { uploadImageToSupabase, uploadLogoToSupabase } from "../lib/db.js";

const memStorage = multer.memoryStorage();
const upload = multer({ storage: memStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  try {
    const ext = path.extname(req.file.originalname) || ".jpg";
    const url = await uploadImageToSupabase(req.file.buffer, ext, "menu");
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Upload failed" });
  }
});

router.post("/upload/logo", authMiddleware, upload.single("image"), async (req, res) => {
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

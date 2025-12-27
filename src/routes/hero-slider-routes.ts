import { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import heicConvert from "heic-convert";
import mongoose from "mongoose";

import {
  getHomeHeroSlider,
  upsertHomeHeroSlider,
} from "../controllers/hero-slider-controller";
import { mockHeroSlider } from "../mock-data/collections";
import { authenticate, requireAdmin } from "../middleware/auth-middleware";

const router = Router();

/**
 * Check if MongoDB is connected
 */
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "hero");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedMime = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const allowedExt = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // allow by mimetype OR extension (some devices send odd mimetypes)
    if (allowedMime.has(file.mimetype) || allowedExt.has(ext))
      return cb(null, true);

    cb(
      new Error("Unsupported file type. Allowed: HEIC/HEIF/JPG/JPEG/PNG/WEBP")
    );
  },
});

/**
 * GET /api/hero-slider/home
 * Returns hero slider data for home page
 * Falls back to mock data if MongoDB is not connected
 */
router.get("/home", async (req, res) => {
  if (!isMongoConnected()) {
    console.log("⚠️  MongoDB not connected, returning mock hero slider data");
    return res.status(200).json(mockHeroSlider);
  }

  try {
    await getHomeHeroSlider(req, res);
  } catch (err) {
    console.error("Failed to fetch hero slider:", err);
    console.log("⚠️  Error fetching hero slider, returning mock data");
    res.status(200).json(mockHeroSlider);
  }
});

router.put("/home", authenticate, requireAdmin, upsertHomeHeroSlider);

/**
 * POST /api/hero-slider/home/upload
 * FormData: image=<file>
 * Returns: { path: "/uploads/hero/<filename>.jpg" }
 */
router.post("/home/upload", authenticate, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file?.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const lowerName = (req.file.originalname || "").toLowerCase();
    const isHeic =
      req.file.mimetype === "image/heic" ||
      req.file.mimetype === "image/heif" ||
      lowerName.endsWith(".heic") ||
      lowerName.endsWith(".heif");

    let inputBuffer: Buffer = req.file.buffer;

    // ✅ Convert HEIC/HEIF -> JPEG buffer (same approach as your working upload.ts)
    if (isHeic) {
      const converted = await heicConvert({
        buffer: req.file.buffer as any, // ✅ important (matches your working code)
        format: "JPEG",
        quality: 0.9, // 0..1
      });

      inputBuffer = Buffer.from(converted as any);
    }

    const filename = `hero-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.jpg`;
    const outPath = path.join(UPLOAD_DIR, filename);

    // Compress/resize + ensure jpeg output
    await sharp(inputBuffer)
      .rotate()
      .resize({ width: 2200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(outPath);

    return res.status(200).json({ path: `/uploads/hero/${filename}` });
  } catch (err) {
    console.error("Hero image upload error:", err);
    return res.status(500).json({
      error:
        err instanceof Error ? err.message : "Failed to upload/convert image",
    });
  }
});

export default router;

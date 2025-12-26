"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const heic_convert_1 = __importDefault(require("heic-convert"));
const mongoose_1 = __importDefault(require("mongoose"));
const hero_slider_controller_1 = require("../controllers/hero-slider-controller");
const collections_1 = require("../mock-data/collections");
const router = (0, express_1.Router)();
/**
 * Check if MongoDB is connected
 */
const isMongoConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
const UPLOAD_DIR = path_1.default.resolve(process.cwd(), "uploads", "hero");
fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
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
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        // allow by mimetype OR extension (some devices send odd mimetypes)
        if (allowedMime.has(file.mimetype) || allowedExt.has(ext))
            return cb(null, true);
        cb(new Error("Unsupported file type. Allowed: HEIC/HEIF/JPG/JPEG/PNG/WEBP"));
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
        return res.status(200).json(collections_1.mockHeroSlider);
    }
    try {
        await (0, hero_slider_controller_1.getHomeHeroSlider)(req, res);
    }
    catch (err) {
        console.error("Failed to fetch hero slider:", err);
        console.log("⚠️  Error fetching hero slider, returning mock data");
        res.status(200).json(collections_1.mockHeroSlider);
    }
});
const auth_middleware_1 = require("../middleware/auth-middleware");
router.put("/home", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, hero_slider_controller_1.upsertHomeHeroSlider);
/**
 * POST /api/hero-slider/home/upload
 * FormData: image=<file>
 * Returns: { path: "/uploads/hero/<filename>.jpg" }
 */
router.post("/home/upload", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, upload.single("image"), async (req, res) => {
    try {
        if (!req.file?.buffer || req.file.buffer.length === 0) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const lowerName = (req.file.originalname || "").toLowerCase();
        const isHeic = req.file.mimetype === "image/heic" ||
            req.file.mimetype === "image/heif" ||
            lowerName.endsWith(".heic") ||
            lowerName.endsWith(".heif");
        let inputBuffer = req.file.buffer;
        // ✅ Convert HEIC/HEIF -> JPEG buffer (same approach as your working upload.ts)
        if (isHeic) {
            const converted = await (0, heic_convert_1.default)({
                buffer: req.file.buffer,
                format: "JPEG",
                quality: 0.9, // 0..1
            });
            inputBuffer = Buffer.from(converted);
        }
        const filename = `hero-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}.jpg`;
        const outPath = path_1.default.join(UPLOAD_DIR, filename);
        // Compress/resize + ensure jpeg output
        await (0, sharp_1.default)(inputBuffer)
            .rotate()
            .resize({ width: 2200, withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(outPath);
        return res.status(200).json({ path: `/uploads/hero/${filename}` });
    }
    catch (err) {
        console.error("Hero image upload error:", err);
        return res.status(500).json({
            error: err instanceof Error ? err.message : "Failed to upload/convert image",
        });
    }
});
exports.default = router;
//# sourceMappingURL=hero-slider-routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUploadedImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const heic_convert_1 = __importDefault(require("heic-convert"));
const uploadPath = path_1.default.resolve(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath)) {
    fs_1.default.mkdirSync(uploadPath, { recursive: true });
}
const allowedMime = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
]);
const allowedExt = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
]);
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        // ✅ FIX: Allow by mimetype OR extension (Safari sometimes sends empty/incorrect mimetypes)
        if (allowedMime.has(file.mimetype) || allowedExt.has(ext)) {
            return cb(null, true);
        }
        return cb(new Error("Unsupported image type. Use JPG, PNG, WEBP, or HEIC."));
    },
});
function makeBaseName() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function normalizeExtFromOriginalName(originalname) {
    const ext = path_1.default.extname(originalname).toLowerCase();
    if (ext === ".jpeg")
        return ".jpg";
    if (ext === ".jpg" || ext === ".png" || ext === ".webp")
        return ext;
    return "";
}
/**
 * Save uploaded image buffer to /uploads.
 * - HEIC/HEIF -> convert to JPG
 * - others keep extension (jpg/png/webp)
 * Returns "/uploads/<filename>"
 */
async function saveUploadedImage(file) {
    // Debug logging for Safari upload issues
    console.log("[UPLOAD] file info:", {
        originalname: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size,
        bufferLength: file?.buffer?.length,
        fieldname: file?.fieldname,
    });
    if (!file?.buffer || file.buffer.length === 0) {
        console.error("[UPLOAD] Empty file buffer", file);
        throw new Error("Empty file buffer.");
    }
    const baseName = makeBaseName();
    const extFromName = normalizeExtFromOriginalName(file.originalname);
    const lowerName = file.originalname.toLowerCase();
    const isHeic = file.mimetype === "image/heic" ||
        file.mimetype === "image/heif" ||
        lowerName.endsWith(".heic") ||
        lowerName.endsWith(".heif");
    if (isHeic) {
        // ✅ IMPORTANT: heic-convert works reliably with Buffer/Uint8Array
        const output = await (0, heic_convert_1.default)({
            buffer: file.buffer,
            format: "JPEG",
            quality: 0.85,
        });
        const filename = `${baseName}.jpg`;
        fs_1.default.writeFileSync(path_1.default.join(uploadPath, filename), Buffer.from(output));
        return `/uploads/${filename}`;
    }
    // Choose extension for non-HEIC uploads
    let ext = extFromName;
    if (!ext) {
        if (file.mimetype === "image/png")
            ext = ".png";
        else if (file.mimetype === "image/webp")
            ext = ".webp";
        else
            ext = ".jpg"; // default fallback
    }
    const filename = `${baseName}${ext}`;
    fs_1.default.writeFileSync(path_1.default.join(uploadPath, filename), file.buffer);
    return `/uploads/${filename}`;
}
exports.saveUploadedImage = saveUploadedImage;
//# sourceMappingURL=upload.js.map
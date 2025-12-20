import multer from "multer";
import path from "path";
import fs from "fs";
import heicConvert from "heic-convert";

const uploadPath = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedMime = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(
        new Error("Unsupported image type. Use JPG, PNG, WEBP, or HEIC.")
      );
    }
    cb(null, true);
  },
});

function makeBaseName() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeExtFromOriginalName(
  originalname: string
): ".jpg" | ".png" | ".webp" | "" {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if (ext === ".jpg" || ext === ".png" || ext === ".webp") return ext;
  return "";
}

/**
 * Save uploaded image buffer to /uploads.
 * - HEIC/HEIF -> convert to JPG
 * - others keep extension (jpg/png/webp)
 * Returns "/uploads/<filename>"
 */
export async function saveUploadedImage(
  file: Express.Multer.File
): Promise<string> {
  if (!file?.buffer || file.buffer.length === 0) {
    throw new Error("Empty file buffer.");
  }

  const baseName = makeBaseName();
  const extFromName = normalizeExtFromOriginalName(file.originalname);

  const lowerName = file.originalname.toLowerCase();
  const isHeic =
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");

  if (isHeic) {
    // ✅ IMPORTANT: heic-convert works reliably with Buffer/Uint8Array
    const output = await heicConvert({
      buffer: file.buffer as any,
      format: "JPEG",
      quality: 0.85,
    });

    const filename = `${baseName}.jpg`;
    fs.writeFileSync(path.join(uploadPath, filename), Buffer.from(output));
    return `/uploads/${filename}`;
  }

  // Choose extension for non-HEIC uploads
  let ext = extFromName;
  if (!ext) {
    if (file.mimetype === "image/png") ext = ".png";
    else if (file.mimetype === "image/webp") ext = ".webp";
    else ext = ".jpg"; // default fallback
  }

  const filename = `${baseName}${ext}`;
  fs.writeFileSync(path.join(uploadPath, filename), file.buffer);
  return `/uploads/${filename}`;
}

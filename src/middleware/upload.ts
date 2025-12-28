import multer from "multer";
import path from "path";
import fs from "fs";
import heicConvert from "heic-convert";

const uploadPath = path.resolve(process.cwd(), "uploads");

// Ensure upload directory exists with proper permissions
function ensureUploadDirectory(): void {
  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
    } else {
      // Check if directory is writable
      try {
        fs.accessSync(uploadPath, fs.constants.W_OK);
      } catch (accessErr) {
        // Try to fix permissions if possible
        try {
          fs.chmodSync(uploadPath, 0o755);
        } catch (chmodErr) {
          console.error("[UPLOAD] Cannot fix upload directory permissions:", chmodErr);
          throw new Error("Upload directory is not writable. Please check permissions.");
        }
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[UPLOAD] Failed to ensure upload directory:", errorMsg);
    throw new Error(`Failed to setup upload directory: ${errorMsg}`);
  }
}

// Initialize on module load
ensureUploadDirectory();

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

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    // ✅ FIX: Allow by mimetype OR extension (Safari sometimes sends empty/incorrect mimetypes)
    if (allowedMime.has(file.mimetype) || allowedExt.has(ext)) {
      return cb(null, true);
    }
    
    return cb(
      new Error("Unsupported image type. Use JPG, PNG, WEBP, or HEIC.")
    );
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
 * 
 * Handles all edge cases:
 * - Permission errors (EACCES, EPERM)
 * - Disk space errors (ENOSPC)
 * - Network errors
 * - Invalid file data
 * - Directory creation failures
 */
export async function saveUploadedImage(
  file: Express.Multer.File,
  retries = 2
): Promise<string> {
  // Validate file input
  if (!file) {
    throw new Error("No file provided.");
  }

  // Debug logging for Safari upload issues
  if (process.env.NODE_ENV === "development") {
    console.log("[UPLOAD] file info:", {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      bufferLength: file?.buffer?.length,
      fieldname: file?.fieldname,
    });
  }

  if (!file.buffer || file.buffer.length === 0) {
    console.error("[UPLOAD] Empty file buffer", file);
    throw new Error("File kosong atau tidak valid. Silakan pilih file lain.");
  }

  // Check file size (additional check beyond multer)
  const maxSize = 8 * 1024 * 1024; // 8MB
  if (file.buffer.length > maxSize) {
    throw new Error(`File terlalu besar (${Math.round(file.buffer.length / 1024 / 1024)}MB). Maksimal 8MB.`);
  }

  // Ensure directory exists and is writable before processing
  try {
    ensureUploadDirectory();
  } catch (dirErr) {
    const errorMsg = dirErr instanceof Error ? dirErr.message : "Unknown error";
    console.error("[UPLOAD] Directory setup failed:", errorMsg);
    throw new Error(`Gagal menyiapkan direktori upload: ${errorMsg}. Silakan hubungi administrator.`);
  }

  const baseName = makeBaseName();
  const extFromName = normalizeExtFromOriginalName(file.originalname);

  const lowerName = file.originalname.toLowerCase();
  const isHeic =
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif");

  let bufferToWrite: Buffer;
  let filename: string;

  try {
    if (isHeic) {
      // ✅ IMPORTANT: heic-convert works reliably with Buffer/Uint8Array
      try {
        const output = await heicConvert({
          buffer: file.buffer as any,
          format: "JPEG",
          quality: 0.85,
        });
        bufferToWrite = Buffer.from(output);
        filename = `${baseName}.jpg`;
      } catch (heicErr) {
        const errorMsg = heicErr instanceof Error ? heicErr.message : "Unknown error";
        console.error("[UPLOAD] HEIC conversion failed:", errorMsg);
        throw new Error(`Gagal mengkonversi file HEIC: ${errorMsg}. Silakan gunakan format JPG atau PNG.`);
      }
    } else {
      // Choose extension for non-HEIC uploads
      let ext = extFromName;
      if (!ext) {
        if (file.mimetype === "image/png") ext = ".png";
        else if (file.mimetype === "image/webp") ext = ".webp";
        else ext = ".jpg"; // default fallback
      }
      filename = `${baseName}${ext}`;
      bufferToWrite = file.buffer;
    }

    // Write file with retry mechanism for transient errors
    const filePath = path.join(uploadPath, filename);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Use writeFile instead of writeFileSync for better error handling
        await new Promise<void>((resolve, reject) => {
          fs.writeFile(filePath, bufferToWrite, { mode: 0o644 }, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Verify file was written successfully
        if (!fs.existsSync(filePath)) {
          throw new Error("File tidak tersimpan. Silakan coba lagi.");
        }

        return `/uploads/${filename}`;
      } catch (writeErr: unknown) {
        lastError = writeErr instanceof Error ? writeErr : new Error(String(writeErr));
        const errorCode = (lastError as NodeJS.ErrnoException).code;
        const errorMessage = lastError.message;

        // Handle specific error types
        if (errorCode === "EACCES" || errorCode === "EPERM") {
          // Permission denied - try to fix permissions once
          if (attempt === 0) {
            try {
              // Try to fix directory permissions
              fs.chmodSync(uploadPath, 0o755);
              // Retry once
              continue;
            } catch (chmodErr) {
              console.error("[UPLOAD] Cannot fix permissions:", chmodErr);
              throw new Error("Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator untuk memperbaiki izin direktori uploads.");
            }
          } else {
            throw new Error("Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator untuk memperbaiki izin direktori uploads.");
          }
        } else if (errorCode === "ENOSPC") {
          throw new Error("Ruang penyimpanan penuh. Silakan hapus file lama atau hubungi administrator.");
        } else if (errorCode === "EMFILE" || errorCode === "ENFILE") {
          // Too many open files - wait and retry
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error("Terlalu banyak file terbuka. Silakan coba lagi dalam beberapa saat.");
        } else if (errorCode === "EISDIR") {
          throw new Error("Path adalah direktori, bukan file. Silakan hubungi administrator.");
        } else if (errorCode === "ENOENT") {
          // Directory doesn't exist - try to recreate
          if (attempt === 0) {
            try {
              ensureUploadDirectory();
              continue;
            } catch (dirErr) {
              throw new Error(`Direktori upload tidak ditemukan dan tidak dapat dibuat: ${dirErr instanceof Error ? dirErr.message : "Unknown error"}`);
            }
          } else {
            throw new Error("Direktori upload tidak ditemukan. Silakan hubungi administrator.");
          }
        } else {
          // Other errors - retry if attempts remain
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
          // Final attempt failed - provide user-friendly error
          console.error("[UPLOAD] File write failed after retries:", {
            errorCode,
            errorMessage,
            filePath,
            attempt,
          });
          throw new Error(`Gagal menyimpan file: ${errorMessage}. Silakan coba lagi atau hubungi administrator.`);
        }
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError || new Error("Unknown error during file write");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[UPLOAD] saveUploadedImage failed:", errorMsg);
    throw err; // Re-throw to be handled by caller
  }
}

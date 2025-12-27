import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

import path from "path";
import multer from "multer";
import fs from "fs";

import metricsRoutes from "../routes/metrics-routes";
import authRoutes from "../routes/auth-routes";
import bouquetRoutes from "../routes/bouquet-routes";
import collectionRoutes from "../routes/collection-routes";
import heroSliderRoutes from "../routes/hero-slider-routes";
import orderRoutes from "../routes/order-routes";
import customerRoutes from "../routes/customer-routes";
import { securityHeaders } from "../middleware/security-headers";
import { apiRateLimit } from "../middleware/rate-limit-middleware";

/**
 * Read a required env var (crash early if missing)
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    console.error(`❌ Missing required env var: ${name}`);
    process.exit(1);
  }
  return value.trim();
}

/**
 * Parse comma-separated origins into a clean array
 */
function parseOrigins(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const app = express();

// If behind Nginx reverse proxy (recommended)
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = requireEnv("MONGO_URI");
const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

const isMongoConnected = () => mongoose.connection.readyState === 1;

// Security headers (must be first)
app.use(securityHeaders);

// CORS configuration
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests without Origin header (curl, server-to-server, health checks)
      if (!origin) return cb(null, true);

      // In development, be permissive to avoid local-network/origin mismatches
      if (process.env.NODE_ENV !== "production") return cb(null, true);

      // If CORS_ORIGIN is not set, require it in production
      if (allowedOrigins.length === 0) {
        return cb(new Error("CORS_ORIGIN is not configured"));
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing with size limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate limiting for API routes (applied before routes)
app.use("/api", apiRateLimit);

// Health check
app.get("/api/health", (_req, res) =>
  res.status(200).json({ ok: true, db: isMongoConnected() ? "up" : "down" })
);
const uploadsPath = path.resolve(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("Created /uploads folder");
  }
} catch (err) {
  console.error("Failed to create /uploads folder:", err);
}
app.use("/uploads", express.static(uploadsPath));

// If DB is down, return a clear response (prevents proxy ECONNREFUSED)
app.use((req, res, next) => {
  if (req.path === "/api/health") return next();
  if (req.path.startsWith("/api/") && !isMongoConnected()) {
    return res.status(503).json({ message: "Database unavailable" });
  }
  return next();
});

// Routes - Register all API routes before 404 handler
app.use("/api/metrics", metricsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/hero-slider", heroSliderRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);

// Log registered routes (always log, not just in development)
console.log("✅ Registered API routes:");
console.log("  - /api/metrics");
console.log("  - /api/auth");
console.log("  - /api/bouquets");
console.log("  - /api/collections");
console.log("  - /api/hero-slider");
console.log("  - /api/orders");
console.log("  - /api/customers");

// 404 handler for API routes (must come after all route registrations)
app.use("/api", (req, res) => {
  // Always log 404s for debugging
  console.warn(`[404] API endpoint not found: ${req.method} ${req.path}`);
  console.warn(`[404] Query:`, req.query);
  console.warn(`[404] Headers:`, { authorization: req.headers.authorization ? "present" : "missing" });
  res.status(404).json({ 
    message: "API endpoint not found", 
    path: req.path, 
    method: req.method,
    availableRoutes: [
      "/api/metrics",
      "/api/auth",
      "/api/bouquets",
      "/api/collections",
      "/api/hero-slider",
      "/api/orders",
      "/api/customers"
    ]
  });
});

// 404 handler for other routes
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler (must be last)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ API error:", err);

  // Make upload/update failures understandable for the dashboard.
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "Image is too large. Max 8MB." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof Error) {
    if (/unsupported image type/i.test(err.message)) {
      return res.status(400).json({ message: err.message });
    }
  }

  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("🛑 Shutting down...");
    server.close(async () => {
      await mongoose.connection.close().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // In production we should fail fast; in dev allow UI work without DB.
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

start();

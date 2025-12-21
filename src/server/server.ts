import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import metricsRoutes from "../routes/metrics-routes";
import authRoutes from "../routes/auth-routes";
import bouquetRoutes from "../routes/bouquet-routes";
import collectionRoutes from "../routes/collection-routes";
import heroSliderRoutes from "../routes/hero-slider-routes";

/**
 * Read an env var (optional for development with mock data)
 */
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    console.warn(`⚠️  Missing env var: ${name} - will use mock data`);
    return "";
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
const MONGO_URI = getEnv("MONGO_URI");
const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

// Middleware
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests without Origin header (curl, server-to-server, health checks)
      if (!origin) return cb(null, true);

      // If CORS_ORIGIN is not set, default to localhost in dev only
      if (allowedOrigins.length === 0) {
        if (process.env.NODE_ENV !== "production") return cb(null, true);
        return cb(new Error("CORS_ORIGIN is not configured"));
      }

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

// Static uploads (make sure this folder exists on server)
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Routes
app.use("/api/metrics", metricsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/hero-slider", heroSliderRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Error handler (must be last)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ API error:", err);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  // Try to connect to MongoDB, but don't fail if it's not available
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.warn(
        "⚠️  MongoDB connection failed - using mock data for development"
      );
      console.warn(
        "   Error:",
        err instanceof Error ? err.message : String(err)
      );
      console.warn("   To fix: Check MONGO_URI in .env.development");
    }
  } else {
    console.warn("⚠️  MONGO_URI not set - using mock data for development");
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Header size limit: 16KB (increased from default 8KB)`);

    if (mongoose.connection.readyState !== 1) {
      console.log(`⚠️  Running in DEVELOPMENT MODE with mock data`);
      console.log(`   MongoDB is not connected - API will return dummy data`);
    }
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("🛑 Shutting down...");
    server.close(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close().catch(() => undefined);
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start();

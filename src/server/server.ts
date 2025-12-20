import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";

import metricsRoutes from "../routes/metrics-routes";
import authRoutes from "../routes/auth-routes";
import bouquetRoutes from "../routes/bouquet-routes";
import collectionRoutes from "../routes/collection-routes";
import heroSliderRoutes from "../routes/hero-slider-routes";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    console.error(`❌ ${name} not found in environment variables`);
    process.exit(1);
  }
  return value;
}

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = requireEnv("MONGO_URI");

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));

app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/metrics", metricsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/hero-slider", heroSliderRoutes);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

start();

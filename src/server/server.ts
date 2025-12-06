import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import metricsRoutes from "../routes/metrics-routes";
import userRoutes from "../routes/user-routes";
import bouquetRoutes from "../routes/bouquet-routes";
import collectionRoutes from "../routes/collection-routes";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mongo connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/metrics", metricsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bouquets", bouquetRoutes);
app.use("/api/collections", collectionRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

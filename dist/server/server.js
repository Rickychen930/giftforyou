"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const metrics_routes_1 = __importDefault(require("../routes/metrics-routes"));
const auth_routes_1 = __importDefault(require("../routes/auth-routes"));
const bouquet_routes_1 = __importDefault(require("../routes/bouquet-routes"));
const collection_routes_1 = __importDefault(require("../routes/collection-routes"));
const hero_slider_routes_1 = __importDefault(require("../routes/hero-slider-routes"));
/**
 * Read a required env var (crash early if missing)
 */
function requireEnv(name) {
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
function parseOrigins(value) {
    return (value || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
const app = (0, express_1.default)();
// If behind Nginx reverse proxy (recommended)
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = requireEnv("MONGO_URI");
const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow requests without Origin header (curl, server-to-server, health checks)
        if (!origin)
            return cb(null, true);
        // If CORS_ORIGIN is not set, default to localhost in dev only
        if (allowedOrigins.length === 0) {
            if (process.env.NODE_ENV !== "production")
                return cb(null, true);
            return cb(new Error("CORS_ORIGIN is not configured"));
        }
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));
// Static uploads (make sure this folder exists on server)
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
// Routes
app.use("/api/metrics", metrics_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bouquets", bouquet_routes_1.default);
app.use("/api/collections", collection_routes_1.default);
app.use("/api/hero-slider", hero_slider_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
});
// Error handler (must be last)
app.use((err, _req, res, _next) => {
    console.error("❌ API error:", err);
    res.status(500).json({ message: "Internal server error" });
});
async function start() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
        // Graceful shutdown
        const shutdown = async () => {
            console.log("🛑 Shutting down...");
            server.close(async () => {
                await mongoose_1.default.connection.close().catch(() => undefined);
                process.exit(0);
            });
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    }
    catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map
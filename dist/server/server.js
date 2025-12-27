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
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const metrics_routes_1 = __importDefault(require("../routes/metrics-routes"));
const auth_routes_1 = __importDefault(require("../routes/auth-routes"));
const bouquet_routes_1 = __importDefault(require("../routes/bouquet-routes"));
const collection_routes_1 = __importDefault(require("../routes/collection-routes"));
const hero_slider_routes_1 = __importDefault(require("../routes/hero-slider-routes"));
const order_routes_1 = __importDefault(require("../routes/order-routes"));
const customer_routes_1 = __importDefault(require("../routes/customer-routes"));
const instagram_routes_1 = __importDefault(require("../routes/instagram-routes"));
const security_headers_1 = require("../middleware/security-headers");
const rate_limit_middleware_1 = require("../middleware/rate-limit-middleware");
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
const isMongoConnected = () => mongoose_1.default.connection.readyState === 1;
// Security headers (must be first)
app.use(security_headers_1.securityHeaders);
// CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow requests without Origin header (curl, server-to-server, health checks)
        if (!origin)
            return cb(null, true);
        // In development, be permissive to avoid local-network/origin mismatches
        if (process.env.NODE_ENV !== "production")
            return cb(null, true);
        // If CORS_ORIGIN is not set, require it in production
        if (allowedOrigins.length === 0) {
            return cb(new Error("CORS_ORIGIN is not configured"));
        }
        if (allowedOrigins.includes(origin))
            return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing with size limits
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "2mb" }));
// Health check (register early, before rate limiting)
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, db: isMongoConnected() ? "up" : "down" }));
// Rate limiting for API routes (applied before routes, but after health check)
app.use("/api", rate_limit_middleware_1.apiRateLimit);
// Static file serving
const uploadsPath = path_1.default.resolve(process.cwd(), "uploads");
try {
    if (!fs_1.default.existsSync(uploadsPath)) {
        fs_1.default.mkdirSync(uploadsPath, { recursive: true });
        console.log("Created /uploads folder");
    }
}
catch (err) {
    console.error("Failed to create /uploads folder:", err);
}
app.use("/uploads", express_1.default.static(uploadsPath));
// Routes - Register all API routes BEFORE any blocking middleware
// IMPORTANT: Routes must be registered before 404 handler
app.use("/api/metrics", metrics_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bouquets", bouquet_routes_1.default);
app.use("/api/collections", collection_routes_1.default);
app.use("/api/hero-slider", hero_slider_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/customers", customer_routes_1.default);
app.use("/api/instagram", instagram_routes_1.default);
// Log registered routes (always log)
console.log("✅ Registered API routes:");
console.log("  - /api/metrics");
console.log("  - /api/auth");
console.log("  - /api/bouquets");
console.log("  - /api/collections");
console.log("  - /api/hero-slider");
console.log("  - /api/orders");
console.log("  - /api/customers");
console.log("  - /api/instagram");
// Debug middleware for API routes (always log for debugging)
app.use("/api", (req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}${req.url !== req.path ? ` (url: ${req.url})` : ""}`);
    next();
});
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
            "/api/customers",
            "/api/instagram"
        ]
    });
});
// 404 handler for other routes
app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
});
// Error handler (must be last)
app.use((err, _req, res, _next) => {
    console.error("❌ API error:", err);
    // Make upload/update failures understandable for the dashboard.
    if (err instanceof multer_1.default.MulterError) {
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
            await mongoose_1.default.connection.close().catch(() => undefined);
            process.exit(0);
        });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
    }
    catch (err) {
        console.error("❌ MongoDB connection error:", err);
        // In production we should fail fast; in dev allow UI work without DB.
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
}
start();
//# sourceMappingURL=server.js.map
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
function requireEnv(name) {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        console.error(`❌ ${name} not found in environment variables`);
        process.exit(1);
    }
    return value;
}
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = requireEnv("MONGO_URI");
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true }));
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
app.use("/api/metrics", metrics_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/bouquets", bouquet_routes_1.default);
app.use("/api/collections", collection_routes_1.default);
app.use("/api/hero-slider", hero_slider_routes_1.default);
async function start() {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map
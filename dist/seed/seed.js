"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user-model");
async function seedUser() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("❌ MONGO_URI not found in environment variables");
        process.exit(1);
    }
    const username = process.env.SEED_ADMIN_USERNAME || "admin";
    const email = process.env.SEED_ADMIN_EMAIL || "admin@giftforyou.idn";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        // Optional: remove existing admin with same username/email
        await user_model_1.UserModel.deleteMany({ $or: [{ username }, { email }] }).exec();
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await user_model_1.UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: "admin",
            isActive: true,
        });
        console.log("🌱 Admin user seeded:", String(user._id), user.username);
    }
    catch (error) {
        console.error("❌ Seed failed:", error);
        process.exitCode = 1;
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}
seedUser();
//# sourceMappingURL=seed.js.map
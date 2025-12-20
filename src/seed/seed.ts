import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user-model";

async function seedUser(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("❌ MONGO_URI not found in environment variables");
    process.exit(1);
  }

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@giftforyou.idn";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin12345";

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Optional: remove existing admin with same username/email
    await UserModel.deleteMany({ $or: [{ username }, { email }] }).exec();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("🌱 Admin user seeded:", String(user._id), user.username);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUser();

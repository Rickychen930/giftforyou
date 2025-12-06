import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user-model";

dotenv.config();

async function seedUser() {
  try {
    const mongoUri =
      "mongodb+srv://rickychen930_db_user:J7H1TJoadrfNCvoi@cluster0.shz44kq.mongodb.net/";
    if (!mongoUri) {
      console.error("❌ MONGO_URI not found in environment variables");
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log("✅ Connected to MongoDB");

    // Optional: clear existing users
    await User.deleteMany({});
    console.log("🧹 Cleared existing users");

    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("@Aphing071276", saltRounds);

    const user = await User.create({
      username: "Aphingphing",
      password: hashedPassword,
    });

    console.log("🌱 User seeded:", user._id.toString(), user.username);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedUser();

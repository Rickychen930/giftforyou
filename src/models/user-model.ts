// src/models/user-model.ts
import mongoose, { Schema, model, type Model } from "mongoose";

export type UserRole = "admin" | "customer";

export interface IUser {
  username: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * ✅ Export REAL mongoose model instance
 */
export const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || model<IUser>("User", UserSchema);

/**
 * Optional: service layer (nice and clean)
 */
export class UserService {
  static findByUsername(username: string) {
    return UserModel.findOne({ username }).exec();
  }

  static findByEmail(email: string) {
    return UserModel.findOne({ email }).exec();
  }

  static createUser(data: Partial<IUser>) {
    return UserModel.create(data);
  }
}

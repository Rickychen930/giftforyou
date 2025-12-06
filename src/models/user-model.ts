import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
});

export const User = model<IUser>("User", UserSchema);

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

const normalizeString = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const isValidEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const username = normalizeString(req.body.username);
    const email = normalizeString(req.body.email).toLowerCase();
    const password = normalizeString(req.body.password);

    if (username.length < 2) {
      res
        .status(400)
        .json({ error: "Username must be at least 2 characters." });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email." });
      return;
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
      return;
    }

    const [u1, u2] = await Promise.all([
      UserModel.findOne({ username }).lean().exec(),
      UserModel.findOne({ email }).lean().exec(),
    ]);

    if (u1) {
      res.status(409).json({ error: "Username already exists" });
      return;
    }
    if (u2) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    await UserModel.create({
      username,
      email,
      password: hashed,
      role: "admin", // change to "customer" if you want
      isActive: true,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register failed:", err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const username = normalizeString(req.body.username);
    const password = normalizeString(req.body.password);

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required." });
      return;
    }

    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "User is inactive." });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: String(user._id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      token,
      user: { id: String(user._id), username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Server error" });
  }
}

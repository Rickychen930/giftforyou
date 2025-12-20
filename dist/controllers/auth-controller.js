"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user-model");
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const normalizeString = (v) => (typeof v === "string" ? v.trim() : "");
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
async function createUser(req, res) {
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
            user_model_1.UserModel.findOne({ username }).lean().exec(),
            user_model_1.UserModel.findOne({ email }).lean().exec(),
        ]);
        if (u1) {
            res.status(409).json({ error: "Username already exists" });
            return;
        }
        if (u2) {
            res.status(409).json({ error: "Email already exists" });
            return;
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        await user_model_1.UserModel.create({
            username,
            email,
            password: hashed,
            role: "admin",
            isActive: true,
        });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Register failed:", err);
        res.status(500).json({ error: "Server error" });
    }
}
exports.createUser = createUser;
async function loginUser(req, res) {
    try {
        const username = normalizeString(req.body.username);
        const password = normalizeString(req.body.password);
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required." });
            return;
        }
        const user = await user_model_1.UserModel.findOne({ username }).exec();
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ error: "User is inactive." });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: String(user._id), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "5m" });
        res.status(200).json({
            token,
            user: { id: String(user._id), username: user.username, role: user.role },
        });
    }
    catch (err) {
        console.error("Login failed:", err);
        res.status(500).json({ error: "Server error" });
    }
}
exports.loginUser = loginUser;
//# sourceMappingURL=auth-controller.js.map
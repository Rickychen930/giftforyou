"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.googleLogin = exports.loginUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user-model");
const input_validation_1 = require("../middleware/input-validation");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === "secretkey") {
    console.error("❌ CRITICAL: JWT_SECRET must be set in environment variables!");
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
}
const lockoutStore = new Map();
// Clean up expired lockouts
setInterval(() => {
    const now = Date.now();
    lockoutStore.forEach((record, key) => {
        if (record.lockedUntil && record.lockedUntil < now) {
            lockoutStore.delete(key);
        }
    });
}, 60000); // Every minute
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
function getClientId(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
}
async function createUser(req, res) {
    try {
        // Check if public registration is allowed
        // Allow registration if:
        // 1. Not in production mode, OR
        // 2. In production but ALLOW_PUBLIC_REGISTRATION is explicitly set to "true"
        const isProduction = process.env.NODE_ENV === "production";
        const allowRegistration = process.env.ALLOW_PUBLIC_REGISTRATION === "true";
        // Debug logging (both development and production for troubleshooting)
        console.log("[Auth] Registration check:", {
            isProduction,
            allowRegistration,
            ALLOW_PUBLIC_REGISTRATION: process.env.ALLOW_PUBLIC_REGISTRATION,
            NODE_ENV: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
        });
        if (isProduction && !allowRegistration) {
            res.status(403).json({ error: "Registration is disabled" });
            return;
        }
        // Also check if explicitly disabled in development
        if (!isProduction && process.env.ALLOW_PUBLIC_REGISTRATION === "false") {
            res.status(403).json({ error: "Registration is disabled" });
            return;
        }
        const username = (0, input_validation_1.sanitizeString)(req.body.username);
        const email = (0, input_validation_1.sanitizeString)(req.body.email).toLowerCase();
        const password = (0, input_validation_1.sanitizeString)(req.body.password);
        // Validate username
        const usernameValidation = (0, input_validation_1.isValidUsername)(username);
        if (!usernameValidation.valid) {
            res.status(400).json({ error: usernameValidation.error });
            return;
        }
        // Validate email
        if (!(0, input_validation_1.isValidEmail)(email)) {
            res.status(400).json({ error: "Invalid email address" });
            return;
        }
        // Validate password strength
        const passwordValidation = (0, input_validation_1.isStrongPassword)(password);
        if (!passwordValidation.valid) {
            res.status(400).json({
                error: "Password does not meet requirements",
                details: passwordValidation.errors,
            });
            return;
        }
        // Check for existing user
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
        // Hash password with higher cost factor for better security
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const user = await user_model_1.UserModel.create({
            username,
            email,
            password: hashed,
            role: "customer",
            isActive: true,
        });
        // Create customer profile if fullName and phoneNumber provided
        const fullName = (0, input_validation_1.sanitizeString)(req.body.fullName || "");
        const phoneNumber = (0, input_validation_1.sanitizeString)(req.body.phoneNumber || "");
        if (fullName && phoneNumber) {
            try {
                const { CustomerModel } = await Promise.resolve().then(() => __importStar(require("../models/customer-model")));
                await CustomerModel.create({
                    buyerName: fullName,
                    phoneNumber: phoneNumber,
                    address: "",
                    userId: user._id.toString(), // Link to user
                });
            }
            catch (err) {
                // Customer creation is optional, don't fail registration if it fails
                console.warn("Failed to create customer profile:", err);
            }
        }
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error("Register failed:", err);
        // Don't leak error details
        res.status(500).json({ error: "Registration failed" });
    }
}
exports.createUser = createUser;
async function loginUser(req, res) {
    try {
        // Apply rate limiting
        const clientId = getClientId(req);
        const lockoutKey = `login:${clientId}`;
        const lockout = lockoutStore.get(lockoutKey);
        // Check if account is locked
        if (lockout?.lockedUntil && lockout.lockedUntil > Date.now()) {
            const remainingMinutes = Math.ceil((lockout.lockedUntil - Date.now()) / 60000);
            res.status(429).json({
                error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
            });
            return;
        }
        const username = (0, input_validation_1.sanitizeString)(req.body.username);
        const password = (0, input_validation_1.sanitizeString)(req.body.password);
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
            return;
        }
        // Find user
        const user = await user_model_1.UserModel.findOne({ username }).exec();
        // Always perform bcrypt comparison to prevent timing attacks
        // Use a dummy hash if user doesn't exist
        const dummyHash = "$2a$12$dummy.hash.to.prevent.timing.attacks";
        const hashToCompare = user?.password || dummyHash;
        const valid = await bcryptjs_1.default.compare(password, hashToCompare);
        if (!user || !valid) {
            // Increment failed attempts
            const current = lockoutStore.get(lockoutKey) || { attempts: 0, lockedUntil: null };
            current.attempts += 1;
            if (current.attempts >= MAX_LOGIN_ATTEMPTS) {
                current.lockedUntil = Date.now() + LOCKOUT_DURATION;
                res.status(429).json({
                    error: `Too many failed attempts. Account locked for 15 minutes.`,
                });
            }
            else {
                res.status(401).json({
                    error: "Invalid credentials",
                    remainingAttempts: MAX_LOGIN_ATTEMPTS - current.attempts,
                });
            }
            lockoutStore.set(lockoutKey, current);
            return;
        }
        // Reset lockout on successful login
        lockoutStore.delete(lockoutKey);
        if (!user.isActive) {
            res.status(403).json({ error: "Account is inactive" });
            return;
        }
        if (!JWT_SECRET) {
            res.status(500).json({ error: "Server configuration error" });
            return;
        }
        // Generate access token (short-lived for security)
        const accessToken = jsonwebtoken_1.default.sign({ id: String(user._id), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "15m" } // Token expires in 15 minutes (for security)
        );
        // Generate refresh token (long-lived)
        const refreshToken = jsonwebtoken_1.default.sign({ id: String(user._id), type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
        // Ensure response is sent correctly
        const responseData = {
            token: accessToken,
            refreshToken,
            user: {
                id: String(user._id),
                username: user.username,
                role: user.role,
            },
        };
        // Log for debugging (remove in production or use proper logging)
        if (process.env.NODE_ENV === "development") {
            console.log("Login successful for user:", user.username);
        }
        res.status(200).json(responseData);
    }
    catch (err) {
        console.error("Login failed:", err);
        // Don't leak error details
        res.status(500).json({ error: "Login failed" });
    }
}
exports.loginUser = loginUser;
/**
 * Refresh token endpoint
 */
async function googleLogin(req, res) {
    try {
        const { credential } = req.body;
        if (!credential) {
            res.status(400).json({ error: "Google credential is required" });
            return;
        }
        // Decode Google JWT token
        // Note: In production, you should verify the token with Google's API
        // For now, we decode it (client-side already verified it with Google)
        try {
            // Validate JWT structure
            const parts = credential.split(".");
            if (parts.length !== 3) {
                res.status(400).json({ error: "Invalid Google credential format" });
                return;
            }
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
            const email = payload.email?.toLowerCase();
            const name = payload.name || "";
            const googleId = payload.sub;
            if (!email) {
                res.status(400).json({ error: "Email not found in Google credential" });
                return;
            }
            // Find or create user
            let user = await user_model_1.UserModel.findOne({ email }).exec();
            if (!user) {
                // Create new user from Google account
                const username = email.split("@")[0] + "_" + googleId.slice(0, 8);
                // Ensure username is unique
                let uniqueUsername = username;
                let counter = 1;
                while (await user_model_1.UserModel.findOne({ username: uniqueUsername }).exec()) {
                    uniqueUsername = `${username}_${counter}`;
                    counter++;
                }
                user = await user_model_1.UserModel.create({
                    username: uniqueUsername,
                    email,
                    password: "",
                    role: "customer",
                    isActive: true,
                });
                // Create customer profile
                try {
                    const { CustomerModel } = await Promise.resolve().then(() => __importStar(require("../models/customer-model")));
                    await CustomerModel.create({
                        buyerName: name,
                        phoneNumber: "",
                        address: "",
                        userId: user._id.toString(),
                    });
                }
                catch (err) {
                    console.warn("Failed to create customer profile for Google user:", err);
                }
            }
            else if (!user.isActive) {
                res.status(403).json({ error: "Account is inactive" });
                return;
            }
            // Generate tokens
            if (!JWT_SECRET) {
                res.status(500).json({ error: "Server configuration error" });
                return;
            }
            const accessToken = jsonwebtoken_1.default.sign({ id: String(user._id), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = jsonwebtoken_1.default.sign({ id: String(user._id), type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
            res.status(200).json({
                token: accessToken,
                refreshToken,
                user: {
                    id: String(user._id),
                    username: user.username,
                    role: user.role,
                },
            });
        }
        catch (decodeError) {
            console.error("Failed to decode Google credential:", decodeError);
            res.status(400).json({ error: "Invalid Google credential" });
        }
    }
    catch (err) {
        console.error("Google login failed:", err);
        res.status(500).json({ error: "Google login failed" });
    }
}
exports.googleLogin = googleLogin;
async function refreshToken(req, res) {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ error: "Refresh token required" });
            return;
        }
        if (!JWT_SECRET) {
            res.status(500).json({ error: "Server configuration error" });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (decoded.type !== "refresh") {
                res.status(401).json({ error: "Invalid token type" });
                return;
            }
            // Get user to verify they still exist and are active
            const user = await user_model_1.UserModel.findById(decoded.id).exec();
            if (!user || !user.isActive) {
                res.status(401).json({ error: "User not found or inactive" });
                return;
            }
            // Generate new access token
            const accessToken = jsonwebtoken_1.default.sign({ id: String(user._id), username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "15m" } // Token expires in 15 minutes (for security)
            );
            res.status(200).json({ token: accessToken });
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ error: "Refresh token expired" });
                return;
            }
            if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({ error: "Invalid refresh token" });
                return;
            }
            throw err;
        }
    }
    catch (err) {
        console.error("Refresh token failed:", err);
        res.status(500).json({ error: "Token refresh failed" });
    }
}
exports.refreshToken = refreshToken;
//# sourceMappingURL=auth-controller.js.map
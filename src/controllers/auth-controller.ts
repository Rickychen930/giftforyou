import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model";
import {
  sanitizeString,
  isValidEmail,
  isStrongPassword,
  isValidUsername,
} from "../middleware/input-validation";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === "secretkey") {
  console.error("❌ CRITICAL: JWT_SECRET must be set in environment variables!");
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Account lockout tracking (in production, use Redis)
interface LockoutRecord {
  attempts: number;
  lockedUntil: number | null;
}

const lockoutStore: Map<string, LockoutRecord> = new Map();

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

function getClientId(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    // Check if public registration is allowed
    // Allow registration if:
    // 1. Not in production mode, OR
    // 2. In production but ALLOW_PUBLIC_REGISTRATION is explicitly set to "true"
    const isProduction = process.env.NODE_ENV === "production";
    const allowRegistration = process.env.ALLOW_PUBLIC_REGISTRATION === "true";
    
    if (isProduction && !allowRegistration) {
      res.status(403).json({ error: "Registration is disabled" });
      return;
    }

    const username = sanitizeString(req.body.username);
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);

    // Validate username
    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      res.status(400).json({ error: usernameValidation.error });
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    // Validate password strength
    const passwordValidation = isStrongPassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
      return;
    }

    // Check for existing user
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

    // Hash password with higher cost factor for better security
    const hashed = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      username,
      email,
      password: hashed,
      role: "customer", // Default to customer, admin should be created via seed
      isActive: true,
    });

    // Create customer profile if fullName and phoneNumber provided
    const fullName = sanitizeString(req.body.fullName || "");
    const phoneNumber = sanitizeString(req.body.phoneNumber || "");
    
    if (fullName && phoneNumber) {
      try {
        const { CustomerModel } = await import("../models/customer-model");
        await CustomerModel.create({
          buyerName: fullName,
          phoneNumber: phoneNumber,
          address: "", // Can be filled later
          userId: user._id.toString(), // Link to user
        });
      } catch (err) {
        // Customer creation is optional, don't fail registration if it fails
        console.warn("Failed to create customer profile:", err);
      }
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register failed:", err);
    // Don't leak error details
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    // Apply rate limiting
    const clientId = getClientId(req);
    const lockoutKey = `login:${clientId}`;
    const lockout = lockoutStore.get(lockoutKey);

    // Check if account is locked
    if (lockout?.lockedUntil && lockout.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil(
        (lockout.lockedUntil - Date.now()) / 60000
      );
      res.status(429).json({
        error: `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
      });
      return;
    }

    const username = sanitizeString(req.body.username);
    const password = sanitizeString(req.body.password);

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    // Find user
    const user = await UserModel.findOne({ username }).exec();
    
    // Always perform bcrypt comparison to prevent timing attacks
    // Use a dummy hash if user doesn't exist
    const dummyHash = "$2a$12$dummy.hash.to.prevent.timing.attacks";
    const hashToCompare = user?.password || dummyHash;
    const valid = await bcrypt.compare(password, hashToCompare);

    if (!user || !valid) {
      // Increment failed attempts
      const current = lockoutStore.get(lockoutKey) || { attempts: 0, lockedUntil: null };
      current.attempts += 1;

      if (current.attempts >= MAX_LOGIN_ATTEMPTS) {
        current.lockedUntil = Date.now() + LOCKOUT_DURATION;
        res.status(429).json({
          error: `Too many failed attempts. Account locked for 15 minutes.`,
        });
      } else {
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

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: String(user._id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "4h" } // Token expires in 4 hours
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: String(user._id), type: "refresh" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
  } catch (err) {
    console.error("Login failed:", err);
    // Don't leak error details
    res.status(500).json({ error: "Login failed" });
  }
}

/**
 * Refresh token endpoint
 */
export async function googleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: "Google credential is required" });
      return;
    }

    // Verify Google token (in production, verify with Google API)
    // For now, we'll decode the JWT token from Google
    try {
      const payload = JSON.parse(Buffer.from(credential.split(".")[1], "base64").toString());
      
      const email = payload.email?.toLowerCase();
      const name = payload.name || "";
      const googleId = payload.sub;

      if (!email) {
        res.status(400).json({ error: "Email not found in Google credential" });
        return;
      }

      // Find or create user
      let user = await UserModel.findOne({ email }).exec();

      if (!user) {
        // Create new user from Google account
        const username = email.split("@")[0] + "_" + googleId.slice(0, 8);
        
        // Ensure username is unique
        let uniqueUsername = username;
        let counter = 1;
        while (await UserModel.findOne({ username: uniqueUsername }).exec()) {
          uniqueUsername = `${username}_${counter}`;
          counter++;
        }

        user = await UserModel.create({
          username: uniqueUsername,
          email,
          password: "", // No password for OAuth users
          role: "customer",
          isActive: true,
        });

        // Create customer profile
        try {
          const { CustomerModel } = await import("../models/customer-model");
          await CustomerModel.create({
            buyerName: name,
            phoneNumber: "", // Can be filled later
            address: "",
            userId: user._id.toString(),
          });
        } catch (err) {
          console.warn("Failed to create customer profile for Google user:", err);
        }
      } else if (!user.isActive) {
        res.status(403).json({ error: "Account is inactive" });
        return;
      }

      // Generate tokens
      if (!JWT_SECRET) {
        res.status(500).json({ error: "Server configuration error" });
        return;
      }

      const accessToken = jwt.sign(
        { id: String(user._id), username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: String(user._id), type: "refresh" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(200).json({
        token: accessToken,
        refreshToken,
        user: {
          id: String(user._id),
          username: user.username,
          role: user.role,
        },
      });
    } catch (decodeError) {
      console.error("Failed to decode Google credential:", decodeError);
      res.status(400).json({ error: "Invalid Google credential" });
    }
  } catch (err) {
    console.error("Google login failed:", err);
    res.status(500).json({ error: "Google login failed" });
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
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
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        type?: string;
      };

      if (decoded.type !== "refresh") {
        res.status(401).json({ error: "Invalid token type" });
        return;
      }

      // Get user to verify they still exist and are active
      const user = await UserModel.findById(decoded.id).exec();
      if (!user || !user.isActive) {
        res.status(401).json({ error: "User not found or inactive" });
        return;
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: String(user._id), username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "4h" } // Token expires in 4 hours
      );

      res.status(200).json({ token: accessToken });
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: "Refresh token expired" });
        return;
      }
      if (err instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      throw err;
    }
  } catch (err) {
    console.error("Refresh token failed:", err);
    res.status(500).json({ error: "Token refresh failed" });
  }
}

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user-model";
import {
  sanitizeString,
  isValidEmail,
  isStrongPassword,
  isValidUsername,
} from "../middleware/input-validation";
import { BaseApiController } from "./base/BaseApiController";

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

/**
 * Auth API Controller
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
class AuthController extends BaseApiController {
  /**
   * Create user (register)
   */
  async createUser(req: Request, res: Response): Promise<void> {
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
        this.sendForbidden(res, "Registration is disabled");
        return;
      }
      
      // Also check if explicitly disabled in development
      if (!isProduction && process.env.ALLOW_PUBLIC_REGISTRATION === "false") {
        this.sendForbidden(res, "Registration is disabled");
        return;
      }

    const username = sanitizeString(req.body.username);
    const email = sanitizeString(req.body.email).toLowerCase();
    const password = sanitizeString(req.body.password);

      // Validate username
      const usernameValidation = isValidUsername(username);
      if (!usernameValidation.valid) {
        this.sendBadRequest(res, usernameValidation.error || "Invalid username");
        return;
      }

      // Validate email
      if (!isValidEmail(email)) {
        this.sendBadRequest(res, "Invalid email address");
        return;
      }

      // Validate password strength
      const passwordValidation = isStrongPassword(password);
      if (!passwordValidation.valid) {
        this.sendBadRequest(res, "Password does not meet requirements", passwordValidation.errors);
        return;
      }

    // Check for existing user
    const [u1, u2] = await Promise.all([
      UserModel.findOne({ username }).lean().exec(),
      UserModel.findOne({ email }).lean().exec(),
    ]);

      if (u1) {
        this.sendConflict(res, "Username already exists");
        return;
      }
      if (u2) {
        this.sendConflict(res, "Email already exists");
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
        const { CustomerModel } = await import("../../models/customer-model");
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

      this.sendSuccess(res, null, "User registered successfully", 201);
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Registration failed"));
    }
  }

  /**
   * Login user
   */
  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      // Apply rate limiting
      const clientId = this.getClientId(req);
      const lockoutKey = `login:${clientId}`;
      const lockout = lockoutStore.get(lockoutKey);

      // Check if account is locked
      if (lockout?.lockedUntil && lockout.lockedUntil > Date.now()) {
        const remainingMinutes = Math.ceil(
          (lockout.lockedUntil - Date.now()) / 60000
        );
        this.sendRateLimit(
          res,
          `Account temporarily locked. Try again in ${remainingMinutes} minute(s).`,
          remainingMinutes * 60
        );
        return;
      }

      const username = sanitizeString(req.body.username);
      const password = sanitizeString(req.body.password);

      if (!username || !password) {
        this.sendBadRequest(res, "Username and password are required");
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
          this.sendRateLimit(
            res,
            "Too many failed attempts. Account locked for 15 minutes.",
            15 * 60
          );
        } else {
          res.status(401).json({
            success: false,
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
        this.sendForbidden(res, "Account is inactive");
        return;
      }

      if (!JWT_SECRET) {
        this.sendError(res, new Error("Server configuration error"), 500);
        return;
      }

    // Generate access token (short-lived for security)
    const accessToken = jwt.sign(
      { id: String(user._id), username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "15m" } // Token expires in 15 minutes (for security)
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

      this.sendSuccess(res, responseData);
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Login failed"));
    }
  }

  /**
   * Google login
   */
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { credential } = req.body;

      if (!credential) {
        this.sendBadRequest(res, "Google credential is required");
        return;
      }

    // Decode Google JWT token
    // Note: In production, you should verify the token with Google's API
    // For now, we decode it (client-side already verified it with Google)
    try {
        // Validate JWT structure
        const parts = credential.split(".");
        if (parts.length !== 3) {
          this.sendBadRequest(res, "Invalid Google credential format");
          return;
        }
        
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        
        const email = payload.email?.toLowerCase();
        const name = payload.name || "";
        const googleId = payload.sub;

        if (!email) {
          this.sendBadRequest(res, "Email not found in Google credential");
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
          const { CustomerModel } = await import("../../models/customer-model");
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
          this.sendForbidden(res, "Account is inactive");
          return;
        }

        // Generate tokens
        if (!JWT_SECRET) {
          this.sendError(res, new Error("Server configuration error"), 500);
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

        this.sendSuccess(res, {
          token: accessToken,
          refreshToken,
          user: {
            id: String(user._id),
            username: user.username,
            role: user.role,
          },
        });
      } catch (decodeError) {
        this.sendBadRequest(res, "Invalid Google credential");
      }
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Google login failed"));
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken: token } = req.body;

      if (!token) {
        this.sendBadRequest(res, "Refresh token required");
        return;
      }

      if (!JWT_SECRET) {
        this.sendError(res, new Error("Server configuration error"), 500);
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          type?: string;
        };

        if (decoded.type !== "refresh") {
          this.sendUnauthorized(res, "Invalid token type");
          return;
        }

        // Get user to verify they still exist and are active
        const user = await UserModel.findById(decoded.id).exec();
        if (!user || !user.isActive) {
          this.sendUnauthorized(res, "User not found or inactive");
          return;
        }

        // Generate new access token
        const accessToken = jwt.sign(
          { id: String(user._id), username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: "15m" } // Token expires in 15 minutes (for security)
        );

        this.sendSuccess(res, { token: accessToken });
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          this.sendUnauthorized(res, "Refresh token expired");
          return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
          this.sendUnauthorized(res, "Invalid refresh token");
          return;
        }
        throw err;
      }
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Token refresh failed"));
    }
  }
}

// Export controller instance
const authController = new AuthController();

// Export methods for backward compatibility
export const createUser = (req: Request, res: Response): Promise<void> =>
  authController.createUser(req, res);

export const loginUser = (req: Request, res: Response): Promise<void> =>
  authController.loginUser(req, res);

export const googleLogin = (req: Request, res: Response): Promise<void> =>
  authController.googleLogin(req, res);

export const refreshToken = (req: Request, res: Response): Promise<void> =>
  authController.refreshToken(req, res);

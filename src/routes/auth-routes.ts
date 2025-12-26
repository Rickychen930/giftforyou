// src/routes/auth-routes.ts
import { Router } from "express";
import { loginUser, createUser, refreshToken } from "../controllers/auth-controller";
import { loginRateLimit } from "../middleware/rate-limit-middleware";

const router = Router();

/**
 * Auth routes
 * POST /api/auth/login        -> login and return JWT + refresh token
 * POST /api/auth/register     -> (optional) create user (disabled in production by default)
 * POST /api/auth/refresh      -> refresh access token using refresh token
 *
 * Security:
 * - Rate limiting applied to login
 * - Registration disabled in production unless ALLOW_PUBLIC_REGISTRATION=true
 * - Strong password requirements enforced
 */

// ✅ login (needed) - with rate limiting
router.post("/login", loginRateLimit, loginUser);

// ✅ refresh token endpoint
router.post("/refresh", refreshToken);

// ✅ register (optional). Disabled in production by default.
// Set ALLOW_PUBLIC_REGISTRATION=true in .env to enable in production
router.post("/register", createUser);

export default router;

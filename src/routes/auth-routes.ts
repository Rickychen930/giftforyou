// src/routes/auth-routes.ts
import { Router } from "express";
import { loginUser, createUser } from "../controllers/auth-controller";

const router = Router();

/**
 * Auth routes
 * POST /api/auth/login     -> login and return JWT
 * POST /api/auth/register  -> (optional) create user
 *
 * Recommendation:
 * - In production, disable /register or protect it (admin-only / internal use)
 */

// ✅ login (needed)
router.post("/login", loginUser);

// ✅ register (optional). Remove this line if you don't want public registration.
router.post("/register", createUser);

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth-routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const rate_limit_middleware_1 = require("../middleware/rate-limit-middleware");
const router = (0, express_1.Router)();
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
router.post("/login", rate_limit_middleware_1.loginRateLimit, auth_controller_1.loginUser);
// ✅ refresh token endpoint
router.post("/refresh", auth_controller_1.refreshToken);
// ✅ register (optional). Disabled in production by default.
// Set ALLOW_PUBLIC_REGISTRATION=true in .env to enable in production
router.post("/register", auth_controller_1.createUser);
// ✅ Google OAuth login
router.post("/google", auth_controller_1.googleLogin);
exports.default = router;
//# sourceMappingURL=auth-routes.js.map
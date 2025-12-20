"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth-routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const router = (0, express_1.Router)();
/**
 * Auth routes
 * POST /api/auth/login     -> login and return JWT
 * POST /api/auth/register  -> (optional) create user
 *
 * Recommendation:
 * - In production, disable /register or protect it (admin-only / internal use)
 */
// ✅ login (needed)
router.post("/login", auth_controller_1.loginUser);
// ✅ register (optional). Remove this line if you don't want public registration.
router.post("/register", auth_controller_1.createUser);
exports.default = router;
//# sourceMappingURL=auth-routes.js.map
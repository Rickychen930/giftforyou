"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === "secretkey") {
    console.error("❌ CRITICAL: JWT_SECRET must be set in environment variables!");
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
}
/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        if (!JWT_SECRET) {
            res.status(500).json({ error: "Server configuration error" });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,
            };
            next();
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ error: "Token expired" });
                return;
            }
            if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({ error: "Invalid token" });
                return;
            }
            throw err;
        }
    }
    catch (err) {
        console.error("Auth middleware error:", err);
        res.status(500).json({ error: "Authentication error" });
    }
};
exports.authenticate = authenticate;
/**
 * Role-based authorization middleware
 * Use after authenticate middleware
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Admin-only middleware (convenience wrapper)
 */
exports.requireAdmin = (0, exports.requireRole)("admin");
//# sourceMappingURL=auth-middleware.js.map
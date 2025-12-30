"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimit = exports.loginRateLimit = exports.rateLimit = void 0;
const store = {};
/**
 * Clean up expired entries periodically
 */
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 60000); // Clean up every minute
/**
 * Get client identifier (IP address or user ID)
 */
function getClientId(req) {
    // In production behind proxy, use X-Forwarded-For
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
}
/**
 * Rate limiting middleware
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds
 * @param message Custom error message
 */
const rateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000, // 15 minutes default
message = "Too many requests. Please try again later.") => {
    return (req, res, next) => {
        const clientId = getClientId(req);
        const now = Date.now();
        const key = `${req.path}:${clientId}`;
        const record = store[key];
        if (!record || record.resetTime < now) {
            // Create new record or reset expired one
            store[key] = {
                count: 1,
                resetTime: now + windowMs,
            };
            return next();
        }
        if (record.count >= maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res
                .status(429)
                .setHeader("Retry-After", String(retryAfter))
                .json({
                error: message,
                retryAfter,
            });
            return;
        }
        record.count += 1;
        next();
    };
};
exports.rateLimit = rateLimit;
/**
 * Strict rate limiter for login attempts
 * 5 attempts per 15 minutes
 */
exports.loginRateLimit = (0, exports.rateLimit)(5, 15 * 60 * 1000, "Too many login attempts. Please try again later.");
/**
 * API rate limiter
 * 100 requests per 15 minutes
 */
exports.apiRateLimit = (0, exports.rateLimit)(100, 15 * 60 * 1000, "API rate limit exceeded. Please try again later.");
//# sourceMappingURL=rate-limit-middleware.js.map
import type { Request, Response, NextFunction } from "express";

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting (e.g., express-rate-limit with Redis)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

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
function getClientId(req: Request): string {
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
export const rateLimit = (
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes default
  message: string = "Too many requests. Please try again later."
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * Strict rate limiter for login attempts
 * 5 attempts per 15 minutes
 */
export const loginRateLimit = rateLimit(5, 15 * 60 * 1000, "Too many login attempts. Please try again later.");

/**
 * API rate limiter
 * 100 requests per 15 minutes
 */
export const apiRateLimit = rateLimit(100, 15 * 60 * 1000, "API rate limit exceeded. Please try again later.");


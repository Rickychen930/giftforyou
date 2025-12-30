"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = void 0;
/**
 * Security headers middleware
 * Implements OWASP security best practices
 */
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Enable XSS protection (legacy browsers)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Permissions Policy (formerly Feature Policy)
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    // Content Security Policy (CSP)
    // Adjust based on your needs
    const isProduction = process.env.NODE_ENV === "production";
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust for React
        "style-src 'self' 'unsafe-inline'", // Adjust for CSS
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);
    // Strict Transport Security (HSTS) - only in production with HTTPS
    if (isProduction) {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
    next();
};
exports.securityHeaders = securityHeaders;
//# sourceMappingURL=security-headers.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
exports.sanitizeString = sanitizeString;
exports.isValidEmail = isValidEmail;
exports.isStrongPassword = isStrongPassword;
exports.isValidUsername = isValidUsername;
/**
 * Input sanitization and validation utilities
 */
/**
 * Sanitize string input
 * Removes potentially dangerous characters
 */
function sanitizeString(input) {
    if (typeof input !== "string")
        return "";
    return input
        .trim()
        .replace(/[<>]/g, "") // Remove < and > to prevent XSS
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+=/gi, ""); // Remove event handlers
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321
}
/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function isStrongPassword(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (password.length > 128) {
        errors.push("Password must be less than 128 characters");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Validate username
 */
function isValidUsername(username) {
    if (username.length < 3) {
        return { valid: false, error: "Username must be at least 3 characters" };
    }
    if (username.length > 30) {
        return { valid: false, error: "Username must be less than 30 characters" };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return {
            valid: false,
            error: "Username can only contain letters, numbers, underscores, and hyphens",
        };
    }
    return { valid: true };
}
/**
 * Middleware to validate request body
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const errors = [];
        for (const [field, validator] of Object.entries(schema)) {
            const result = validator(req.body[field]);
            if (!result.valid && result.error) {
                errors.push(result.error);
            }
        }
        if (errors.length > 0) {
            res.status(400).json({ error: errors.join(", ") });
            return;
        }
        next();
    };
};
exports.validateBody = validateBody;
//# sourceMappingURL=input-validation.js.map
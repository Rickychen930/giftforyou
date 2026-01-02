"use strict";
/**
 * Shared validation and normalization utilities
 * Used across controllers and components to ensure consistency
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPhone = exports.isValidEmail = exports.escapeRegex = exports.parseCsvList = exports.parseNonNegativeInt = exports.parseBoolean = exports.parsePrice = exports.normalizeString = exports.isNonEmptyString = void 0;
/**
 * Check if value is a non-empty string
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}
exports.isNonEmptyString = isNonEmptyString;
/**
 * Normalize string value with optional max length
 */
function normalizeString(value, fallback = "", maxLength) {
    if (typeof value !== "string")
        return fallback;
    const trimmed = value.trim();
    if (maxLength && trimmed.length > maxLength) {
        return trimmed.slice(0, maxLength);
    }
    return trimmed || fallback;
}
exports.normalizeString = normalizeString;
/**
 * Parse price/number value safely
 * Returns NaN if value cannot be parsed
 */
function parsePrice(value) {
    if (value === null || value === undefined)
        return NaN;
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : NaN;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "")
            return NaN;
        const n = Number(trimmed);
        return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
}
exports.parsePrice = parsePrice;
/**
 * Parse boolean value from various formats
 */
function parseBoolean(value) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "number")
        return value === 1;
    if (typeof value !== "string")
        return false;
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes" || v === "on";
}
exports.parseBoolean = parseBoolean;
/**
 * Parse non-negative integer
 */
function parseNonNegativeInt(value) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n))
        return 0;
    return Math.max(0, Math.trunc(n));
}
exports.parseNonNegativeInt = parseNonNegativeInt;
/**
 * Parse CSV list (comma or newline separated)
 */
function parseCsvList(value) {
    if (Array.isArray(value)) {
        return value
            .map((v) => (typeof v === "string" ? v.trim() : ""))
            .filter(Boolean);
    }
    if (typeof value !== "string")
        return [];
    return value
        .split(/[\n,]/g)
        .map((v) => v.trim())
        .filter(Boolean);
}
exports.parseCsvList = parseCsvList;
/**
 * Escape regex special characters
 */
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
exports.escapeRegex = escapeRegex;
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
exports.isValidEmail = isValidEmail;
/**
 * Validate phone number (basic validation)
 */
function isValidPhone(phone) {
    // eslint-disable-next-line no-useless-escape
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 8;
}
exports.isValidPhone = isValidPhone;
//# sourceMappingURL=validation.js.map
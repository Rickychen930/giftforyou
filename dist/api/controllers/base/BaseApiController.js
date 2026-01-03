"use strict";
/**
 * Base API Controller
 * Provides common functionality for all API controllers
 * Follows SOLID principles: Single Responsibility, Open/Closed, Dependency Inversion
 * Implements DRY (Don't Repeat Yourself) principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.BaseApiController = void 0;
/**
 * Base API Controller Class
 * Provides reusable functionality for:
 * - Standardized error handling
 * - Response formatting
 * - Input validation
 * - Logging
 */
class BaseApiController {
    /**
     * Send success response
     */
    sendSuccess(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            ...(message && { message }),
        };
        res.status(statusCode).json(response);
    }
    /**
     * Send error response
     */
    sendError(res, error, statusCode = 500, details) {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorResponse = {
            error: errorMessage,
            ...(details && { details }),
        };
        // Log error for debugging
        console.error(`[${this.constructor.name}] Error:`, {
            message: errorMessage,
            statusCode,
            details,
            ...(error instanceof Error && { stack: error.stack }),
        });
        res.status(statusCode).json(errorResponse);
    }
    /**
     * Send not found response
     */
    sendNotFound(res, message = "Resource not found") {
        this.sendError(res, message, 404);
    }
    /**
     * Send bad request response
     */
    sendBadRequest(res, message, details) {
        this.sendError(res, message, 400, details);
    }
    /**
     * Send unauthorized response
     */
    sendUnauthorized(res, message = "Unauthorized") {
        this.sendError(res, message, 401);
    }
    /**
     * Send forbidden response
     */
    sendForbidden(res, message = "Forbidden") {
        this.sendError(res, message, 403);
    }
    /**
     * Send conflict response
     */
    sendConflict(res, message) {
        this.sendError(res, message, 409);
    }
    /**
     * Send rate limit response
     */
    sendRateLimit(res, message = "Too many requests", retryAfter) {
        const headers = {};
        if (retryAfter) {
            headers["Retry-After"] = String(retryAfter);
        }
        res.status(429).header(headers).json({
            success: false,
            error: message,
            retryAfter,
        });
    }
    /**
     * Handle async errors
     * Wraps async controller methods to catch errors
     */
    asyncHandler(fn) {
        return async (req, res) => {
            try {
                await fn(req, res);
            }
            catch (error) {
                this.handleAsyncError(error, res);
            }
        };
    }
    /**
     * Handle async errors
     */
    handleAsyncError(error, res) {
        if (error instanceof Error) {
            // Check for specific error types
            if (error.name === "ValidationError") {
                this.sendBadRequest(res, error.message);
            }
            else if (error.name === "CastError") {
                this.sendBadRequest(res, "Invalid ID format");
            }
            else if (error.message.includes("duplicate key")) {
                this.sendConflict(res, "Resource already exists");
            }
            else {
                this.sendError(res, error, 500);
            }
        }
        else {
            this.sendError(res, "Unknown error occurred", 500);
        }
    }
    /**
     * Validate required fields
     */
    validateRequired(data, fields) {
        const missingFields = fields.filter((field) => {
            const value = data[field];
            return value === undefined || value === null || value === "";
        });
        return {
            isValid: missingFields.length === 0,
            missingFields,
        };
    }
    /**
     * Get client IP address
     */
    getClientId(req) {
        const forwarded = req.headers["x-forwarded-for"];
        if (typeof forwarded === "string") {
            return forwarded.split(",")[0].trim();
        }
        return req.ip || req.socket.remoteAddress || "unknown";
    }
    /**
     * Check if request is from development environment
     */
    isDevelopment() {
        return process.env.NODE_ENV !== "production";
    }
    /**
     * Format user-friendly error messages
     */
    formatUserFriendlyError(error) {
        // Map technical errors to user-friendly messages
        const errorMap = {
            "E11000": "Data dengan informasi ini sudah ada. Silakan gunakan informasi yang berbeda.",
            "duplicate key": "Data dengan informasi ini sudah ada. Silakan gunakan informasi yang berbeda.",
            "validation failed": "Data yang diinput tidak valid. Pastikan semua field sudah diisi dengan benar.",
            "CastError": "Format data tidak valid. Pastikan semua field sudah diisi dengan benar.",
            "EACCES": "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator.",
            "EPERM": "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator.",
            "permission": "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator.",
            "ENOSPC": "Ruang penyimpanan penuh. Silakan hapus file lama atau hubungi administrator.",
            "too large": "File terlalu besar. Silakan gunakan file yang lebih kecil.",
            "terlalu besar": "File terlalu besar. Silakan gunakan file yang lebih kecil.",
            "Empty": "File kosong. Silakan pilih file yang valid.",
            "kosong": "File kosong. Silakan pilih file yang valid.",
        };
        for (const [key, message] of Object.entries(errorMap)) {
            if (error.includes(key)) {
                return message;
            }
        }
        return error;
    }
}
exports.BaseApiController = BaseApiController;
/**
 * Decorator for async controller methods
 * Automatically handles errors
 */
function asyncHandler(target, propertyName, descriptor) {
    const method = descriptor.value;
    const controller = target.constructor;
    descriptor.value = async function (req, res) {
        try {
            await method.call(this, req, res);
        }
        catch (error) {
            const baseController = new controller();
            baseController.handleAsyncError(error, res);
        }
    };
}
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=BaseApiController.js.map
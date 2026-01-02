/**
 * Base API Controller
 * Provides common functionality for all API controllers
 * Follows SOLID principles: Single Responsibility, Open/Closed, Dependency Inversion
 * Implements DRY (Don't Repeat Yourself) principle
 */

import type { Request, Response } from "express";

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

/**
 * Base API Controller Class
 * Provides reusable functionality for:
 * - Standardized error handling
 * - Response formatting
 * - Input validation
 * - Logging
 */
export abstract class BaseApiController {
  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    error: string | Error,
    statusCode: number = 500,
    details?: any
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorResponse: ErrorResponse = {
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
  protected sendNotFound(res: Response, message: string = "Resource not found"): void {
    this.sendError(res, message, 404);
  }

  /**
   * Send bad request response
   */
  protected sendBadRequest(res: Response, message: string, details?: any): void {
    this.sendError(res, message, 400, details);
  }

  /**
   * Send unauthorized response
   */
  protected sendUnauthorized(res: Response, message: string = "Unauthorized"): void {
    this.sendError(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  protected sendForbidden(res: Response, message: string = "Forbidden"): void {
    this.sendError(res, message, 403);
  }

  /**
   * Send conflict response
   */
  protected sendConflict(res: Response, message: string): void {
    this.sendError(res, message, 409);
  }

  /**
   * Send rate limit response
   */
  protected sendRateLimit(
    res: Response,
    message: string = "Too many requests",
    retryAfter?: number
  ): void {
    const headers: Record<string, string> = {};
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
  protected asyncHandler(
    fn: (req: Request, res: Response) => Promise<void>
  ): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error) {
        this.handleAsyncError(error, res);
      }
    };
  }

  /**
   * Handle async errors
   */
  protected handleAsyncError(error: unknown, res: Response): void {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.name === "ValidationError") {
        this.sendBadRequest(res, error.message);
      } else if (error.name === "CastError") {
        this.sendBadRequest(res, "Invalid ID format");
      } else if (error.message.includes("duplicate key")) {
        this.sendConflict(res, "Resource already exists");
      } else {
        this.sendError(res, error, 500);
      }
    } else {
      this.sendError(res, "Unknown error occurred", 500);
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(
    data: Record<string, any>,
    fields: string[]
  ): { isValid: boolean; missingFields: string[] } {
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
  protected getClientId(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  /**
   * Check if request is from development environment
   */
  protected isDevelopment(): boolean {
    return process.env.NODE_ENV !== "production";
  }

  /**
   * Format user-friendly error messages
   */
  protected formatUserFriendlyError(error: string): string {
    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
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

/**
 * Decorator for async controller methods
 * Automatically handles errors
 */
export function asyncHandler(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
): void {
  const method = descriptor.value;
  const controller = target.constructor;

  descriptor.value = async function (req: Request, res: Response): Promise<void> {
    try {
      await method.call(this, req, res);
    } catch (error) {
      const baseController = new controller();
      baseController.handleAsyncError(error, res);
    }
  };
}


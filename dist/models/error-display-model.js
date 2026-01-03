"use strict";
/**
 * Error Display Model (OOP)
 * Type definitions and interfaces for error display component
 * Follows Single Responsibility Principle
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorDisplayDefaults = void 0;
/**
 * Default error messages by severity
 */
class ErrorDisplayDefaults {
}
exports.ErrorDisplayDefaults = ErrorDisplayDefaults;
ErrorDisplayDefaults.TITLES = {
    error: "Terjadi Kesalahan",
    warning: "Peringatan",
    info: "Informasi",
};
ErrorDisplayDefaults.RETRY_LABEL = "Coba Lagi";
ErrorDisplayDefaults.DEFAULT_MAX_WIDTH = "820px";
//# sourceMappingURL=error-display-model.js.map
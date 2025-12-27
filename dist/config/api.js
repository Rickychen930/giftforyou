"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_BASE = void 0;
// src/config/api.ts
exports.API_BASE = process.env.REACT_APP_API_URL?.trim() || ""; // empty => same origin
// If you want the variable to be "/api" instead, adjust accordingly.
// Example if REACT_APP_API_URL="/api":
// export const API_BASE = process.env.REACT_APP_API_URL?.trim() || "/api";
//# sourceMappingURL=api.js.map
// src/config/api.ts

/**
 * Get API base URL
 * Priority:
 * 1. REACT_APP_API_URL from environment
 * 2. Empty string (same origin) for development
 * 3. Fallback to same origin
 */
function getApiBase(): string {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  
  // If explicitly set, use it
  if (envUrl) {
    return envUrl;
  }
  
  // For production, try to detect from window.location
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // Use same origin in production if not set
    return "";
  }
  
  // Default: same origin (empty string)
  return "";
}

export const API_BASE = getApiBase();

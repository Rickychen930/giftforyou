// src/config/api.ts

/**
 * Get API base URL
 * Priority:
 * 1. REACT_APP_API_URL from environment
 * 2. Auto-detect from window.location in production (client-side only)
 * 3. Empty string (same origin) for development
 */
function getApiBase(): string {
  const envUrl = process.env.REACT_APP_API_URL?.trim();
  
  // If explicitly set, use it
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }
  
  // For production, auto-detect API URL from current domain (client-side only)
  // Check if we're in a browser environment
  // Use type assertion to avoid TypeScript errors in server build
  if (typeof globalThis !== "undefined") {
    const globalWindow = (globalThis as { window?: { location?: { hostname?: string } } }).window;
    if (globalWindow?.location?.hostname) {
      const hostname = globalWindow.location.hostname;
      
      // In production, construct API URL from current domain
      // If on https://giftforyou-idn.cloud, API should be at same origin or api subdomain
      if (hostname.includes("giftforyou-idn.cloud") || hostname.includes("giftforyou.idn")) {
        // Use same origin (empty string) - API is on same server
        return "";
      }
    }
  }
  
  // Default: same origin (empty string)
  return "";
}

export const API_BASE = getApiBase();

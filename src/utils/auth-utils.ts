/**
 * Secure authentication utilities for frontend
 * Handles token storage, validation, and refresh
 */

const TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const LAST_ACTIVITY_KEY = "lastActivity";
const TOKEN_EXPIRY_BUFFER = 60000; // 1 minute buffer before expiry

/**
 * Store tokens securely
 * Note: In production, consider using httpOnly cookies instead of localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (err) {
    console.error("Failed to store tokens:", err);
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.error("Failed to get access token:", err);
    return null;
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (err) {
    console.error("Failed to get refresh token:", err);
    return null;
  }
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (err) {
    console.error("Failed to clear auth:", err);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decode JWT token (without verification - client-side only)
 * Returns null if token is invalid
 */
export function decodeToken(token: string): { exp?: number; [key: string]: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  
  // Consider token expired if it expires within the buffer time
  return expiryTime - now < TOKEN_EXPIRY_BUFFER;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const API_BASE = process.env.REACT_APP_API_URL?.trim() || "";
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Refresh token expired or invalid
      clearAuth();
      return null;
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      return data.token;
    }

    return null;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    clearAuth();
    return null;
  }
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidToken(): Promise<string | null> {
  let token = getAccessToken();

  if (!token) {
    return null;
  }

  // Check if token is expired or about to expire
  if (isTokenExpired(token)) {
    // Try to refresh
    token = await refreshAccessToken();
  }

  return token;
}

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): void {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch (err) {
    console.error("Failed to update last activity:", err);
  }
}

/**
 * Check if session should be expired due to inactivity
 * Default: 30 minutes of inactivity
 */
export function checkSessionTimeout(timeoutMinutes: number = 30): boolean {
  try {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) return true;

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    if (now - lastActivityTime > timeoutMs) {
      clearAuth();
      return true;
    }

    return false;
  } catch (err) {
    console.error("Failed to check session timeout:", err);
    return true;
  }
}


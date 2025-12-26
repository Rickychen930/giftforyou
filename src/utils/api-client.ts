/**
 * Secure API client with automatic token refresh
 * Handles authentication, token refresh, and error handling
 */

import { getValidToken, clearAuth, updateLastActivity } from "./auth-utils";

const API_BASE = process.env.REACT_APP_API_URL?.trim() || "";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipTokenRefresh?: boolean;
}

/**
 * Make authenticated API request with automatic token refresh
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, skipTokenRefresh = false, ...fetchOptions } = options;

  // Get valid token (refresh if needed)
  let token: string | null = null;
  if (!skipAuth) {
    token = skipTokenRefresh
      ? require("./auth-utils").getAccessToken()
      : await getValidToken();

    if (!token) {
      // Token expired and refresh failed
      clearAuth();
      throw new Error("Authentication required");
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Update last activity
  updateLastActivity();

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && !skipAuth && !skipTokenRefresh) {
      // Try refreshing token once
      const newToken = await getValidToken();
      if (newToken) {
        // Retry request with new token
        const retryHeaders: Record<string, string> = {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        };
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...fetchOptions,
          headers: retryHeaders,
        });

        if (!retryResponse.ok) {
          if (retryResponse.status === 401) {
            clearAuth();
            throw new Error("Authentication failed");
          }
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      } else {
        clearAuth();
        throw new Error("Authentication required");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: response.statusText,
      }));
      throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Network error");
  }
}

/**
 * GET request
 */
export function apiGet<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request
 */
export function apiPost<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export function apiPut<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export function apiPatch<T = unknown>(
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export function apiDelete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}


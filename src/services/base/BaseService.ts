/**
 * Base Service Class
 * Provides common functionality for all services
 * Follows SOLID principles: Dependency Inversion, Single Responsibility
 */

import { API_BASE } from "../../config/api";

/**
 * HTTP methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Request options
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

/**
 * Base Service Class
 * Provides reusable functionality for API calls
 */
export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request
   */
  protected async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      signal,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Remove Content-Type for FormData
    if (body instanceof FormData) {
      delete requestHeaders["Content-Type"];
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      ...(body && { body: body instanceof FormData ? body : JSON.stringify(body) }),
      ...(signal && { signal }),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text.trim()) {
        return {} as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      throw new Error(
        error instanceof Error ? error.message : "Request failed"
      );
    }
  }

  /**
   * GET request
   */
  protected async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", signal });
  }

  /**
   * POST request
   */
  protected async post<T>(
    endpoint: string,
    body?: any,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      signal,
    });
  }

  /**
   * PUT request
   */
  protected async put<T>(
    endpoint: string,
    body?: any,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
      signal,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T>(
    endpoint: string,
    body?: any,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body,
      signal,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T>(
    endpoint: string,
    signal?: AbortSignal
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      signal,
    });
  }

  /**
   * Get auth headers
   */
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}


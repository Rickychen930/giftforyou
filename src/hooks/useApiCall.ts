/**
 * Custom hook for API calls with loading, error, and abort controller management
 * Reduces boilerplate across components
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { API_BASE } from "../config/api";
import { getAuthHeaders } from "../utils/auth-utils";

interface UseApiCallOptions {
  skipAuth?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (endpoint: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for making API calls with automatic state management
 */
export function useApiCall<T = unknown>(
  options: UseApiCallOptions = {}
): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (endpoint: string, fetchOptions: RequestInit = {}): Promise<T | null> => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
          ...(fetchOptions.headers as Record<string, string>),
        };

        if (!options.skipAuth) {
          const authHeaders = getAuthHeaders();
          Object.assign(headers, authHeaders);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...fetchOptions,
          headers,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          let errorText = "";
          try {
            errorText = await response.text();
          } catch {
            errorText = response.statusText || "Unknown error";
          }
          throw new Error(`API request failed (${response.status}): ${errorText}`);
        }

        let jsonData: T;
        try {
          const text = await response.text();
          if (!text.trim()) {
            throw new Error("Empty response body");
          }
          jsonData = JSON.parse(text) as T;
        } catch (parseErr) {
          throw new Error(`Failed to parse response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
        }

        setData(jsonData);
        options.onSuccess?.(jsonData);
        return jsonData;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options.skipAuth, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { data, loading, error, execute, reset };
}


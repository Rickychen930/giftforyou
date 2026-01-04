import { useState, useCallback } from "react";

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

/**
 * Custom hook for retry mechanism
 * Useful for API calls that might fail temporarily
 */
export const useRetry = (options: UseRetryOptions = {}) => {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setIsRetrying(true);
            setRetryCount(attempt);
            onRetry?.(attempt);

            // Exponential backoff
            const delay = retryDelay * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const result = await fn();
          setIsRetrying(false);
          setRetryCount(0);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry on abort errors
          if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
          }

          // If this was the last attempt, throw the error
          if (attempt === maxRetries) {
            setIsRetrying(false);
            throw lastError;
          }
        }
      }

      setIsRetrying(false);
      throw lastError || new Error("Retry failed");
    },
    [maxRetries, retryDelay, onRetry]
  );

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    reset,
  };
};


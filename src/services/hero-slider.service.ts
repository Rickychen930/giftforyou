import { API_BASE } from "../config/api";
import type { HeroSliderContent } from "../components/sections/hero-collection-slider";
import { validateHeroSliderContent } from "../utils/hero-slider-utils";
import { getCachedData, setCachedData } from "../utils/cache-utils";

/**
 * Hero Slider Service
 * Handles all API communication for hero slider
 * Follows SOLID principles - Single Responsibility
 * Enhanced with retry mechanism and better error handling
 */
class HeroSliderService {
  private readonly endpoint = `${API_BASE}/api/hero-slider/home`;
  private readonly maxRetries = 2;
  private readonly retryDelay = 1000;

  /**
   * Retry mechanism with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries,
    delay: number = this.retryDelay
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) {
        throw error;
      }

      // Wait before retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Fetches hero slider content from API
   * Returns null if API fails or returns invalid data
   * Uses AbortController for cancellation support
   * Enhanced with retry mechanism and caching
   */
  async fetchHeroSlider(
    signal?: AbortSignal,
    useCache: boolean = true
  ): Promise<HeroSliderContent | null> {
    // Try to get from cache first
    if (useCache) {
      const cached = getCachedData<HeroSliderContent>("home");
      if (cached) {
        return cached;
      }
    }

    const fetchData = async (): Promise<HeroSliderContent | null> => {
      try {
        const response = await fetch(this.endpoint, {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
          // Use cache-first strategy for better performance
          cache: "default",
          // Add keepalive for better reliability
          keepalive: true,
        });

        if (!response.ok) {
        // Don't throw error, just return null for graceful fallback
        if (
          typeof process !== "undefined" &&
          process.env &&
          process.env.NODE_ENV === "development"
        ) {
          console.warn(
            `Hero slider API returned ${response.status}: ${response.statusText}`
          );
        }
          return null;
        }

        const data = await response.json();

        // Validate data structure
        if (!data || typeof data !== "object") {
          return null;
        }

        // If data has slides array, validate it
        if (data.slides && Array.isArray(data.slides)) {
          if (validateHeroSliderContent(data)) {
            const validatedData = data as HeroSliderContent;
            // Cache valid data
            if (useCache) {
              setCachedData("home", validatedData);
            }
            return validatedData;
          }
          // Invalid slides, return null for fallback
          if (
            typeof process !== "undefined" &&
            process.env &&
            process.env.NODE_ENV === "development"
          ) {
            console.warn("Hero slider data validation failed");
          }
          return null;
        }

        // No slides or invalid structure
        return null;
      } catch (error) {
        // Handle AbortError silently (component unmounted)
        if (error instanceof DOMException && error.name === "AbortError") {
          return null;
        }

        // Re-throw for retry mechanism
        throw error;
      }
    };

    try {
      // Try with retry mechanism (only for network errors, not validation errors)
      return await this.retryWithBackoff(fetchData);
    } catch (error) {
      // Log other errors in development
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "development"
      ) {
        console.error("Error fetching hero slider after retries:", error);
      }

      // Return null for graceful fallback to default content
      return null;
    }
  }

  /**
   * Updates hero slider content
   * Requires authentication (handled by controller)
   * Enhanced with retry mechanism
   */
  async updateHeroSlider(
    content: HeroSliderContent,
    signal?: AbortSignal
  ): Promise<{ success: boolean; message: string; data?: HeroSliderContent }> {
    try {
      // Validate before sending
      if (!validateHeroSliderContent(content)) {
        return {
          success: false,
          message: "Invalid hero slider content",
        };
      }

      const updateData = async () => {
        const response = await fetch(this.endpoint, {
          method: "PUT",
          signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(content),
          keepalive: true,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Failed to update hero slider (${response.status})`
          );
        }

        const result = await response.json();
        return {
          success: true,
          message: result.message || "Hero slider updated successfully",
          data: result.doc,
        };
      };

      return await this.retryWithBackoff(updateData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          success: false,
          message: "Request cancelled",
        };
      }

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update hero slider",
      };
    }
  }
}

// Export singleton instance
export const heroSliderService = new HeroSliderService();

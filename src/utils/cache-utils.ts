/**
 * Cache Utilities
 * Browser caching strategies for better performance
 */

/**
 * Cache key prefix for hero slider
 */
const CACHE_PREFIX = "hero-slider-";
const CACHE_VERSION = "v1";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Get cached data if valid
 */
export const getCachedData = <T>(key: string): T | null => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);

    // Check version
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    // Check TTL
    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.data;
  } catch {
    // Invalid cache, remove it
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
};

/**
 * Set cached data
 */
export const setCachedData = <T>(key: string, data: T): void => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cached));
  } catch {
    // Silently fail if storage is full or unavailable
  }
};

/**
 * Clear cached data
 */
export const clearCachedData = (key: string): void => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // Silently fail
  }
};

/**
 * Clear all hero slider cache
 */
export const clearAllHeroSliderCache = (): void => {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Silently fail
  }
};


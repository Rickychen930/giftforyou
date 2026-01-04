/**
 * Performance Utilities
 * Advanced performance optimizations for hero slider
 */

/**
 * Detects if device is low-end based on hardware concurrency and memory
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const hardwareConcurrency = (navigator as any).hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 4;

  return hardwareConcurrency <= 2 || deviceMemory <= 2;
};

/**
 * Detects if connection is slow
 */
export const isSlowConnection = (): boolean => {
  if (typeof navigator === "undefined" || !("connection" in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;

  const effectiveType = connection.effectiveType;
  const slowTypes = ["slow-2g", "2g", "3g"];

  return slowTypes.includes(effectiveType) || connection.downlink < 1.5;
};

/**
 * Detects if battery is low
 */
export const isLowBattery = async (): Promise<boolean> => {
  if (typeof navigator === "undefined" || !("getBattery" in navigator)) {
    return false;
  }

  try {
    const battery = await (navigator as any).getBattery();
    return battery.level < 0.2 && !battery.charging;
  } catch {
    return false;
  }
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

/**
 * Request idle callback with fallback
 */
export const requestIdleCallbackWithFallback = (
  callback: () => void,
  timeout = 2000
): number => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, { timeout });
  }
  return setTimeout(callback, 1) as unknown as number;
};

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallbackWithFallback = (id: number): void => {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Get optimal image quality based on device and connection
 */
export const getOptimalImageQuality = (): {
  format: "webp" | "jpeg" | "avif";
  quality: number;
  reduceAnimations: boolean;
} => {
  const lowEnd = isLowEndDevice();
  const slowConnection = isSlowConnection();

  if (slowConnection || lowEnd) {
    return {
      format: "jpeg",
      quality: 75,
      reduceAnimations: true,
    };
  }

  // Check AVIF support
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // AVIF is supported in modern browsers
      const supportsAVIF = canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
      if (supportsAVIF) {
        return {
          format: "avif",
          quality: 85,
          reduceAnimations: false,
        };
      }
    }
  }

  // Check WebP support
  const supportsWebP = typeof document !== "undefined" && 
    document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0;

  return {
    format: supportsWebP ? "webp" : "jpeg",
    quality: 85,
    reduceAnimations: false,
  };
};

/**
 * Prefetch resource with priority
 */
export const prefetchResource = (url: string, priority: "high" | "low" = "low"): void => {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  if (priority === "high") {
    link.setAttribute("fetchpriority", "high");
  }
  document.head.appendChild(link);
};

/**
 * Preconnect to domain for faster loading
 */
export const preconnectDomain = (url: string): void => {
  if (typeof document === "undefined") return;

  try {
    const domain = new URL(url).origin;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  } catch {
    // Invalid URL, skip
  }
};


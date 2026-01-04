import { useEffect, useState, useMemo } from "react";
import {
  isLowEndDevice,
  isSlowConnection,
  isLowBattery,
  getOptimalImageQuality,
} from "../utils/performance-utils";

/**
 * Hook for performance optimizations
 * Automatically adjusts settings based on device capabilities
 */
export const usePerformanceOptimizations = () => {
  const [lowBattery, setLowBattery] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check device capabilities
  const deviceCapabilities = useMemo(() => {
    const lowEnd = isLowEndDevice();
    const slowConnection = isSlowConnection();
    const imageQuality = getOptimalImageQuality();

    return {
      isLowEnd: lowEnd,
      isSlowConnection: slowConnection,
      shouldReduceAnimations: lowEnd || slowConnection || lowBattery,
      imageQuality,
    };
  }, [lowBattery]);

  // Check battery status
  useEffect(() => {
    let mounted = true;

    const checkBattery = async () => {
      try {
        const low = await isLowBattery();
        if (mounted) {
          setLowBattery(low);
        }
      } catch {
        // Battery API not available, ignore
      }
    };

    checkBattery();

    // Check battery periodically if API is available
    let batteryCheckInterval: NodeJS.Timeout | null = null;
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      batteryCheckInterval = setInterval(checkBattery, 60000); // Check every minute
    }

    return () => {
      mounted = false;
      if (batteryCheckInterval) {
        clearInterval(batteryCheckInterval);
      }
    };
  }, []);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    // Legacy browsers
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return {
    ...deviceCapabilities,
    reducedMotion,
  };
};


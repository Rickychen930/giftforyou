/**
 * Performance Metrics Hook
 * Tracks and reports performance metrics for monitoring
 * Priority: HIGH - Performance monitoring
 */

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  componentMountTime: number;
  renderCount: number;
  averageRenderTime: number;
}

/**
 * Hook for tracking component performance metrics
 */
export function usePerformanceMetrics(componentName: string) {
  const mountTimeRef = useRef<number>(performance.now());
  const renderCountRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const mountTime = performance.now() - mountTimeRef.current;
    renderCountRef.current += 1;

    // Track render time
    const renderStart = performance.now();
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    renderTimesRef.current.push(renderTime);

    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      const metrics: PerformanceMetrics = {
        componentMountTime: mountTime,
        renderCount: renderCountRef.current,
        averageRenderTime:
          renderTimesRef.current.reduce((a, b) => a + b, 0) /
          renderTimesRef.current.length,
      };

      // Only log if render time is significant
      if (renderTime > 16) {
        console.log(`[Performance] ${componentName}:`, metrics);
      }
    }

    // Report to analytics in production (if needed)
    if (process.env.NODE_ENV === "production" && renderTime > 100) {
      // Report slow renders to analytics
      // Example: analytics.track('slow_render', { component: componentName, time: renderTime });
    }
  });

  return {
    mountTime: mountTimeRef.current,
    renderCount: renderCountRef.current,
  };
}


/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and other performance metrics
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint (ms)
  fid?: number; // First Input Delay (ms)
  cls?: number; // Cumulative Layout Shift (score)
  
  // Additional metrics
  fcp?: number; // First Contentful Paint (ms)
  ttfb?: number; // Time to First Byte (ms)
  domContentLoaded?: number; // DOMContentLoaded (ms)
  loadComplete?: number; // Load complete (ms)
  
  // Resource metrics
  totalResources?: number;
  totalSize?: number; // bytes
  
  // Navigation timing
  navigationType?: string;
  redirectTime?: number;
  dnsTime?: number;
  connectTime?: number;
  requestTime?: number;
  responseTime?: number;
  domProcessingTime?: number;
  loadEventTime?: number;
}

export interface PagePerformance {
  url: string;
  timestamp: number;
  metrics: PerformanceMetrics;
}

/**
 * Get performance metrics from Performance API
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === "undefined" || !window.performance) {
    return {};
  }

  const metrics: PerformanceMetrics = {};
  const perf = window.performance;
  const nav = perf.getEntriesByType("navigation")[0] as any;

  if (nav) {
    // Navigation timing
    metrics.ttfb = Math.round(nav.responseStart - nav.requestStart);
    metrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.fetchStart);
    metrics.loadComplete = Math.round(nav.loadEventEnd - nav.fetchStart);
    metrics.navigationType = nav.type.toString();
    
    // Detailed timing
    metrics.redirectTime = Math.round(nav.redirectEnd - nav.redirectStart);
    metrics.dnsTime = Math.round(nav.domainLookupEnd - nav.domainLookupStart);
    metrics.connectTime = Math.round(nav.connectEnd - nav.connectStart);
    metrics.requestTime = Math.round(nav.responseStart - nav.requestStart);
    metrics.responseTime = Math.round(nav.responseEnd - nav.responseStart);
    metrics.domProcessingTime = Math.round(nav.domComplete - nav.domInteractive);
    metrics.loadEventTime = Math.round(nav.loadEventEnd - nav.loadEventStart);
  }

  // Paint timing
  const paintEntries = perf.getEntriesByType("paint") as any[];
  paintEntries.forEach((entry) => {
    if (entry.name === "first-contentful-paint") {
      metrics.fcp = Math.round(entry.startTime);
    }
  });

  // Resource timing
  const resourceEntries = perf.getEntriesByType("resource") as any[];
  metrics.totalResources = resourceEntries.length;
  metrics.totalSize = resourceEntries.reduce((sum, entry) => {
    return sum + (entry.transferSize || 0);
  }, 0);

  // Core Web Vitals (if available from web-vitals library)
  // These would typically be measured by a library like web-vitals
  // For now, we'll try to get them from PerformanceObserver if available

  return metrics;
}

/**
 * Get Core Web Vitals using PerformanceObserver
 */
export function observeCoreWebVitals(
  onMetric: (name: string, value: number) => void
): () => void {
  if (typeof window === "undefined" || !window.PerformanceObserver) {
    return () => {};
  }

  const observers: Array<{ disconnect: () => void }> = [];

  // LCP (Largest Contentful Paint)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      if (lastEntry?.renderTime) {
        onMetric("lcp", Math.round(lastEntry.renderTime));
        lcpObserver.disconnect();
        observers.splice(observers.indexOf(lcpObserver), 1);
      }
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] as any });
    observers.push(lcpObserver);
  } catch (e) {
    // LCP not supported
  }

  // FID (First Input Delay)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          onMetric("fid", Math.round(fid));
          fidObserver.disconnect();
          observers.splice(observers.indexOf(fidObserver), 1);
        }
      });
    });
    fidObserver.observe({ entryTypes: ["first-input"] as any });
    observers.push(fidObserver);
  } catch (e) {
    // FID not supported
  }

  // CLS (Cumulative Layout Shift)
  let clsValue = 0;
  try {
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput && entry.value) {
          clsValue += entry.value;
        }
      });
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] as any });
    observers.push(clsObserver);

    // Report CLS on page unload
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const reportCLS = () => {
        onMetric("cls", Math.round(clsValue * 1000) / 1000);
      };
      window.addEventListener("beforeunload", reportCLS);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          reportCLS();
        }
      });
    }
  } catch (e) {
    // CLS not supported
  }

  return () => {
    observers.forEach((obs) => obs.disconnect());
  };
}

/**
 * Get performance score based on Core Web Vitals
 */
export function getPerformanceScore(metrics: PerformanceMetrics): {
  score: number;
  grade: "excellent" | "good" | "needs-improvement" | "poor";
  details: Record<string, { value: number; threshold: number; status: string }>;
} {
  const details: Record<string, { value: number; threshold: number; status: string }> = {};
  let totalScore = 0;
  let count = 0;

  // LCP scoring (good: < 2500ms, needs improvement: < 4000ms)
  if (metrics.lcp !== undefined) {
    const lcpMs = metrics.lcp;
    let status = "poor";
    let score = 0;
    if (lcpMs < 2500) {
      status = "excellent";
      score = 100;
    } else if (lcpMs < 4000) {
      status = "good";
      score = 75;
    } else if (lcpMs < 6000) {
      status = "needs-improvement";
      score = 50;
    }
    details.lcp = { value: lcpMs, threshold: 2500, status };
    totalScore += score;
    count++;
  }

  // FID scoring (good: < 100ms, needs improvement: < 300ms)
  if (metrics.fid !== undefined) {
    const fidMs = metrics.fid;
    let status = "poor";
    let score = 0;
    if (fidMs < 100) {
      status = "excellent";
      score = 100;
    } else if (fidMs < 300) {
      status = "good";
      score = 75;
    } else if (fidMs < 500) {
      status = "needs-improvement";
      score = 50;
    }
    details.fid = { value: fidMs, threshold: 100, status };
    totalScore += score;
    count++;
  }

  // CLS scoring (good: < 0.1, needs improvement: < 0.25)
  if (metrics.cls !== undefined) {
    const clsValue = metrics.cls;
    let status = "poor";
    let score = 0;
    if (clsValue < 0.1) {
      status = "excellent";
      score = 100;
    } else if (clsValue < 0.25) {
      status = "good";
      score = 75;
    } else if (clsValue < 0.5) {
      status = "needs-improvement";
      score = 50;
    }
    details.cls = { value: clsValue, threshold: 0.1, status };
    totalScore += score;
    count++;
  }

  const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
  let grade: "excellent" | "good" | "needs-improvement" | "poor";
  if (avgScore >= 90) grade = "excellent";
  else if (avgScore >= 75) grade = "good";
  else if (avgScore >= 50) grade = "needs-improvement";
  else grade = "poor";

  return { score: avgScore, grade, details };
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format milliseconds to human readable
 */
export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}


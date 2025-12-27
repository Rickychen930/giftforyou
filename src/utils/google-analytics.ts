/**
 * Google Analytics Integration
 * Connect with Google Analytics for enhanced tracking
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    ga?: (...args: any[]) => void;
  }
}

export interface GoogleAnalyticsConfig {
  measurementId?: string;
  apiSecret?: string;
  enabled: boolean;
}

const CONFIG_STORAGE_KEY = "analytics.ga.config";

/**
 * Get Google Analytics configuration
 */
export function getGAConfig(): GoogleAnalyticsConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as GoogleAnalyticsConfig;
    }
  } catch {
    // ignore
  }

  // Try to get from environment or meta tag
  const metaTag = document.querySelector('meta[name="google-analytics-id"]');
  const measurementId = metaTag?.getAttribute("content") || undefined;

  return {
    measurementId,
    enabled: false,
  };
}

/**
 * Save Google Analytics configuration
 */
export function saveGAConfig(config: GoogleAnalyticsConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save GA config:", error);
  }
}

/**
 * Initialize Google Analytics
 */
export function initGoogleAnalytics(measurementId: string): void {
  if (typeof window === "undefined") return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  window.gtag = function(...args: any[]) {
    if (window.dataLayer) {
      window.dataLayer.push(args);
    }
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  const config = getGAConfig();
  if (!config.enabled || !config.measurementId) return;

  if (window.gtag) {
    window.gtag("config", config.measurementId, {
      page_path: path,
      page_title: title || document.title,
    });
  }
}

/**
 * Track event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  const config = getGAConfig();
  if (!config.enabled || !config.measurementId) return;

  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

/**
 * Track performance metric
 */
export function trackPerformanceMetric(
  metricName: string,
  value: number,
  unit?: string
): void {
  trackEvent("performance_metric", {
    metric_name: metricName,
    value,
    unit: unit || "ms",
  });
}

/**
 * Track SEO metric
 */
export function trackSEOMetric(metricName: string, value: number | string): void {
  trackEvent("seo_metric", {
    metric_name: metricName,
    value,
  });
}

/**
 * Track custom dimension
 */
export function trackCustomDimension(
  dimensionName: string,
  value: string | number
): void {
  trackEvent("custom_dimension", {
    dimension_name: dimensionName,
    value,
  });
}

/**
 * Send performance data to Google Analytics
 */
export function sendPerformanceToGA(
  metrics: Record<string, number>,
  score: number
): void {
  const config = getGAConfig();
  if (!config.enabled || !config.measurementId) return;

  // Send as custom event
  trackEvent("web_vitals", {
    score,
    ...metrics,
  });

  // Send individual metrics
  Object.entries(metrics).forEach(([name, value]) => {
    trackPerformanceMetric(name, value);
  });
}

/**
 * Send SEO data to Google Analytics
 */
export function sendSEOToGA(score: number, checks: Array<{ name: string; status: string }>): void {
  const config = getGAConfig();
  if (!config.enabled || !config.measurementId) return;

  trackEvent("seo_analysis", {
    score,
    checks_passed: checks.filter((c) => c.status === "pass").length,
    checks_warning: checks.filter((c) => c.status === "warning").length,
    checks_failed: checks.filter((c) => c.status === "fail").length,
  });
}

/**
 * Check if Google Analytics is loaded
 */
export function isGALoaded(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}


/**
 * Analytics Utilities for Hero Slider
 * Tracks user interactions and performance metrics
 */

interface SlideInteraction {
  slideId: string;
  slideIndex: number;
  action: "view" | "click" | "navigation" | "autoplay_toggle";
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Check if in development mode
 */
const isDevelopment = (): boolean => {
  return typeof process !== "undefined" && 
         process.env && 
         process.env.NODE_ENV === "development";
};

/**
 * Track slide interaction
 */
export const trackSlideInteraction = (interaction: SlideInteraction): void => {
  if (isDevelopment()) {
    console.log("[Analytics] Slide interaction:", interaction);
    return;
  }

  // In production, send to analytics service
  try {
    // Example: Send to your analytics service
    // analytics.track('hero_slider_interaction', interaction);
    
    // Or use Performance API
    if (typeof window !== "undefined" && "performance" in window) {
      performance.mark(`hero-slider-${interaction.action}-${interaction.slideIndex}`);
    }
  } catch (error) {
    // Silently fail analytics
    if (isDevelopment()) {
      console.warn("Analytics tracking failed:", error);
    }
  }
};

/**
 * Track slide view time
 */
export const trackSlideViewTime = (
  slideId: string,
  slideIndex: number,
  viewTime: number
): void => {
  if (viewTime < 1000) return; // Ignore views less than 1 second

  trackSlideInteraction({
    slideId,
    slideIndex,
    action: "view",
    timestamp: Date.now(),
    metadata: {
      viewTimeMs: viewTime,
    },
  });
};

/**
 * Track CTA click
 */
export const trackCTAClick = (
  slideId: string,
  slideIndex: number,
  ctaType: "primary" | "secondary",
  href: string
): void => {
  trackSlideInteraction({
    slideId,
    slideIndex,
    action: "click",
    timestamp: Date.now(),
    metadata: {
      ctaType,
      href,
    },
  });
};

/**
 * Measure performance metrics
 */
export const measurePerformance = (metricName: string, value: number): void => {
  if (typeof window === "undefined" || !("performance" in window)) {
    return;
  }

  try {
    performance.measure(metricName, {
      start: 0,
      end: value,
    });

    // Log to console in development
    if (isDevelopment()) {
      console.log(`[Performance] ${metricName}: ${value}ms`);
    }
  } catch {
    // Silently fail
  }
};


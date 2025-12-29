/**
 * Dashboard Page Extended Constants
 * Additional constants for magic numbers and limits
 */

export const DASHBOARD_LIMITS = {
  TOP_COLLECTIONS: Infinity, // Show all
  TOP_SEARCH_TERMS: 5,
  TOP_BOUQUETS_30D: 5,
  TOP_BOUQUETS_7D: 3,
  TOP_VISIT_HOURS: 5,
  SEO_CHECKS: 6,
  SEO_RECOMMENDATIONS: 3,
  ALERTS_DISPLAY: 5,
  TOP_SELLING_BOUQUETS: 5,
} as const;

export const GRADE_LABELS: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  "needs-improvement": "Needs Improvement",
  poor: "Poor",
} as const;

export const SEO_STATUS_ICONS: Record<string, string> = {
  pass: "✓",
  warning: "⚠",
  fail: "✗",
} as const;

export const TREND_ARROWS: Record<string, string> = {
  up: "↑",
  down: "↓",
  stable: "→",
} as const;


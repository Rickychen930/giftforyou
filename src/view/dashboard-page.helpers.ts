/**
 * Dashboard Page Helpers
 * Utility functions for common patterns and calculations
 */

import type { DashboardPageViewState } from "../models/dashboard-page-model";
import type { Bouquet } from "../models/domain/bouquet";

/**
 * Type for toggle show keys
 */
export type ToggleShowKey = keyof Pick<
  DashboardPageViewState,
  | "showTrends"
  | "showBenchmarks"
  | "showNotifications"
  | "showInventory"
  | "showAnalytics"
  | "showQuickActions"
  | "showSearch"
  | "showActivityLog"
  | "showSystemStatus"
>;

/**
 * Calculate last updated timestamp from bouquets
 */
export function calculateLastUpdated(bouquets: Bouquet[]): number {
  return bouquets.reduce((max, b) => {
    const candidate = (b.updatedAt ?? b.createdAt ?? "").toString();
    const t = Date.parse(candidate);
    return Number.isFinite(t) ? Math.max(max, t) : max;
  }, 0);
}

/**
 * Format last updated label
 */
export function formatLastUpdatedLabel(timestamp: number): string {
  return timestamp
    ? new Date(timestamp).toLocaleString("id-ID")
    : "—";
}

/**
 * Get sales metric value safely
 */
export function getSalesMetricValue<T extends Record<string, any>>(
  metrics: T,
  key: string
): any {
  return metrics[key];
}

/**
 * Get overview metric value safely
 */
export function getOverviewMetricValue<T extends Record<string, any>>(
  metrics: T,
  key: string
): any {
  return metrics[key];
}

/**
 * Check if onClickKey is a tab navigation
 */
export function isTabNavigation(key: string): boolean {
  return ["upload", "edit", "hero", "analytics", "orders", "customers", "overview"].includes(key);
}

/**
 * Check if onClickKey is a toggle show action
 */
export function isToggleShowAction(key: string): key is ToggleShowKey {
  return [
    "showTrends",
    "showBenchmarks",
    "showNotifications",
    "showInventory",
    "showAnalytics",
    "showQuickActions",
    "showSearch",
    "showActivityLog",
    "showSystemStatus",
  ].includes(key);
}


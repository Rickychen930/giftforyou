/**
 * Dashboard Page Model
 * Defines data structures and types for the dashboard page
 */

import type { getPerformanceMetrics, getPerformanceScore } from "../utils/performance-monitor";
import type { analyzeSeo } from "../utils/seo-analyzer";
import type { analyzePerformanceTrends, analyzeSeoTrends } from "../utils/trends-analyzer";
import type { getBenchmarks } from "../utils/benchmarks";
import type { getUnacknowledgedAlerts } from "../utils/analytics-alerts";

/**
 * Active Tab Type
 */
export type ActiveTab = "overview" | "orders" | "customers" | "upload" | "edit" | "hero" | "analytics";

/**
 * Dashboard Tab Storage Key
 */
export const DASHBOARD_TAB_STORAGE_KEY = "dashboard.activeTab";

/**
 * Check if string is valid ActiveTab
 */
export const isActiveTab = (v: string): v is ActiveTab =>
  v === "overview" ||
  v === "orders" ||
  v === "customers" ||
  v === "upload" ||
  v === "edit" ||
  v === "hero" ||
  v === "analytics";

/**
 * Insights Response Type
 */
export interface InsightsResponse {
  days?: number;
  pageviews30d?: number;
  topSearchTerms?: Array<{ term: string; count: number }>;
  topBouquetsDays?: Array<{ bouquetId: string; count: number }>;
  topBouquets7d?: Array<{ bouquetId: string; count: number }>;
  visitHours?: Array<{ hour: number; count: number }>;
  uniqueVisitors30d?: number;
  uniqueVisitorsAvailable?: boolean;
}

/**
 * Sales Metrics Type
 */
export interface SalesMetrics {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  unpaidOrders: number;
  paidOrders: number;
  topSellingBouquets: Array<{ bouquetId: string; bouquetName: string; orderCount: number; revenue: number }>;
  averageOrderValue: number;
  totalCustomers: number;
}

/**
 * Metrics Response Type
 */
export interface MetricsResponse {
  visitorsCount?: number;
  collectionsCount?: number;
  collections?: string[];
}

/**
 * Performance State
 */
export interface PerformanceState {
  metrics: ReturnType<typeof getPerformanceMetrics>;
  score: ReturnType<typeof getPerformanceScore>;
  loading: boolean;
  trends?: ReturnType<typeof analyzePerformanceTrends>;
  benchmarks?: ReturnType<typeof getBenchmarks>;
}

/**
 * SEO State
 */
export interface SeoState {
  analysis: ReturnType<typeof analyzeSeo>;
  loading: boolean;
  trends?: ReturnType<typeof analyzeSeoTrends>;
  benchmarks?: ReturnType<typeof getBenchmarks>;
}

/**
 * Alerts State
 */
export interface AlertsState {
  alerts: ReturnType<typeof getUnacknowledgedAlerts>;
  showAlerts: boolean;
}

/**
 * Dashboard Page View State
 */
export interface DashboardPageViewState {
  activeTab: ActiveTab;
  overviewCopyStatus: "" | "copied" | "failed";
  performance: PerformanceState;
  seo: SeoState;
  alerts: AlertsState;
  showTrends: boolean;
  showBenchmarks: boolean;
  showNotifications: boolean;
  showInventory: boolean;
  showAnalytics: boolean;
  showQuickActions: boolean;
  showSearch: boolean;
  showActivityLog: boolean;
  showSystemStatus: boolean;
}

/**
 * Initial Performance State
 */
export const INITIAL_PERFORMANCE_STATE: PerformanceState = {
  metrics: {},
  score: { score: 0, grade: "poor", details: {} },
  loading: true,
};

/**
 * Initial SEO State
 */
export const INITIAL_SEO_STATE: SeoState = {
  analysis: { score: 0, grade: "poor", checks: [], recommendations: [] },
  loading: true,
};

/**
 * Initial Alerts State
 */
export const INITIAL_ALERTS_STATE: AlertsState = {
  alerts: [],
  showAlerts: false,
};

/**
 * Initial Dashboard Page View State
 */
export const INITIAL_DASHBOARD_PAGE_VIEW_STATE: DashboardPageViewState = {
  activeTab: "overview",
  overviewCopyStatus: "",
  performance: INITIAL_PERFORMANCE_STATE,
  seo: INITIAL_SEO_STATE,
  alerts: INITIAL_ALERTS_STATE,
  showTrends: false,
  showNotifications: false,
  showBenchmarks: false,
  showInventory: false,
  showAnalytics: false,
  showQuickActions: false,
  showSearch: false,
  showActivityLog: false,
  showSystemStatus: false,
};

/**
 * Read tab from location
 */
export const readTabFromLocation = (): ActiveTab | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const qp = (params.get("tab") ?? "").trim();
    if (qp && isActiveTab(qp)) return qp;

    const hash = (window.location.hash ?? "").replace(/^#/, "").trim();
    if (hash && isActiveTab(hash)) return hash;

    return null;
  } catch {
    return null;
  }
};

/**
 * Write tab to location
 */
export const writeTabToLocation = (tab: ActiveTab): void => {
  try {
    const nextUrl = `${window.location.pathname}${window.location.search}#${tab}`;
    window.history.replaceState(null, "", nextUrl);
  } catch {
    // ignore
  }
};

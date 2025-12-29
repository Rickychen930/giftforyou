/**
 * Dashboard Page View Types
 * Type definitions for Dashboard Page View component
 */

import type { Bouquet } from "../models/domain/bouquet";
import type { DashboardPageViewState, ActiveTab } from "../models/dashboard-page-model";

export interface OverviewMetrics {
  readyCount: number;
  preorderCount: number;
  featuredCount: number;
  newEditionCount: number;
  missingImageCount: number;
  missingCollectionCount: number;
  zeroQtyReadyCount: number;
  totalReadyUnits: number;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  topCollections: Array<[string, number]>;
  bouquetNameById: Map<string, string>;
  formatHour: (h: number) => string;
  labelBouquet: (id: string) => string;
  insightsDays: number;
  pageviews30d: number;
  topSearchTerms: Array<{ term: string; count: number }>;
  topBouquetsDays: Array<{ bouquetId: string; count: number }>;
  visitHours: Array<{ hour: number; count: number }>;
  uniqueVisitors30d: number;
  uniqueVisitorsAvailable: boolean;
  insightsError: string;
  visitorsCount: number;
  collectionsCount: number;
}

export interface DashboardPageViewProps {
  bouquets: Bouquet[];
  collectionsCount: number;
  visitorsCount: number;
  collections: string[];

  insights?: {
    days?: number;
    pageviews30d?: number;
    topSearchTerms?: Array<{ term: string; count: number }>;
    topBouquetsDays?: Array<{ bouquetId: string; count: number }>;
    topBouquets7d?: Array<{ bouquetId: string; count: number }>;
    visitHours?: Array<{ hour: number; count: number }>;
    uniqueVisitors30d?: number;
    uniqueVisitorsAvailable?: boolean;
  };
  insightsError?: string;

  salesMetrics?: {
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
  };
  salesError?: string;

  loading: boolean;
  errorMessage?: string;
  viewState: DashboardPageViewState;
  overviewMetrics: OverviewMetrics;
  overviewText: string;

  onUpdate: (formData: FormData) => Promise<boolean>;
  onUpload: (formData: FormData) => Promise<boolean>;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
  onHeroSaved?: () => void | Promise<void>;
  onLogout: () => void;
  onUpdateCollectionName?: (collectionId: string, newName: string) => Promise<boolean>;
  onMoveBouquet?: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onDeleteCollection?: (collectionId: string) => Promise<boolean>;
  onSetActiveTab: (tab: ActiveTab) => void;
  onCopyCurrentLink: () => Promise<void>;
  onReloadDashboard: () => void;
  onCopyOverview: (text: string) => Promise<void>;
  onExport: (format: "csv" | "json" | "pdf") => void;
  onToggleShow: (key: keyof Pick<DashboardPageViewState, "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus">) => void;
}


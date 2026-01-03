/**
 * Overview Sidebar Section Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles sidebar content rendering
 */

import React, { Component } from "react";
import "../../styles/DashboardPage.css";
import OverviewPriceCard from "./overview-cards/OverviewPriceCard";
import OverviewSalesCard from "./overview-cards/OverviewSalesCard";
import OverviewDataQualityCard from "./overview-cards/OverviewDataQualityCard";
import OverviewInsightsCard from "./overview-cards/OverviewInsightsCard";
import OverviewPerformanceCard from "./overview-cards/OverviewPerformanceCard";
import OverviewSeoCard from "./overview-cards/OverviewSeoCard";
import OverviewAlertsCard from "./overview-cards/OverviewAlertsCard";
import OverviewExportCard from "./overview-cards/OverviewExportCard";
import type { OverviewMetrics } from "../dashboard-page.types";
import type { DashboardPageViewState, ActiveTab } from "../../models/dashboard-page-model";
import type { Bouquet } from "../../models/domain/bouquet";

interface OverviewSidebarSectionProps {
  overviewMetrics: OverviewMetrics;
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
  insightsError?: string;
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
  viewState: DashboardPageViewState;
  bouquets: Bouquet[];
  onSetActiveTab: (tab: ActiveTab) => void;
  onToggleShow: (key: keyof Pick<DashboardPageViewState, "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus">) => void;
  onExport: (format: "csv" | "json" | "pdf") => void;
}

/**
 * Overview Sidebar Section Component
 * Handles sidebar content rendering
 */
class OverviewSidebarSection extends Component<OverviewSidebarSectionProps> {
  render(): React.ReactNode {
    const {
      overviewMetrics,
      salesMetrics,
      salesError,
      insightsError,
      insights,
      viewState,
      bouquets,
      onSetActiveTab,
      onToggleShow,
      onExport,
    } = this.props;

    return (
      <aside className="overviewSide" aria-label="Insight">
        <OverviewPriceCard overviewMetrics={overviewMetrics} />

        <OverviewSalesCard
          salesMetrics={salesMetrics}
          salesError={salesError}
          bouquets={bouquets}
          onSetActiveTab={onSetActiveTab}
          onToggleShow={onToggleShow}
        />

        <OverviewDataQualityCard overviewMetrics={overviewMetrics} />

        <OverviewInsightsCard
          overviewMetrics={overviewMetrics}
          insightsError={insightsError}
          insights={insights}
        />

        <OverviewPerformanceCard viewState={viewState} />

        <OverviewSeoCard viewState={viewState} />

        <OverviewAlertsCard viewState={viewState} />

        <OverviewExportCard onExport={onExport} />
      </aside>
    );
  }
}

export default OverviewSidebarSection;


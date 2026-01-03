/**
 * Overview Section Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles overview section layout
 * Open/Closed: Extensible through props
 * Dependency Inversion: Depends on component abstractions
 */

import React, { Component } from "react";
import "../../styles/DashboardPage.css";
import OverviewHeaderSection from "./OverviewHeaderSection";
import OverviewMetricsSection from "./OverviewMetricsSection";
import OverviewSidebarSection from "./OverviewSidebarSection";
import type { OverviewMetrics } from "../dashboard-page.types";
import type { DashboardPageViewState, ActiveTab } from "../../models/dashboard-page-model";
import type { Bouquet } from "../../models/domain/bouquet";

interface OverviewSectionProps {
  overviewMetrics: OverviewMetrics;
  overviewText: string;
  insightsError?: string;
  visitorsCount: number;
  bouquets: Bouquet[];
  collectionsCount: number;
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
  onSetActiveTab: (tab: ActiveTab) => void;
  onCopyOverview: (text: string) => void;
  onReloadDashboard: () => void;
  onToggleShow: (key: keyof Pick<DashboardPageViewState, "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus">) => void;
  onExport: (format: "csv" | "json" | "pdf") => void;
}

/**
 * Overview Section Component
 * Main component for overview dashboard section
 */
class OverviewSection extends Component<OverviewSectionProps> {
  render(): React.ReactNode {
    const {
      overviewMetrics,
      overviewText,
      insightsError,
      visitorsCount,
      bouquets,
      collectionsCount,
      salesMetrics,
      salesError,
      insights,
      viewState,
      onSetActiveTab,
      onCopyOverview,
      onReloadDashboard,
      onToggleShow,
      onExport,
    } = this.props;

    return (
      <section className="dashboardSurface dashboardSurface--metrics" aria-label="Ringkasan">
        <OverviewHeaderSection
          bouquets={bouquets}
          overviewText={overviewText}
          copyStatus={viewState.overviewCopyStatus}
          onSetActiveTab={onSetActiveTab}
          onCopyOverview={onCopyOverview}
          onReloadDashboard={onReloadDashboard}
        />

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            <OverviewMetricsSection
              overviewMetrics={overviewMetrics}
              insightsError={insightsError}
              visitorsCount={visitorsCount}
              bouquets={bouquets}
              collectionsCount={collectionsCount}
            />
          </div>

          <OverviewSidebarSection
            overviewMetrics={overviewMetrics}
            salesMetrics={salesMetrics}
            salesError={salesError}
            insightsError={insightsError}
            insights={insights}
            viewState={viewState}
            bouquets={bouquets}
            onSetActiveTab={onSetActiveTab}
            onToggleShow={onToggleShow}
            onExport={onExport}
          />
        </div>
      </section>
    );
  }
}

export default OverviewSection;


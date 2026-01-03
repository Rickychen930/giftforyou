/**
 * Overview Metrics Section Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles metric cards rendering
 */

import React, { Component } from "react";
import "../../styles/DashboardPage.css";
import MetricCard, { type MetricCardProps } from "../../components/common/MetricCard";
import { METRIC_CARDS_CONFIG } from "../dashboard-page.static";
import type { OverviewMetrics } from "../dashboard-page.types";
import type { Bouquet } from "../../models/domain/bouquet";
import {
  AddIcon,
  EditIcon,
  GridIcon,
  CopyIcon,
  RefreshIcon,
  VisitsIcon,
  UsersIcon,
  CollectionsIcon,
  BouquetsIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  MoneyIcon,
  ImageIcon,
  CollectionGridIcon,
  InfoIcon,
  PerformanceIcon,
  SeoIcon,
  AlertIcon,
  ExportIcon,
  ArrowRightIcon,
  InventoryIcon,
  AnalyticsIcon,
  OverviewIcon,
  OrdersIcon,
  CustomersIcon,
  UploadIcon,
  HeroIcon,
} from "../dashboard-page.icons";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  AddIcon,
  EditIcon,
  GridIcon,
  CopyIcon,
  RefreshIcon,
  VisitsIcon,
  UsersIcon,
  CollectionsIcon,
  BouquetsIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  MoneyIcon,
  ImageIcon,
  CollectionGridIcon,
  InfoIcon,
  PerformanceIcon,
  SeoIcon,
  AlertIcon,
  ExportIcon,
  ArrowRightIcon,
  InventoryIcon,
  AnalyticsIcon,
  OverviewIcon,
  OrdersIcon,
  CustomersIcon,
  UploadIcon,
  HeroIcon,
};

interface OverviewMetricsSectionProps {
  overviewMetrics: OverviewMetrics;
  insightsError?: string;
  visitorsCount: number;
  bouquets: Bouquet[];
  collectionsCount: number;
}

/**
 * Overview Metrics Section Component
 * Handles metric cards rendering
 */
class OverviewMetricsSection extends Component<OverviewMetricsSectionProps> {
  render(): React.ReactNode {
    const { overviewMetrics, insightsError, visitorsCount, bouquets, collectionsCount } = this.props;
    
    const metrics = {
      ...overviewMetrics,
      insightsError,
      visitorsCount,
      bouquets,
      collectionsCount,
    };

    return (
      <div className="dashboardMetrics" aria-label="Metrik toko">
        {METRIC_CARDS_CONFIG.map((config) => {
          const Icon = ICON_MAP[config.iconKey];
          const value = config.getValue(metrics);
          const note = config.getNote?.(metrics);

          const props: MetricCardProps = {
            label: config.label,
            value: value,
            variant: config.variant,
            icon: Icon ? <Icon /> : null,
            note: note,
          };

          const MetricCardAny = MetricCard as any;
          return (
            <MetricCardAny
              key={config.label}
              {...props}
            />
          );
        })}
      </div>
    );
  }
}

export default OverviewMetricsSection;


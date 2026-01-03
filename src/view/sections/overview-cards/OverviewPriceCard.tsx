/**
 * Overview Price Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles price card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import KeyValueList from "../../../components/common/KeyValueList";
import { formatIDR } from "../../../utils/money";
import { PRICE_ITEMS } from "../../dashboard-page.static";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import type { OverviewMetrics } from "../../../view/dashboard-page.types";
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
} from "../../dashboard-page.icons";

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

interface OverviewPriceCardProps {
  overviewMetrics: OverviewMetrics;
}

/**
 * Overview Price Card Component
 * Handles price card rendering
 */
class OverviewPriceCard extends Component<OverviewPriceCardProps> {
  render(): React.ReactNode {
    const { overviewMetrics } = this.props;
    const { priceMin, priceAvg, priceMax } = overviewMetrics;

    const items = PRICE_ITEMS.map((item) => {
      const value = item.valueKey === "priceMin" ? priceMin : item.valueKey === "priceAvg" ? priceAvg : priceMax;
      const Icon = ICON_MAP[item.iconKey];

      return {
        key: item.key,
        value: value > 0 ? formatIDR(value) : "—",
        icon: Icon ? <Icon style={DASHBOARD_STYLES.ICON_OPACITY_LOW} /> : null,
      };
    });

    return (
      <div className="overviewCard" aria-label="Harga">
        <p className="overviewCard__title">Harga</p>
        <KeyValueList items={items} />
      </div>
    );
  }
}

export default OverviewPriceCard;


/**
 * Overview Sales Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles sales metrics card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { formatIDR } from "../../../utils/money";
import { REVENUE_ROWS, ORDER_ROWS, ORDER_STATUS_ITEMS, PAYMENT_STATUS_ITEMS, CUSTOMER_ACTIONS } from "../../dashboard-page.static";
import { DASHBOARD_LIMITS } from "../../dashboard-page.constants-extended";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import { getSalesMetricValue, isTabNavigation, isToggleShowAction } from "../../dashboard-page.helpers";
import LuxuryButton from "../../../components/buttons/LuxuryButton";
import type { ActiveTab } from "../../../models/dashboard-page-model";
import type { DashboardPageViewState } from "../../../models/dashboard-page-model";
import type { Bouquet } from "../../../models/domain/bouquet";
import {
  MoneyIcon,
  OrdersIcon,
  CustomersIcon,
  AlertIcon,
  ArrowRightIcon,
  InventoryIcon,
  AnalyticsIcon,
} from "../../dashboard-page.icons";

interface OverviewSalesCardProps {
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
  bouquets: Bouquet[];
  onSetActiveTab: (tab: ActiveTab) => void;
  onToggleShow: (key: keyof Pick<DashboardPageViewState, "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus">) => void;
}

/**
 * Overview Sales Card Component
 * Handles sales metrics card rendering
 */
class OverviewSalesCard extends Component<OverviewSalesCardProps> {
  /**
   * Render revenue rows
   */
  private renderRevenueRows = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <div className="overviewKeyValue">
        {REVENUE_ROWS.map((row) => {
          const value = getSalesMetricValue(salesMetrics, row.valueKey) as number;
          return (
            <div key={row.key} className="overviewKeyValue__row">
              <span className="overviewKeyValue__key">{row.key}</span>
              <span className="overviewKeyValue__val">{formatIDR(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render order rows
   */
  private renderOrderRows = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <div className="overviewKeyValue">
        {ORDER_ROWS.map((row) => {
          const value = getSalesMetricValue(salesMetrics, row.valueKey) as number;
          return (
            <div key={row.key} className="overviewKeyValue__row">
              <span className="overviewKeyValue__key">{row.key}</span>
              <span className="overviewKeyValue__val">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render order status items
   */
  private renderOrderStatusItems = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <ul className="overviewList">
        {ORDER_STATUS_ITEMS.map((item) => {
          const value = getSalesMetricValue(salesMetrics, item.valueKey) as number;
          return (
            <li key={item.label} className="overviewList__item">
              <span>{item.label}</span>
              <b>{value}</b>
            </li>
          );
        })}
      </ul>
    );
  };

  /**
   * Render payment status items
   */
  private renderPaymentStatusItems = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <ul className="overviewList">
        {PAYMENT_STATUS_ITEMS.map((item) => {
          const value = getSalesMetricValue(salesMetrics, item.valueKey) as number;
          return (
            <li key={item.label} className="overviewList__item">
              <span>{item.label}</span>
              <b>{value}</b>
            </li>
          );
        })}
      </ul>
    );
  };

  /**
   * Render customer actions
   */
  private renderCustomerActions = (): React.ReactNode => {
    const { onSetActiveTab, onToggleShow } = this.props;

    const ICON_MAP: Record<string, React.ComponentType<any>> = {
      ArrowRightIcon,
      InventoryIcon,
      AnalyticsIcon,
    };

    return (
      <div style={DASHBOARD_STYLES.SECTION_DIVIDER}>
        {CUSTOMER_ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.iconKey];
          const handleClick = () => {
            if (isTabNavigation(action.onClickKey)) {
              onSetActiveTab(action.onClickKey as ActiveTab);
            } else if (isToggleShowAction(action.onClickKey)) {
              onToggleShow(action.onClickKey);
            }
          };

          return (
            <LuxuryButton
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={handleClick}
              className={action.className}
              style={DASHBOARD_STYLES.FLEX_FULL_WIDTH}
              icon={Icon ? <Icon {...DASHBOARD_STYLES.ICON_MEDIUM} /> : null}
              iconPosition="left"
            >
              {action.label}
            </LuxuryButton>
          );
        })}
      </div>
    );
  };

  render(): React.ReactNode {
    const { salesError, salesMetrics } = this.props;

    if (salesError && salesError.includes("404")) return null;

    if (salesError) {
      return (
        <div className="overviewCard overviewCard--error" aria-label="Sales metrics">
          <p className="overviewCard__title">
            <AlertIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
            Penjualan
          </p>
          <p className="overviewCard__empty" style={DASHBOARD_STYLES.ERROR_TEXT}>
            {salesError}
          </p>
        </div>
      );
    }

    if (!salesMetrics) return null;

    return (
      <>
        <div className="overviewCard" aria-label="Revenue">
          <p className="overviewCard__title">
            <MoneyIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
            Revenue
          </p>
          {this.renderRevenueRows()}
        </div>

        <div className="overviewCard" aria-label="Orders">
          <p className="overviewCard__title">
            <OrdersIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
            Orders
          </p>
          {this.renderOrderRows()}
        </div>

        <div className="overviewCard" aria-label="Order Status">
          <p className="overviewCard__title">Status Order</p>
          {this.renderOrderStatusItems()}
        </div>

        <div className="overviewCard" aria-label="Payment Status">
          <p className="overviewCard__title">Status Pembayaran</p>
          {this.renderPaymentStatusItems()}
        </div>

        <div className="overviewCard" aria-label="Top Selling">
          <p className="overviewCard__title">Top {DASHBOARD_LIMITS.TOP_SELLING_BOUQUETS} Produk Terlaris</p>
          {salesMetrics.topSellingBouquets.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data penjualan.</p>
          ) : (
            <ol className="overviewRank">
              {salesMetrics.topSellingBouquets.slice(0, DASHBOARD_LIMITS.TOP_SELLING_BOUQUETS).map((item) => (
                <li key={item.bouquetId} className="overviewRank__item">
                  <div style={DASHBOARD_STYLES.RANK_ITEM_CONTAINER}>
                    <span className="overviewRank__name" title={item.bouquetName}>
                      {item.bouquetName}
                    </span>
                    <span style={DASHBOARD_STYLES.RANK_REVENUE_TEXT}>
                      {formatIDR(item.revenue)}
                    </span>
                  </div>
                  <span className="overviewRank__count">{item.orderCount}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="overviewCard" aria-label="Customers">
          <p className="overviewCard__title">
            <CustomersIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
            Pelanggan
          </p>
          <div className="overviewKeyValue">
            <div className="overviewKeyValue__row">
              <span className="overviewKeyValue__key">Total Pelanggan</span>
              <span className="overviewKeyValue__val">{salesMetrics.totalCustomers}</span>
            </div>
          </div>
          {this.renderCustomerActions()}
        </div>
      </>
    );
  }
}

export default OverviewSalesCard;


/**
 * Dashboard Page View - Class Component
 * Refactored to use class component with SOLID principles
 * Separated into methods for better organization
 */

import React, { Component } from "react";
import "../styles/DashboardPage.css";
import { formatIDR } from "../utils/money";
import { formatMs, formatBytes } from "../utils/performance-monitor";
import type { ActiveTab } from "../models/dashboard-page-model";
import type { DashboardPageViewProps } from "./dashboard-page.types";
import TabNavigation from "../components/common/TabNavigation";
import MetricCard from "../components/common/MetricCard";
import QuickActionButton from "../components/common/QuickActionButton";
import KeyValueList from "../components/common/KeyValueList";
import AlertMessage from "../components/common/AlertMessage";
import IconButton from "../components/common/IconButton";
import LuxuryButton from "../components/LuxuryButton";
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
  NotificationIcon,
  LogoutIcon,
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
} from "./dashboard-page.icons";
import { DASHBOARD_TABS, METRIC_CARDS_CONFIG, OVERVIEW_ACTIONS, PRICE_ITEMS, REVENUE_ROWS, ORDER_ROWS, ORDER_STATUS_ITEMS, PAYMENT_STATUS_ITEMS, DATA_QUALITY_ITEMS, PERFORMANCE_METRICS, EXPORT_BUTTONS, CUSTOMER_ACTIONS } from "./dashboard-page.static";
import { SKELETON_COUNTS } from "./dashboard-page.constants";
import BouquetUploader from "../components/sections/dashboard-uploader-section";
import BouquetEditorSection from "../components/sections/Bouquet-editor-section";
import HeroSliderEditorSection from "../components/sections/HeroSliderEditorSection";
import OrdersSection from "../components/sections/orders-section";
import CustomersSection from "../components/sections/customers-section";
import NotificationsCenter from "../components/NotificationsCenter";
import InventoryManager from "../components/InventoryManager";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import QuickActionsPanel from "../components/QuickActionsPanel";
import DashboardSearch from "../components/DashboardSearch";
import ActivityLog from "../components/ActivityLog";
import SystemStatus from "../components/SystemStatus";
import { QUICK_ACTIONS } from "./dashboard-page.constants";

/**
 * Icon map for dynamic icon rendering
 */
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

/**
 * Dashboard Page View Class Component
 * Uses SOLID principles with separated methods
 */
class DashboardPageView extends Component<DashboardPageViewProps> {
  /**
   * Get icon component by key
   */
  private getIcon = (iconKey: string, props?: any): React.ReactNode => {
    const IconComponent = ICON_MAP[iconKey];
    if (!IconComponent) return null;
    return <IconComponent {...props} />;
  };

  /**
   * Render tab bar navigation
   */
  private renderTabBar = (): React.ReactNode => {
    const tabs = DASHBOARD_TABS.map((tab) => {
      const Icon = ICON_MAP[tab.iconKey];
      return {
        key: tab.key,
        label: tab.label,
        icon: Icon ? <Icon width={18} height={18} /> : null,
      };
    });

    return (
      <TabNavigation
        tabs={tabs}
        activeTab={this.props.viewState.activeTab}
        onTabChange={(key) => this.props.onSetActiveTab(key as ActiveTab)}
        className="adminDashboard__tabs"
      />
    );
  };

  /**
   * Render metric cards using loop
   */
  private renderMetricCards = (): React.ReactNode => {
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

          return (
            <MetricCard
              key={config.label}
              label={config.label}
              value={value}
              variant={config.variant}
              icon={Icon ? <Icon /> : null}
              note={note}
            />
          );
        })}
      </div>
    );
  };

  /**
   * Render overview action buttons using loop
   */
  private renderOverviewActions = (): React.ReactNode => {
    const { onSetActiveTab, onCopyOverview, onReloadDashboard, overviewText } = this.props;

    return (
      <div className="overviewHeader__actions" aria-label="Aksi ringkasan">
        {OVERVIEW_ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.iconKey];
          const handleClick = () => {
            if (action.onClickKey === "copyOverview") {
              onCopyOverview(overviewText);
            } else if (action.onClickKey === "reloadDashboard") {
              onReloadDashboard();
            } else {
              onSetActiveTab(action.onClickKey as ActiveTab);
            }
          };

          return (
            <QuickActionButton
              key={action.id}
              icon={Icon ? <Icon /> : null}
              label={action.label}
              onClick={handleClick}
              variant={action.variant === "primary" ? "primary" : undefined}
              ariaLabel={action.ariaLabel}
              title={action.title}
              className={action.className}
            />
          );
        })}
      </div>
    );
  };

  /**
   * Render price items using loop
   */
  private renderPriceItems = (): React.ReactNode => {
    const { overviewMetrics } = this.props;
    const { priceMin, priceAvg, priceMax } = overviewMetrics;

    const items = PRICE_ITEMS.map((item) => {
      const value = item.valueKey === "priceMin" ? priceMin : item.valueKey === "priceAvg" ? priceAvg : priceMax;
      const Icon = ICON_MAP[item.iconKey];

      return {
        key: item.key,
        value: value > 0 ? formatIDR(value) : "—",
        icon: Icon ? <Icon style={{ opacity: 0.6 }} /> : null,
      };
    });

    return <KeyValueList items={items} />;
  };

  /**
   * Render revenue rows using loop
   */
  private renderRevenueRows = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <div className="overviewKeyValue">
        {REVENUE_ROWS.map((row) => {
          const value = (salesMetrics as any)[row.valueKey];
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
   * Render order rows using loop
   */
  private renderOrderRows = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <div className="overviewKeyValue">
        {ORDER_ROWS.map((row) => {
          const value = (salesMetrics as any)[row.valueKey];
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
   * Render order status items using loop
   */
  private renderOrderStatusItems = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <ul className="overviewList">
        {ORDER_STATUS_ITEMS.map((item) => {
          const value = (salesMetrics as any)[item.valueKey];
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
   * Render payment status items using loop
   */
  private renderPaymentStatusItems = (): React.ReactNode => {
    const { salesMetrics } = this.props;
    if (!salesMetrics) return null;

    return (
      <ul className="overviewList">
        {PAYMENT_STATUS_ITEMS.map((item) => {
          const value = (salesMetrics as any)[item.valueKey];
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
   * Render data quality items using loop
   */
  private renderDataQualityItems = (): React.ReactNode => {
    const { overviewMetrics } = this.props;

    return (
      <ul className="overviewList" aria-label="Ringkasan kualitas data">
        {DATA_QUALITY_ITEMS.map((item) => {
          const value = (overviewMetrics as any)[item.valueKey];
          const warningValue = (overviewMetrics as any)[item.warningKey];
          const Icon = ICON_MAP[item.iconKey];
          const hasWarning = warningValue > 0;

          return (
            <li key={item.label} className={`overviewList__item ${hasWarning ? "overviewList__item--warning" : ""}`}>
              <span>
                {Icon && <Icon width={14} height={14} style={{ marginRight: "0.4rem", opacity: 0.6 }} />}
                {item.label}
              </span>
              <b>{value}</b>
            </li>
          );
        })}
      </ul>
    );
  };

  /**
   * Render performance metrics using loop
   */
  private renderPerformanceMetrics = (): React.ReactNode => {
    const { viewState } = this.props;
    const { performance } = viewState;

    if (performance.loading) {
      return <p className="overviewCard__empty">Memuat metrik performa...</p>;
    }

    return (
      <div className="overviewKeyValue" style={{ marginTop: "1rem" }}>
        {PERFORMANCE_METRICS.map((metric) => {
          const value = performance.metrics[metric.valueKey as keyof typeof performance.metrics];
          if (value === undefined) return null;

          const status = metric.statusKey ? performance.score.details[metric.statusKey as keyof typeof performance.score.details] : undefined;
          const formattedValue = metric.format === "ms" ? formatMs(value as number) : metric.format === "bytes" ? `${performance.metrics.totalResources} (${formatBytes(performance.metrics.totalSize || 0)})` : (value as number).toFixed(3);

          return (
            <div key={metric.key} className="overviewKeyValue__row">
              <span className="overviewKeyValue__key">{metric.key}</span>
              <span className={`overviewKeyValue__val ${status?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * Render export buttons using loop
   */
  private renderExportButtons = (): React.ReactNode => {
    const { onExport } = this.props;

    return (
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
        {EXPORT_BUTTONS.map((button) => (
          <LuxuryButton
            key={button.format}
            variant="secondary"
            size="sm"
            onClick={() => onExport(button.format)}
          >
            {button.label}
          </LuxuryButton>
        ))}
      </div>
    );
  };

  /**
   * Render customer action buttons using loop
   */
  private renderCustomerActions = (): React.ReactNode => {
    const { onSetActiveTab, onToggleShow } = this.props;

    return (
      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {CUSTOMER_ACTIONS.map((action) => {
          const Icon = ICON_MAP[action.iconKey];
          const handleClick = () => {
            if (action.onClickKey === "customers") {
              onSetActiveTab("customers");
            } else {
              onToggleShow(action.onClickKey as any);
            }
          };

          return (
            <LuxuryButton
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={handleClick}
              className={action.className}
              style={{ width: "100%", justifyContent: "center" }}
              icon={Icon ? <Icon width={16} height={16} /> : null}
              iconPosition="left"
            >
              {action.label}
            </LuxuryButton>
          );
        })}
      </div>
    );
  };

  /**
   * Render overview header
   */
  private renderOverviewHeader = (): React.ReactNode => {
    const { bouquets, viewState } = this.props;

    const lastUpdatedMs = bouquets.reduce((max, b) => {
      const candidate = (b.updatedAt ?? b.createdAt ?? "").toString();
      const t = Date.parse(candidate);
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    const lastUpdatedLabel = lastUpdatedMs
      ? new Date(lastUpdatedMs).toLocaleString("id-ID")
      : "—";

    const copyStatus = viewState.overviewCopyStatus;

    return (
      <>
        <div className="overviewHeader" aria-label="Ringkasan cepat">
          <div className="overviewHeader__meta">
            <p className="overviewHeader__title">Ringkasan cepat</p>
            <p className="overviewHeader__sub">
              Terakhir diperbarui: <b>{lastUpdatedLabel}</b>
            </p>
          </div>
          {this.renderOverviewActions()}
        </div>

        {copyStatus && (
          <AlertMessage
            variant={copyStatus === "copied" ? "success" : "error"}
            message={
              copyStatus === "copied"
                ? "Ringkasan tersalin."
                : "Gagal menyalin ringkasan. Silakan coba lagi."
            }
            className="overviewToast"
          />
        )}
      </>
    );
  };

  /**
   * Render sales metrics section
   */
  private renderSalesMetrics = (): React.ReactNode => {
    const { salesError, salesMetrics } = this.props;

    if (salesError && salesError.includes("404")) return null;

    if (salesError) {
      return (
        <div className="overviewCard overviewCard--error" aria-label="Sales metrics">
          <p className="overviewCard__title">
            <AlertIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
            Penjualan
          </p>
          <p className="overviewCard__empty" style={{ color: "var(--error-text)", fontSize: "0.9rem", textAlign: "left" }}>
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
            <MoneyIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
            Revenue
          </p>
          {this.renderRevenueRows()}
        </div>

        <div className="overviewCard" aria-label="Orders">
          <p className="overviewCard__title">
            <OrdersIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
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
          <p className="overviewCard__title">Top 5 Produk Terlaris</p>
          {salesMetrics.topSellingBouquets.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data penjualan.</p>
          ) : (
            <ol className="overviewRank">
              {salesMetrics.topSellingBouquets.map((item) => (
                <li key={item.bouquetId} className="overviewRank__item">
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 0 }}>
                    <span className="overviewRank__name" title={item.bouquetName}>
                      {item.bouquetName}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--dash-text-muted)", fontWeight: 700 }}>
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
            <CustomersIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
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
  };

  /**
   * Render insights sections (top collections, search terms, bouquets, visit hours)
   */
  private renderInsightsSections = (): React.ReactNode => {
    const { overviewMetrics, insightsError } = this.props;
    const {
      topCollections,
      topSearchTerms,
      topBouquetsDays,
      visitHours,
      formatHour,
      labelBouquet,
    } = overviewMetrics;

    const topBouquets7d = (this.props.insights?.topBouquets7d ?? []).slice(0, 3);

    return (
      <>
        <div className="overviewCard" aria-label="Top koleksi">
          <p className="overviewCard__title">Top koleksi</p>
          {topCollections.length === 0 ? (
            <p className="overviewCard__empty">Belum ada bouquet.</p>
          ) : (
            <ol className="overviewRank" aria-label="Daftar koleksi teratas">
              {topCollections.map(([name, count]) => (
                <li key={name} className="overviewRank__item">
                  <span className="overviewRank__name" title={name}>
                    {name}
                  </span>
                  <span className="overviewRank__count">{count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="overviewCard" aria-label="Pencarian teratas">
          <p className="overviewCard__title">Pencarian teratas</p>
          {insightsError ? (
            <p className="overviewCard__empty">Insight belum tersedia.</p>
          ) : topSearchTerms.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data pencarian.</p>
          ) : (
            <ol className="overviewRank" aria-label="Daftar pencarian teratas">
              {topSearchTerms.slice(0, 5).map((t) => (
                <li key={t.term} className="overviewRank__item">
                  <span className="overviewRank__name" title={t.term}>
                    {t.term}
                  </span>
                  <span className="overviewRank__count">{t.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="overviewCard" aria-label="Bouquet terpopuler 30 hari">
          <p className="overviewCard__title">Top 5 bouquet (30 hari)</p>
          {insightsError ? (
            <p className="overviewCard__empty">Insight belum tersedia.</p>
          ) : topBouquetsDays.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data kunjungan bouquet.</p>
          ) : (
            <ol className="overviewRank" aria-label="Daftar bouquet terpopuler 30 hari">
              {topBouquetsDays.map((b) => (
                <li key={b.bouquetId} className="overviewRank__item">
                  <span className="overviewRank__name" title={labelBouquet(b.bouquetId)}>
                    {labelBouquet(b.bouquetId)}
                  </span>
                  <span className="overviewRank__count">{b.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="overviewCard" aria-label="Bouquet terpopuler 7 hari">
          <p className="overviewCard__title">Top 3 bouquet (7 hari)</p>
          {insightsError ? (
            <p className="overviewCard__empty">Insight belum tersedia.</p>
          ) : topBouquets7d.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data kunjungan bouquet.</p>
          ) : (
            <ol className="overviewRank" aria-label="Daftar bouquet terpopuler 7 hari">
              {topBouquets7d.map((b) => (
                <li key={b.bouquetId} className="overviewRank__item">
                  <span className="overviewRank__name" title={labelBouquet(b.bouquetId)}>
                    {labelBouquet(b.bouquetId)}
                  </span>
                  <span className="overviewRank__count">{b.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="overviewCard" aria-label="Jam kunjungan terpadat">
          <p className="overviewCard__title">Jam kunjungan terpadat (WIB)</p>
          {insightsError ? (
            <p className="overviewCard__empty">Insight belum tersedia.</p>
          ) : visitHours.length === 0 ? (
            <p className="overviewCard__empty">Belum ada data kunjungan.</p>
          ) : (
            <ol className="overviewRank" aria-label="Daftar jam kunjungan terpadat">
              {visitHours.slice(0, 5).map((h) => (
                <li key={h.hour} className="overviewRank__item">
                  <span className="overviewRank__name">{formatHour(h.hour)}</span>
                  <span className="overviewRank__count">{h.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </>
    );
  };

  /**
   * Render performance section
   */
  private renderPerformanceSection = (): React.ReactNode => {
    const { viewState } = this.props;
    const { performance } = viewState;

    return (
      <div className="overviewCard overviewCard--performance" aria-label="Performance metrics">
        <p className="overviewCard__title">
          <PerformanceIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
          Performance
        </p>
        {performance.loading ? (
          <p className="overviewCard__empty">Memuat metrik performa...</p>
        ) : (
          <>
            <div className="overviewPerformanceScore">
              <div className={`overviewPerformanceScore__badge overviewPerformanceScore__badge--${performance.score.grade}`}>
                <span className="overviewPerformanceScore__value">{performance.score.score}</span>
                <span className="overviewPerformanceScore__label">/ 100</span>
              </div>
              <div className="overviewPerformanceScore__grade">
                {performance.score.grade === "excellent" && "Excellent"}
                {performance.score.grade === "good" && "Good"}
                {performance.score.grade === "needs-improvement" && "Needs Improvement"}
                {performance.score.grade === "poor" && "Poor"}
              </div>
            </div>
            {this.renderPerformanceMetrics()}
          </>
        )}
      </div>
    );
  };

  /**
   * Render SEO section
   */
  private renderSeoSection = (): React.ReactNode => {
    const { viewState } = this.props;
    const { seo } = viewState;

    return (
      <div className="overviewCard overviewCard--seo" aria-label="SEO analysis">
        <p className="overviewCard__title">
          <SeoIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
          SEO Analysis
        </p>
        {seo.loading ? (
          <p className="overviewCard__empty">Menganalisis SEO...</p>
        ) : (
          <>
            <div className="overviewSeoScore">
              <div className={`overviewSeoScore__badge overviewSeoScore__badge--${seo.analysis.grade}`}>
                <span className="overviewSeoScore__value">{seo.analysis.score}</span>
                <span className="overviewSeoScore__label">/ 100</span>
              </div>
              <div className="overviewSeoScore__grade">
                {seo.analysis.grade === "excellent" && "Excellent"}
                {seo.analysis.grade === "good" && "Good"}
                {seo.analysis.grade === "needs-improvement" && "Needs Improvement"}
                {seo.analysis.grade === "poor" && "Poor"}
              </div>
            </div>

            <div className="overviewSeoChecks" style={{ marginTop: "1rem" }}>
              {seo.analysis.checks.slice(0, 6).map((check, idx) => (
                <div key={idx} className={`overviewSeoCheck overviewSeoCheck--${check.status}`}>
                  <span className="overviewSeoCheck__icon">
                    {check.status === "pass" && "✓"}
                    {check.status === "warning" && "⚠"}
                    {check.status === "fail" && "✗"}
                  </span>
                  <div className="overviewSeoCheck__content">
                    <span className="overviewSeoCheck__name">{check.name}</span>
                    <span className="overviewSeoCheck__message">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>

            {seo.analysis.recommendations.length > 0 && (
              <div className="overviewSeoRecommendations" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <p style={{ fontWeight: 800, marginBottom: "0.5rem", fontSize: "0.9rem" }}>Rekomendasi:</p>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: "1.6" }}>
                  {seo.analysis.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: "0.4rem" }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {seo.trends && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <p style={{ fontWeight: 800, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Trends (30 days):</p>
                {seo.trends.score && (
                  <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                    <span style={{ fontWeight: 700 }}>Score: </span>
                    <span className={seo.trends.score.trend === "up" ? "overviewKeyValue__val--good" : ""}>
                      {seo.trends.score.changePercent.toFixed(1)}% {seo.trends.score.trend === "up" ? "↑" : seo.trends.score.trend === "down" ? "↓" : "→"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /**
   * Render alerts section
   */
  private renderAlertsSection = (): React.ReactNode => {
    const { viewState } = this.props;
    const { alerts } = viewState;

    if (!alerts.showAlerts || alerts.alerts.length === 0) return null;

    return (
      <div className="overviewCard overviewCard--alerts" aria-label="Alerts">
        <p className="overviewCard__title">
          <AlertIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
          Alerts ({alerts.alerts.length})
        </p>
        <div className="overviewAlerts" style={{ marginTop: "1rem" }}>
          {alerts.alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className={`overviewAlert overviewAlert--${alert.severity}`}>
              <div className="overviewAlert__content">
                <span className="overviewAlert__title">{alert.title}</span>
                <span className="overviewAlert__message">{alert.message}</span>
              </div>
            </div>
          ))}
          {alerts.alerts.length > 5 && (
            <p style={{ fontSize: "0.85rem", color: "var(--ink-550)", marginTop: "0.5rem" }}>
              +{alerts.alerts.length - 5} more alerts
            </p>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render export section
   */
  private renderExportSection = (): React.ReactNode => {
    return (
      <div className="overviewCard" aria-label="Export analytics">
        <p className="overviewCard__title">
          <ExportIcon width={16} height={16} style={{ marginRight: "0.5rem", opacity: 0.8 }} />
          Export Analytics
        </p>
        {this.renderExportButtons()}
      </div>
    );
  };

  /**
   * Render metrics overview section
   */
  private renderMetrics = (): React.ReactNode => {

    return (
      <section className="dashboardSurface dashboardSurface--metrics" aria-label="Ringkasan">
        {this.renderOverviewHeader()}

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            {this.renderMetricCards()}
          </div>

          <aside className="overviewSide" aria-label="Insight">
            <div className="overviewCard" aria-label="Harga">
              <p className="overviewCard__title">Harga</p>
              {this.renderPriceItems()}
            </div>

            {this.renderSalesMetrics()}

            <div className="overviewCard" aria-label="Kualitas data">
              <p className="overviewCard__title">Kualitas data</p>
              {this.renderDataQualityItems()}
            </div>

            {this.renderInsightsSections()}
            {this.renderPerformanceSection()}
            {this.renderSeoSection()}
            {this.renderAlertsSection()}
            {this.renderExportSection()}
          </aside>
        </div>
      </section>
    );
  };

  /**
   * Render main content based on active tab
   */
  private renderMainContent = (): React.ReactNode => {
    const { viewState, bouquets, collections, onUpdate, onUpload, onDuplicate, onDelete, onHeroSaved, onSetActiveTab, onUpdateCollectionName, onMoveBouquet, onDeleteCollection } = this.props;
    const { activeTab } = viewState;

    switch (activeTab) {
      case "overview":
        return this.renderMetrics();

      case "orders":
        return <OrdersSection bouquets={bouquets} />;

      case "customers":
        return (
          <CustomersSection
            onSelectCustomer={() => {
              onSetActiveTab("orders");
            }}
          />
        );

      case "upload":
        return <BouquetUploader onUpload={onUpload} />;

      case "edit":
        return (
          <BouquetEditorSection
            bouquets={bouquets}
            onSave={onUpdate}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            collections={collections}
            onUpdateCollection={onUpdateCollectionName}
            onMoveBouquet={onMoveBouquet}
            onDeleteCollection={onDeleteCollection}
          />
        );

      case "hero":
        return (
          <HeroSliderEditorSection
            collections={collections}
            onSaved={onHeroSaved}
          />
        );

      case "analytics":
        return (
          <AnalyticsDashboard
            isOpen={true}
            onClose={() => {
              onSetActiveTab("overview");
            }}
            period="30d"
            inline={true}
          />
        );

      default:
        return null;
    }
  };

  /**
   * Render header section
   */
  private renderHeader = (): React.ReactNode => {
    const { onToggleShow, onLogout } = this.props;

    return (
      <div className="adminDashboard__header">
        <div>
          <h1 id="admin-dashboard-title" className="adminDashboard__title">
            Admin Dashboard
          </h1>
          <p className="adminDashboard__subtitle">
            Kelola website, pesanan, dan pelanggan Anda
          </p>
        </div>
        <div className="adminDashboard__headerActions">
          <IconButton
            variant="ghost"
            size="md"
            onClick={() => onToggleShow("showNotifications")}
            ariaLabel="Notifications"
            tooltip="Notifications"
            className="adminDashboard__actionBtn"
            icon={<NotificationIcon width={20} height={20} />}
          />
          <IconButton
            variant="ghost"
            size="md"
            onClick={onLogout}
            ariaLabel="Keluar"
            tooltip="Keluar"
            className="adminDashboard__actionBtn adminDashboard__actionBtn--logout"
            icon={<LogoutIcon width={20} height={20} />}
          />
        </div>
      </div>
    );
  };

  /**
   * Render loading state
   */
  private renderLoading = (): React.ReactNode => {
    return (
      <div className="adminDashboard__loading" aria-live="polite">
        <div className="adminDashboard__spinner"></div>
        <p>Memuat data dashboard...</p>
      </div>
    );
  };

  /**
   * Render error state
   */
  private renderError = (): React.ReactNode => {
    const { errorMessage } = this.props;
    return (
      <AlertMessage
        variant="error"
        message={`Failed to load dashboard data: ${errorMessage}`}
        className="adminDashboard__error"
      />
    );
  };

  /**
   * Render skeleton loading
   */
  private renderSkeleton = (): React.ReactNode => {
    return (
      <div className="adminOverview adminOverview--loading">
        <div className="adminOverview__stats">
          {Array.from({ length: SKELETON_COUNTS.STATS }).map((_, i) => (
            <div key={i} className="adminStatCard adminStatCard--skeleton">
              <div className="adminStatCard__icon adminStatCard__icon--skeleton"></div>
              <div className="adminStatCard__content">
                <div className="adminStatCard__label adminStatCard__label--skeleton"></div>
                <div className="adminStatCard__value adminStatCard__value--skeleton"></div>
                <div className="adminStatCard__change adminStatCard__change--skeleton"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="adminOverview__quickActions">
          <div className="adminOverview__sectionTitle adminOverview__sectionTitle--skeleton"></div>
          <div className="adminOverview__actionGrid">
            {Array.from({ length: SKELETON_COUNTS.QUICK_ACTIONS }).map((_, i) => (
              <div key={i} className="adminQuickAction adminQuickAction--skeleton">
                <div className="adminQuickAction__icon adminQuickAction__icon--skeleton"></div>
                <div className="adminQuickAction__label adminQuickAction__label--skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render modals and overlays
   */
  private renderModals = (): React.ReactNode => {
    const { viewState, onToggleShow, onSetActiveTab } = this.props;

    return (
      <>
        <NotificationsCenter
          isOpen={viewState.showNotifications}
          onClose={() => onToggleShow("showNotifications")}
          onNotificationClick={(notification) => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
          }}
        />

        <InventoryManager
          isOpen={viewState.showInventory}
          onClose={() => onToggleShow("showInventory")}
          onBouquetClick={(bouquetId) => {
            onSetActiveTab("edit");
            onToggleShow("showInventory");
          }}
        />

        {viewState.showAnalytics && viewState.activeTab !== "analytics" && (
          <AnalyticsDashboard
            isOpen={viewState.showAnalytics}
            onClose={() => onToggleShow("showAnalytics")}
            period="30d"
            inline={false}
          />
        )}

        <QuickActionsPanel
          isOpen={viewState.showQuickActions}
          onClose={() => onToggleShow("showQuickActions")}
          actions={QUICK_ACTIONS(onSetActiveTab, onToggleShow)}
        />

        <DashboardSearch
          isOpen={viewState.showSearch}
          onClose={() => onToggleShow("showSearch")}
          onResultClick={(result) => {
            if (result.type === "order") {
              onSetActiveTab("orders");
            } else if (result.type === "customer") {
              onSetActiveTab("customers");
            } else if (result.type === "bouquet") {
              onSetActiveTab("edit");
            }
          }}
        />

        <ActivityLog
          isOpen={viewState.showActivityLog}
          onClose={() => onToggleShow("showActivityLog")}
        />

        <SystemStatus
          isOpen={viewState.showSystemStatus}
          onClose={() => onToggleShow("showSystemStatus")}
        />
      </>
    );
  };

  /**
   * Main render method
   */
  render(): React.ReactNode {
    const { loading, errorMessage, viewState } = this.props;

    return (
      <section className="adminDashboard" aria-labelledby="admin-dashboard-title">
        <div className="adminDashboard__container">
          {this.renderHeader()}
          {this.renderTabBar()}

          <div className="adminDashboard__content">
            {loading && this.renderLoading()}
            {!loading && errorMessage && this.renderError()}
            {!loading && !errorMessage && (
              <div className="adminDashboard__tabPanel" role="tabpanel">
                {this.renderMainContent()}
              </div>
            )}
            {loading && viewState.activeTab === "overview" && this.renderSkeleton()}
          </div>
        </div>

        {this.renderModals()}
      </section>
    );
  }
}

export default DashboardPageView;


/**
 * Dashboard Page View
 * Pure presentation component - no business logic
 */

import React from "react";
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
} from "./dashboard-page.icons";
import { QUICK_ACTIONS, SKELETON_COUNTS } from "./dashboard-page.constants";

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


/**
 * Dashboard Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const DashboardPageView: React.FC<DashboardPageViewProps> = ({
  bouquets,
  collectionsCount,
  visitorsCount,
  collections,
  insights,
  insightsError,
  salesMetrics,
  salesError,
  loading,
  errorMessage,
  viewState,
  overviewMetrics,
  overviewText,
  onUpdate,
  onUpload,
  onDuplicate,
  onDelete,
  onHeroSaved,
  onLogout,
  onUpdateCollectionName,
  onMoveBouquet,
  onDeleteCollection,
  onSetActiveTab,
  onCopyCurrentLink,
  onReloadDashboard,
  onCopyOverview,
  onExport,
  onToggleShow,
}) => {

  /**
   * Render tab bar
   */
  const renderTabBar = (): React.ReactNode => {
    const allTabs = [
      { 
        key: "overview", 
        label: "Overview", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      { 
        key: "orders", 
        label: "Orders", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 11l-4-4m0 0l-4 4m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      { 
        key: "customers", 
        label: "Customers", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      { 
        key: "upload", 
        label: "Upload", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      { 
        key: "edit", 
        label: "Edit", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      { 
        key: "hero", 
        label: "Hero", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        ),
      },
      { 
        key: "analytics", 
        label: "Analytics", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 8h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
    ];

    return (
      <TabNavigation
        tabs={allTabs}
        activeTab={viewState.activeTab}
        onTabChange={(key) => onSetActiveTab(key as ActiveTab)}
        className="adminDashboard__tabs"
      />
    );
  };

  /**
   * Render metrics overview
   */
  const renderMetrics = (): React.ReactNode => {
    // Extract data from overviewMetrics prop
    const {
      readyCount,
      preorderCount,
      featuredCount,
      newEditionCount,
      missingImageCount,
      missingCollectionCount,
      zeroQtyReadyCount,
      totalReadyUnits,
      priceMin,
      priceMax,
      priceAvg,
      topCollections,
      formatHour,
      labelBouquet,
      pageviews30d,
      topSearchTerms,
      topBouquetsDays,
      visitHours,
      uniqueVisitors30d,
      uniqueVisitorsAvailable,
    } = overviewMetrics;

    const insightsDays = Number(insights?.days ?? 30);
    const topBouquets7d = (insights?.topBouquets7d ?? []).slice(0, 3);

    const lastUpdatedMs = bouquets.reduce((max, b) => {
      const candidate = (b.updatedAt ?? b.createdAt ?? "").toString();
      const t = Date.parse(candidate);
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    const lastUpdatedLabel = lastUpdatedMs
      ? new Date(lastUpdatedMs).toLocaleString("id-ID")
      : "—";

    const overviewLines: string[] = [
      `GIFT foryou.idn — Ringkasan Dashboard (${new Date().toLocaleString("id-ID")})`,
      ``,
      `Kunjungan (${insightsDays} hari): ${insightsError ? visitorsCount : pageviews30d || visitorsCount}`,
      `Koleksi: ${collectionsCount}`,
      `Total bouquet: ${bouquets.length}`,
      `Siap: ${readyCount} (unit siap: ${totalReadyUnits})`,
      `Preorder: ${preorderCount}`,
      `Featured: ${featuredCount}`,
      `New edition: ${newEditionCount}`,
      ``,
      `Kualitas data:`,
      `- Tanpa gambar: ${missingImageCount}`,
      `- Tanpa koleksi: ${missingCollectionCount}`,
      `- Ready qty 0: ${zeroQtyReadyCount}`,
      ``,
      `Harga (bouquet dengan harga valid):`,
      `- Min: ${priceMin > 0 ? formatIDR(priceMin) : "—"}`,
      `- Rata-rata: ${priceAvg > 0 ? formatIDR(priceAvg) : "—"}`,
      `- Max: ${priceMax > 0 ? formatIDR(priceMax) : "—"}`,
      ``,
      `Top koleksi:`,
      ...topCollections.map(([name, count]) => `- ${name}: ${count}`),
    ];

    if (insights && !insightsError) {
      overviewLines.push("", "Analytics (estimasi)");

      if (uniqueVisitorsAvailable) {
        overviewLines.push(`Pengunjung unik (30 hari): ${uniqueVisitors30d}`);
      }

      if (topSearchTerms.length) {
        overviewLines.push("Pencarian teratas:");
        overviewLines.push(
          ...topSearchTerms.slice(0, 5).map((t) => `- ${t.term}: ${t.count}`)
        );
      }

      if (topBouquetsDays.length) {
        overviewLines.push("Top 5 bouquet (30 hari):");
        overviewLines.push(
          ...topBouquetsDays.map((b) => `- ${labelBouquet(b.bouquetId)}: ${b.count}`)
        );
      }

      if (visitHours.length) {
        overviewLines.push("Jam kunjungan terpadat (WIB):");
        overviewLines.push(
          ...visitHours.slice(0, 3).map((h) => `- ${formatHour(h.hour)}: ${h.count}`)
        );
      }
    }

    const overviewText = overviewLines.join("\n");

    // Overview text is passed via props

    const copyStatus = viewState.overviewCopyStatus;

    return (
      <section className="dashboardSurface dashboardSurface--metrics" aria-label="Ringkasan">
        <div className="overviewHeader" aria-label="Ringkasan cepat">
          <div className="overviewHeader__meta">
            <p className="overviewHeader__title">Ringkasan cepat</p>
            <p className="overviewHeader__sub">
              Terakhir diperbarui: <b>{lastUpdatedLabel}</b>
            </p>
          </div>

          <div className="overviewHeader__actions" aria-label="Aksi ringkasan">
            <QuickActionButton
              icon={<AddIcon />}
              label="Tambah bouquet"
              onClick={() => onSetActiveTab("upload")}
              ariaLabel="Tambah bouquet baru"
              className="overviewActionBtn"
            />
            <QuickActionButton
              icon={<EditIcon />}
              label="Buka editor"
              onClick={() => onSetActiveTab("edit")}
              ariaLabel="Buka editor bouquet"
              className="overviewActionBtn"
            />
            <QuickActionButton
              icon={<GridIcon />}
              label="Atur hero"
              onClick={() => onSetActiveTab("hero")}
              ariaLabel="Atur hero slider"
              className="overviewActionBtn"
            />
            <QuickActionButton
              icon={<CopyIcon />}
              label="Salin ringkasan"
              onClick={() => onCopyOverview(overviewText)}
              variant="primary"
              ariaLabel="Salin ringkasan ke clipboard"
              title="Ctrl/Cmd + C untuk copy"
              className="overviewActionBtn overviewActionBtn--primary"
            />
            <QuickActionButton
              icon={<RefreshIcon />}
              label="Refresh"
              onClick={onReloadDashboard}
              ariaLabel="Muat ulang dashboard"
              title="Refresh data (Ctrl/Cmd + R)"
              className="overviewActionBtn"
            />
          </div>
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

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            <div className="dashboardMetrics" aria-label="Metrik toko">
              <MetricCard
                label="Kunjungan (30 hari)"
                value={insightsError ? visitorsCount : pageviews30d || visitorsCount}
                variant="visits"
                icon={<VisitsIcon />}
              />

              <MetricCard
                label="Pengunjung unik (30 hari)"
                value={
                  insightsError
                    ? "—"
                    : uniqueVisitorsAvailable
                      ? uniqueVisitors30d
                      : "—"
                }
                note={
                  uniqueVisitorsAvailable
                    ? "Berbasis visitorId anonim."
                    : "Mulai terekam setelah update."
                }
                variant="info"
                icon={<UsersIcon />}
              />

              <MetricCard
                label="Koleksi"
                value={collectionsCount}
                variant="collections"
                icon={<CollectionsIcon />}
              />

              <MetricCard
                label="Total bouquet"
                value={bouquets.length}
                variant="bouquets"
                icon={<BouquetsIcon />}
              />

              <MetricCard
                label="Siap"
                value={readyCount}
                note={`Unit siap: ${totalReadyUnits}`}
                variant="success"
                icon={<CheckIcon />}
              />

              <MetricCard
                label="Preorder"
                value={preorderCount}
                variant="warning"
                icon={<ClockIcon />}
              />

              <MetricCard
                label="Featured"
                value={featuredCount}
                note={`New edition: ${newEditionCount}`}
                variant="featured"
                icon={<StarIcon />}
              />
            </div>
          </div>

          <aside className="overviewSide" aria-label="Insight">
            <div className="overviewCard" aria-label="Harga">
              <p className="overviewCard__title">Harga</p>
              <KeyValueList
                items={[
                  {
                    key: "Min",
                    value: priceMin > 0 ? formatIDR(priceMin) : "—",
                    icon: <MoneyIcon style={{ opacity: 0.6 }} />,
                  },
                  {
                    key: "Rata-rata",
                    value: priceAvg > 0 ? formatIDR(priceAvg) : "—",
                    icon: <MoneyIcon style={{ opacity: 0.6 }} />,
                  },
                  {
                    key: "Max",
                    value: priceMax > 0 ? formatIDR(priceMax) : "—",
                    icon: <MoneyIcon style={{ opacity: 0.6 }} />,
                  },
                ]}
              />
            </div>

            {/* Sales Metrics Section - Only show if available */}
            {salesError && salesError.includes("404") ? null : salesError ? (
              <div className="overviewCard overviewCard--error" aria-label="Sales metrics">
                <p className="overviewCard__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Penjualan
                </p>
                <p className="overviewCard__empty" style={{ color: "var(--error-text)", fontSize: "0.9rem", textAlign: "left" }}>
                  {salesError}
                </p>
              </div>
            ) : salesMetrics ? (
              <>
                <div className="overviewCard" aria-label="Revenue">
                  <p className="overviewCard__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Revenue
                  </p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.totalRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Hari ini</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.todayRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Bulan ini</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.thisMonthRevenue)}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Rata-rata order</span>
                      <span className="overviewKeyValue__val">{formatIDR(salesMetrics.averageOrderValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="overviewCard" aria-label="Orders">
                  <p className="overviewCard__title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Orders
                  </p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total</span>
                      <span className="overviewKeyValue__val">{salesMetrics.totalOrders}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Hari ini</span>
                      <span className="overviewKeyValue__val">{salesMetrics.todayOrders}</span>
                    </div>
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Bulan ini</span>
                      <span className="overviewKeyValue__val">{salesMetrics.thisMonthOrders}</span>
                    </div>
                  </div>
                </div>

                <div className="overviewCard" aria-label="Order Status">
                  <p className="overviewCard__title">Status Order</p>
                  <ul className="overviewList">
                    <li className="overviewList__item">
                      <span>Pending</span>
                      <b>{salesMetrics.pendingOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Processing</span>
                      <b>{salesMetrics.processingOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Completed</span>
                      <b>{salesMetrics.completedOrders}</b>
                    </li>
                  </ul>
                </div>

                <div className="overviewCard" aria-label="Payment Status">
                  <p className="overviewCard__title">Status Pembayaran</p>
                  <ul className="overviewList">
                    <li className="overviewList__item">
                      <span>Belum Bayar</span>
                      <b>{salesMetrics.unpaidOrders}</b>
                    </li>
                    <li className="overviewList__item">
                      <span>Sudah Bayar</span>
                      <b>{salesMetrics.paidOrders}</b>
                    </li>
                  </ul>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pelanggan
                  </p>
                  <div className="overviewKeyValue">
                    <div className="overviewKeyValue__row">
                      <span className="overviewKeyValue__key">Total Pelanggan</span>
                      <span className="overviewKeyValue__val">{salesMetrics.totalCustomers}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <LuxuryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onSetActiveTab("customers")}
                      className="overviewActionBtn"
                      style={{ width: "100%", justifyContent: "center" }}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      iconPosition="left"
                    >
                      Kelola Customers
                    </LuxuryButton>
                    <LuxuryButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onToggleShow("showInventory")}
                      className="overviewActionBtn"
                      style={{ width: "100%", justifyContent: "center" }}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      iconPosition="left"
                    >
                      Inventory
                    </LuxuryButton>
                    <LuxuryButton
                      variant="primary"
                      size="sm"
                      onClick={() => onToggleShow("showAnalytics")}
                      className="overviewActionBtn overviewActionBtn--primary"
                      style={{ width: "100%", justifyContent: "center" }}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      iconPosition="left"
                    >
                      Analytics
                    </LuxuryButton>
                  </div>
                </div>
              </>
            ) : null}

            <div className="overviewCard" aria-label="Kualitas data">
              <p className="overviewCard__title">Kualitas data</p>
              <ul className="overviewList" aria-label="Ringkasan kualitas data">
                <li className={`overviewList__item ${missingImageCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Tanpa gambar
                  </span>
                  <b>{missingImageCount}</b>
                </li>
                <li className={`overviewList__item ${missingCollectionCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Tanpa koleksi
                  </span>
                  <b>{missingCollectionCount}</b>
                </li>
                <li className={`overviewList__item ${zeroQtyReadyCount > 0 ? "overviewList__item--warning" : ""}`}>
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Ready qty 0
                  </span>
                  <b>{zeroQtyReadyCount}</b>
                </li>
              </ul>
            </div>

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

            {/* Performance Metrics Section */}
            <div className="overviewCard overviewCard--performance" aria-label="Performance metrics">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Performance
              </p>
              {viewState.performance.loading ? (
                <p className="overviewCard__empty">Memuat metrik performa...</p>
              ) : (
                <>
                  <div className="overviewPerformanceScore">
                    <div className={`overviewPerformanceScore__badge overviewPerformanceScore__badge--${viewState.performance.score.grade}`}>
                      <span className="overviewPerformanceScore__value">{viewState.performance.score.score}</span>
                      <span className="overviewPerformanceScore__label">/ 100</span>
                    </div>
                    <div className="overviewPerformanceScore__grade">
                      {viewState.performance.score.grade === "excellent" && "Excellent"}
                      {viewState.performance.score.grade === "good" && "Good"}
                      {viewState.performance.score.grade === "needs-improvement" && "Needs Improvement"}
                      {viewState.performance.score.grade === "poor" && "Poor"}
                    </div>
                  </div>
                  
                  <div className="overviewKeyValue" style={{ marginTop: "1rem" }}>
                    {viewState.performance.metrics.fcp !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">First Contentful Paint</span>
                        <span className="overviewKeyValue__val">{formatMs(viewState.performance.metrics.fcp)}</span>
                      </div>
                    )}
                    {viewState.performance.metrics.lcp !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Largest Contentful Paint</span>
                        <span className={`overviewKeyValue__val ${viewState.performance.score.details.lcp?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {formatMs(viewState.performance.metrics.lcp)}
                        </span>
                      </div>
                    )}
                    {viewState.performance.metrics.fid !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">First Input Delay</span>
                        <span className={`overviewKeyValue__val ${viewState.performance.score.details.fid?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {formatMs(viewState.performance.metrics.fid)}
                        </span>
                      </div>
                    )}
                    {viewState.performance.metrics.cls !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Cumulative Layout Shift</span>
                        <span className={`overviewKeyValue__val ${viewState.performance.score.details.cls?.status === "excellent" ? "overviewKeyValue__val--good" : ""}`}>
                          {viewState.performance.metrics.cls.toFixed(3)}
                        </span>
                      </div>
                    )}
                    {viewState.performance.metrics.ttfb !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Time to First Byte</span>
                        <span className="overviewKeyValue__val">{formatMs(viewState.performance.metrics.ttfb)}</span>
                      </div>
                    )}
                    {viewState.performance.metrics.loadComplete !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Load Complete</span>
                        <span className="overviewKeyValue__val">{formatMs(viewState.performance.metrics.loadComplete)}</span>
                      </div>
                    )}
                    {viewState.performance.metrics.totalSize !== undefined && (
                      <div className="overviewKeyValue__row">
                        <span className="overviewKeyValue__key">Total Resources</span>
                        <span className="overviewKeyValue__val">
                          {viewState.performance.metrics.totalResources} ({formatBytes(viewState.performance.metrics.totalSize)})
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* SEO Analysis Section */}
            <div className="overviewCard overviewCard--seo" aria-label="SEO analysis">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                SEO Analysis
              </p>
              {viewState.seo.loading ? (
                <p className="overviewCard__empty">Menganalisis SEO...</p>
              ) : (
                <>
                  <div className="overviewSeoScore">
                    <div className={`overviewSeoScore__badge overviewSeoScore__badge--${viewState.seo.analysis.grade}`}>
                      <span className="overviewSeoScore__value">{viewState.seo.analysis.score}</span>
                      <span className="overviewSeoScore__label">/ 100</span>
                    </div>
                    <div className="overviewSeoScore__grade">
                      {viewState.seo.analysis.grade === "excellent" && "Excellent"}
                      {viewState.seo.analysis.grade === "good" && "Good"}
                      {viewState.seo.analysis.grade === "needs-improvement" && "Needs Improvement"}
                      {viewState.seo.analysis.grade === "poor" && "Poor"}
                    </div>
                  </div>

                  <div className="overviewSeoChecks" style={{ marginTop: "1rem" }}>
                    {viewState.seo.analysis.checks.slice(0, 6).map((check, idx) => (
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

                  {viewState.seo.analysis.recommendations.length > 0 && (
                    <div className="overviewSeoRecommendations" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <p style={{ fontWeight: 800, marginBottom: "0.5rem", fontSize: "0.9rem" }}>Rekomendasi:</p>
                      <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: "1.6" }}>
                        {viewState.seo.analysis.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} style={{ marginBottom: "0.4rem" }}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* SEO Trends Section */}
                  {viewState.seo.trends && (
                    <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                      <p style={{ fontWeight: 800, marginBottom: "0.75rem", fontSize: "0.9rem" }}>Trends (30 days):</p>
                      {viewState.seo.trends.score && (
                        <div style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                          <span style={{ fontWeight: 700 }}>Score: </span>
                          <span className={viewState.seo.trends.score.trend === "up" ? "overviewKeyValue__val--good" : ""}>
                            {viewState.seo.trends.score.changePercent.toFixed(1)}% {viewState.seo.trends.score.trend === "up" ? "↑" : viewState.seo.trends.score.trend === "down" ? "↓" : "→"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Alerts Section */}
            {viewState.alerts.showAlerts && viewState.alerts.alerts.length > 0 && (
              <div className="overviewCard overviewCard--alerts" aria-label="Alerts">
                <p className="overviewCard__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Alerts ({viewState.alerts.alerts.length})
                </p>
                <div className="overviewAlerts" style={{ marginTop: "1rem" }}>
                  {viewState.alerts.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`overviewAlert overviewAlert--${alert.severity}`}>
                      <div className="overviewAlert__content">
                        <span className="overviewAlert__title">{alert.title}</span>
                        <span className="overviewAlert__message">{alert.message}</span>
                      </div>
                    </div>
                  ))}
                  {viewState.alerts.alerts.length > 5 && (
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-550)", marginTop: "0.5rem" }}>
                      +{viewState.alerts.alerts.length - 5} more alerts
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Export Section */}
            <div className="overviewCard" aria-label="Export analytics">
              <p className="overviewCard__title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.5rem", opacity: 0.8 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export Analytics
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <LuxuryButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onExport("csv")}
                >
                  Export CSV
                </LuxuryButton>
                <LuxuryButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onExport("json")}
                >
                  Export JSON
                </LuxuryButton>
                <LuxuryButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onExport("pdf")}
                >
                  Export PDF
                </LuxuryButton>
              </div>
            </div>
          </aside>
        </div>
      </section>
    );
  };

  /**
   * Render main content based on active tab
   */
  const renderMainContent = (): React.ReactNode => {
    const { activeTab } = viewState;

    switch (activeTab) {
      case "overview":
        return renderMetrics();

      case "orders":
        return <OrdersSection bouquets={bouquets} />;

      case "customers":
        return (
          <CustomersSection
            onSelectCustomer={(customerId) => {
              // Switch to orders tab when customer is selected
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

  return (
    <section className="adminDashboard" aria-labelledby="admin-dashboard-title">
      <div className="adminDashboard__container">
        {/* Header */}
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

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Content */}
        <div className="adminDashboard__content">
          {loading && (
            <div className="adminDashboard__loading" aria-live="polite">
              <div className="adminDashboard__spinner"></div>
              <p>Memuat data dashboard...</p>
            </div>
          )}

          {!loading && errorMessage && (
            <AlertMessage
              variant="error"
              message={`Failed to load dashboard data: ${errorMessage}`}
              className="adminDashboard__error"
            />
          )}

          {!loading && !errorMessage && (
            <div className="adminDashboard__tabPanel" role="tabpanel">
              {renderMainContent()}
            </div>
          )}

          {loading && viewState.activeTab === "overview" && (
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
          )}
        </div>
      </div>

      {/* Notifications Center */}
      <NotificationsCenter
        isOpen={viewState.showNotifications}
        onClose={() => onToggleShow("showNotifications")}
        onNotificationClick={(notification) => {
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        }}
      />

      {/* Inventory Manager */}
      <InventoryManager
        isOpen={viewState.showInventory}
        onClose={() => onToggleShow("showInventory")}
        onBouquetClick={(bouquetId) => {
          onSetActiveTab("edit");
          onToggleShow("showInventory");
        }}
      />

      {/* Analytics Dashboard Modal - Only show when not in analytics tab */}
      {viewState.showAnalytics && viewState.activeTab !== "analytics" && (
        <AnalyticsDashboard
          isOpen={viewState.showAnalytics}
          onClose={() => onToggleShow("showAnalytics")}
          period="30d"
          inline={false}
        />
      )}
      
      {/* Admin Support Features */}
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
    </section>
  );
};

export default DashboardPageView;

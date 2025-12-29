/**
 * Dashboard Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import type { Bouquet } from "../models/domain/bouquet";
import "../styles/DashboardPage.css";
import { formatIDR } from "../utils/money";
import { formatMs, formatBytes } from "../utils/performance-monitor";
import type { DashboardPageViewState, ActiveTab } from "../models/dashboard-page-model";

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

interface OverviewMetrics {
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

interface DashboardPageViewProps {
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
    const allTabs: Array<{ key: ActiveTab; label: string; icon: React.ReactNode; shortcut?: string }> = [
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
        shortcut: "Alt+1"
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
        shortcut: "Alt+2"
      },
      { 
        key: "customers", 
        label: "Customers", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        shortcut: "Alt+3"
      },
      { 
        key: "upload", 
        label: "Upload", 
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        shortcut: "Alt+4"
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
        shortcut: "Alt+5"
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
        shortcut: "Alt+6"
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
        shortcut: "Alt+7"
      },
    ];

    return (
      <nav className="adminDashboard__tabs" role="tablist" aria-label="Dashboard navigation">
        {allTabs.map((t) => {
          const isActive = viewState.activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-keyshortcuts={t.shortcut}
              className={`adminDashboard__tab ${isActive ? "adminDashboard__tab--active" : ""}`}
              onClick={() => onSetActiveTab(t.key)}
            >
              <span className="adminDashboard__tabIcon">{t.icon}</span>
              <span className="adminDashboard__tabLabel">{t.label}</span>
              {isActive && <div className="adminDashboard__tabIndicator"></div>}
            </button>
          );
        })}
      </nav>
    );
  };

  /**
   * Render metrics overview
   */
  const renderMetrics = (): React.ReactNode => {
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
      pageviews30d,
      uniqueVisitors30d,
      uniqueVisitorsAvailable,
      insightsError,
    } = overviewMetrics;

    return (
      <div className="adminOverview">
        {/* Professional Stats Cards */}
        <div className="adminOverview__stats">
          {/* Revenue Stats */}
          {salesMetrics && (
            <>
              <div className="adminStatCard adminStatCard--revenue" role="region" aria-label="Revenue statistics">
                <div className="adminStatCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="adminStatCard__content">
                  <p className="adminStatCard__label">Total Revenue</p>
                  <p className="adminStatCard__value" aria-label={`Total revenue: ${formatIDR(salesMetrics.totalRevenue)}`}>
                    {formatIDR(salesMetrics.totalRevenue)}
                  </p>
                  <p className="adminStatCard__change">Bulan ini: {formatIDR(salesMetrics.thisMonthRevenue)}</p>
                </div>
              </div>

              <div className="adminStatCard adminStatCard--orders">
                <div className="adminStatCard__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="adminStatCard__content">
                  <p className="adminStatCard__label">Total Orders</p>
                  <p className="adminStatCard__value">{salesMetrics.totalOrders}</p>
                  <p className="adminStatCard__change">Hari ini: {salesMetrics.todayOrders}</p>
                </div>
              </div>

              <div className="adminStatCard adminStatCard--customers">
                <div className="adminStatCard__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="adminStatCard__content">
                  <p className="adminStatCard__label">Total Customers</p>
                  <p className="adminStatCard__value">{salesMetrics.totalCustomers}</p>
                  <p className="adminStatCard__change">AOV: {formatIDR(salesMetrics.averageOrderValue)}</p>
                </div>
              </div>

              <div className="adminStatCard adminStatCard--pending">
                <div className="adminStatCard__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="adminStatCard__content">
                  <p className="adminStatCard__label">Pending Orders</p>
                  <p className="adminStatCard__value">{salesMetrics.pendingOrders}</p>
                  <p className="adminStatCard__change">Processing: {salesMetrics.processingOrders}</p>
                </div>
              </div>
            </>
          )}

          {/* Website Stats */}
          <div className="adminStatCard adminStatCard--visits">
            <div className="adminStatCard__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="adminStatCard__content">
              <p className="adminStatCard__label">Pageviews (30d)</p>
              <p className="adminStatCard__value">
                {insightsError ? visitorsCount : pageviews30d || visitorsCount}
              </p>
              <p className="adminStatCard__change">
                Unique: {uniqueVisitorsAvailable ? uniqueVisitors30d : "—"}
              </p>
            </div>
          </div>

          <div className="adminStatCard adminStatCard--bouquets">
            <div className="adminStatCard__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="adminStatCard__content">
              <p className="adminStatCard__label">Total Bouquets</p>
              <p className="adminStatCard__value">{bouquets.length}</p>
              <p className="adminStatCard__change">Ready: {readyCount} | Preorder: {preorderCount}</p>
            </div>
          </div>

          <div className="adminStatCard adminStatCard--collections">
            <div className="adminStatCard__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="adminStatCard__content">
              <p className="adminStatCard__label">Collections</p>
              <p className="adminStatCard__value">{collectionsCount}</p>
              <p className="adminStatCard__change">Featured: {featuredCount}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="adminOverview__quickActions">
          <h2 className="adminOverview__sectionTitle">Quick Actions</h2>
          <div className="adminOverview__actionGrid">
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("upload")}
              aria-label="Upload Bouquet"
              title="Upload Bouquet baru"
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">Upload Bouquet</span>
            </button>
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("edit")}
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">Edit Bouquet</span>
            </button>
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("orders")}
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 11l-4-4m0 0l-4 4m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">View Orders</span>
            </button>
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("customers")}
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">Manage Customers</span>
            </button>
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("hero")}
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">Hero Slider</span>
            </button>
            <button
              type="button"
              className="adminQuickAction"
              onClick={() => onSetActiveTab("analytics")}
            >
              <div className="adminQuickAction__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="adminQuickAction__label">Analytics</span>
            </button>
          </div>
        </div>

        {/* Detailed Metrics Section */}
        <div className="adminOverview__details">
          <div className="adminOverview__grid">
            {/* Bouquet Metrics */}
            <div className="adminOverview__card">
              <h3 className="adminOverview__cardTitle">Bouquet Metrics</h3>
              <div className="adminOverview__metricGrid">
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">Total Bouquets</span>
                  <span className="adminOverview__metricValue">{bouquets.length}</span>
                </div>
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">Ready</span>
                  <span className="adminOverview__metricValue">{readyCount}</span>
                </div>
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">Preorder</span>
                  <span className="adminOverview__metricValue">{preorderCount}</span>
                </div>
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">Featured</span>
                  <span className="adminOverview__metricValue">{featuredCount}</span>
                </div>
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">New Edition</span>
                  <span className="adminOverview__metricValue">{newEditionCount}</span>
                </div>
                <div className="adminOverview__metricItem">
                  <span className="adminOverview__metricLabel">Total Units Ready</span>
                  <span className="adminOverview__metricValue">{totalReadyUnits}</span>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="adminOverview__card">
              <h3 className="adminOverview__cardTitle">Price Range</h3>
              <div className="adminOverview__priceInfo">
                <div className="adminOverview__priceItem">
                  <span className="adminOverview__priceLabel">Minimum</span>
                  <span className="adminOverview__priceValue">{priceMin > 0 ? formatIDR(priceMin) : "—"}</span>
                </div>
                <div className="adminOverview__priceItem">
                  <span className="adminOverview__priceLabel">Average</span>
                  <span className="adminOverview__priceValue">{priceAvg > 0 ? formatIDR(priceAvg) : "—"}</span>
                </div>
                <div className="adminOverview__priceItem">
                  <span className="adminOverview__priceLabel">Maximum</span>
                  <span className="adminOverview__priceValue">{priceMax > 0 ? formatIDR(priceMax) : "—"}</span>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="adminOverview__card">
              <h3 className="adminOverview__cardTitle">Data Quality</h3>
              <div className="adminOverview__qualityList">
                <div className="adminOverview__qualityItem">
                  <span className="adminOverview__qualityLabel">Missing Images</span>
                  <span className={`adminOverview__qualityValue ${missingImageCount > 0 ? "adminOverview__qualityValue--warning" : ""}`}>
                    {missingImageCount}
                  </span>
                </div>
                <div className="adminOverview__qualityItem">
                  <span className="adminOverview__qualityLabel">No Collection</span>
                  <span className={`adminOverview__qualityValue ${missingCollectionCount > 0 ? "adminOverview__qualityValue--warning" : ""}`}>
                    {missingCollectionCount}
                  </span>
                </div>
                <div className="adminOverview__qualityItem">
                  <span className="adminOverview__qualityLabel">Ready Qty 0</span>
                  <span className={`adminOverview__qualityValue ${zeroQtyReadyCount > 0 ? "adminOverview__qualityValue--error" : ""}`}>
                    {zeroQtyReadyCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Collections */}
            {topCollections.length > 0 && (
              <div className="adminOverview__card">
                <h3 className="adminOverview__cardTitle">Top Collections</h3>
                <div className="adminOverview__collectionList">
                  {topCollections.map(([name, count], idx) => (
                    <div key={name} className="adminOverview__collectionItem">
                      <span className="adminOverview__collectionRank">#{idx + 1}</span>
                      <span className="adminOverview__collectionName" title={name}>{name}</span>
                      <span className="adminOverview__collectionCount">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sales Metrics - if available */}
            {salesMetrics && (
              <>
                <div className="adminOverview__card">
                  <h3 className="adminOverview__cardTitle">Order Status</h3>
                  <div className="adminOverview__statusGrid">
                    <div className="adminOverview__statusItem">
                      <span className="adminOverview__statusLabel">Pending</span>
                      <span className="adminOverview__statusValue adminOverview__statusValue--pending">{salesMetrics.pendingOrders}</span>
                    </div>
                    <div className="adminOverview__statusItem">
                      <span className="adminOverview__statusLabel">Processing</span>
                      <span className="adminOverview__statusValue adminOverview__statusValue--processing">{salesMetrics.processingOrders}</span>
                    </div>
                    <div className="adminOverview__statusItem">
                      <span className="adminOverview__statusLabel">Completed</span>
                      <span className="adminOverview__statusValue adminOverview__statusValue--completed">{salesMetrics.completedOrders}</span>
                    </div>
                  </div>
                </div>

                {salesMetrics.topSellingBouquets.length > 0 && (
                  <div className="adminOverview__card">
                    <h3 className="adminOverview__cardTitle">Top Selling Products</h3>
                    <div className="adminOverview__topProducts">
                      {salesMetrics.topSellingBouquets.slice(0, 5).map((item, idx) => (
                        <div key={item.bouquetId} className="adminOverview__productItem">
                          <span className="adminOverview__productRank">#{idx + 1}</span>
                          <div className="adminOverview__productInfo">
                            <span className="adminOverview__productName" title={item.bouquetName}>{item.bouquetName}</span>
                            <span className="adminOverview__productStats">
                              {item.orderCount} orders • {formatIDR(item.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Legacy renderMetrics function - using overviewMetrics from props
  const renderMetricsLegacy = (): React.ReactNode => {
    const insightsDays = Number(insights?.days ?? 30);
    const pageviews30d = Number(insights?.pageviews30d ?? 0);
    const topSearchTerms = (insights?.topSearchTerms ?? []).slice(0, 10);
    const topBouquetsDays = (insights?.topBouquetsDays ?? []).slice(0, 5);
    const topBouquets7d = (insights?.topBouquets7d ?? []).slice(0, 3);
    const visitHours = (insights?.visitHours ?? []).slice(0, 8);
    const uniqueVisitors30d = Number(insights?.uniqueVisitors30d ?? 0);
    const uniqueVisitorsAvailable = Boolean(insights?.uniqueVisitorsAvailable);

    const bouquetNameById = new Map<string, string>();
    for (const b of bouquets) {
      const id = (b._id ?? "").toString();
      const name = (b.name ?? "").toString().trim();
      if (id && name) bouquetNameById.set(id, name);
    }

    const formatHour = (h: number) => `${String(h).padStart(2, "0")}.00`;
    const labelBouquet = (id: string) =>
      bouquetNameById.get(id) ?? (id ? `ID ${id.slice(0, 10)}` : "—");

    const readyCount = bouquets.filter((b) => b.status === "ready").length;
    const preorderCount = bouquets.filter((b) => b.status === "preorder").length;
    const featuredCount = bouquets.filter((b) => Boolean(b.isFeatured)).length;
    const newEditionCount = bouquets.filter((b) => Boolean(b.isNewEdition)).length;

    const missingImageCount = bouquets.filter((b) => !(b.image ?? "").trim()).length;
    const missingCollectionCount = bouquets.filter(
      (b) => !(b.collectionName ?? "").trim()
    ).length;
    const zeroQtyReadyCount = bouquets.filter(
      (b) => b.status === "ready" && (typeof b.quantity === "number" ? b.quantity : 0) === 0
    ).length;

    const totalReadyUnits = bouquets
      .filter((b) => b.status === "ready")
      .reduce((sum, b) => sum + (typeof b.quantity === "number" ? b.quantity : 0), 0);

    const priced = bouquets
      .map((b) => (typeof b.price === "number" ? b.price : Number(b.price)))
      .filter((n) => Number.isFinite(n) && n > 0);
    const priceMin = priced.length ? Math.min(...priced) : 0;
    const priceMax = priced.length ? Math.max(...priced) : 0;
    const priceAvg = priced.length
      ? Math.round(priced.reduce((a, b) => a + b, 0) / priced.length)
      : 0;

    const lastUpdatedMs = bouquets.reduce((max, b) => {
      const candidate = (b.updatedAt ?? b.createdAt ?? "").toString();
      const t = Date.parse(candidate);
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _lastUpdatedLabel = lastUpdatedMs
      ? new Date(lastUpdatedMs).toLocaleString("id-ID")
      : "—";

    const collectionCounts = new Map<string, number>();
    for (const b of bouquets) {
      const key = (b.collectionName ?? "").trim() || "Tanpa koleksi";
      collectionCounts.set(key, (collectionCounts.get(key) ?? 0) + 1);
    }
    const topCollections = Array.from(collectionCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6);

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
      `- Min: ${priced.length ? formatIDR(priceMin) : "—"}`,
      `- Rata-rata: ${priced.length ? formatIDR(priceAvg) : "—"}`,
      `- Max: ${priced.length ? formatIDR(priceMax) : "—"}`,
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
              Terakhir diperbarui: <b>{_lastUpdatedLabel}</b>
            </p>
          </div>

          <div className="overviewHeader__actions" aria-label="Aksi ringkasan">
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => onSetActiveTab("upload")}
              aria-label="Tambah bouquet baru"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Tambah bouquet</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => onSetActiveTab("edit")}
              aria-label="Buka editor bouquet"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Buka editor</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={() => onSetActiveTab("hero")}
              aria-label="Atur hero slider"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Atur hero</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn overviewActionBtn--primary"
              onClick={() => onCopyOverview(overviewText)}
              aria-label="Salin ringkasan ke clipboard"
              title="Ctrl/Cmd + C untuk copy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Salin ringkasan</span>
            </button>
            <button
              type="button"
              className="overviewActionBtn"
              onClick={onReloadDashboard}
              aria-label="Muat ulang dashboard"
              title="Refresh data (Ctrl/Cmd + R)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 16H3v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {copyStatus && (
          <div
            className="overviewToast"
            role={copyStatus === "failed" ? "alert" : "status"}
            aria-live="polite"
            aria-atomic="true"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {copyStatus === "copied" ? (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </>
              )}
            </svg>
            <span>
              {copyStatus === "copied"
                ? "Ringkasan tersalin."
                : "Gagal menyalin ringkasan. Silakan coba lagi."}
            </span>
          </div>
        )}

        <div className="overviewLayout" aria-label="Konten ringkasan">
          <div className="overviewCol">
            <div className="dashboardMetrics" aria-label="Metrik toko">
              <div className="metricCard metricCard--primary">
                <p className="metricCard__label">Kunjungan (30 hari)</p>
                <p className="metricCard__value">
                  {insightsError ? visitorsCount : pageviews30d || visitorsCount}
                </p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                    <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--info">
                <p className="metricCard__label">Pengunjung unik (30 hari)</p>
                <p className="metricCard__value">
                  {insightsError
                    ? "—"
                    : uniqueVisitorsAvailable
                      ? uniqueVisitors30d
                      : "—"}
                </p>
                <p className="metricCard__note">
                  {uniqueVisitorsAvailable
                    ? "Berbasis visitorId anonim."
                    : "Mulai terekam setelah update."}
                </p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--success">
                <p className="metricCard__label">Koleksi</p>
                <p className="metricCard__value">{collectionsCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--primary">
                <p className="metricCard__label">Total bouquet</p>
                <p className="metricCard__value">{bouquets.length}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--success">
                <p className="metricCard__label">Siap</p>
                <p className="metricCard__value">{readyCount}</p>
                <p className="metricCard__note">Unit siap: {totalReadyUnits}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--warning">
                <p className="metricCard__label">Preorder</p>
                <p className="metricCard__value">{preorderCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="metricCard metricCard--featured">
                <p className="metricCard__label">Featured</p>
                <p className="metricCard__value">{featuredCount}</p>
                <p className="metricCard__note">New edition: {newEditionCount}</p>
                <div className="metricCard__icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <aside className="overviewSide" aria-label="Insight">
            <div className="overviewCard" aria-label="Harga">
              <p className="overviewCard__title">Harga</p>
              <div className="overviewKeyValue">
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Min
                  </span>
                  <span className="overviewKeyValue__val">
                    {priceMin > 0 ? formatIDR(priceMin) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Rata-rata
                  </span>
                  <span className="overviewKeyValue__val">
                    {priceAvg > 0 ? formatIDR(priceAvg) : "—"}
                  </span>
                </div>
                <div className="overviewKeyValue__row">
                  <span className="overviewKeyValue__key">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginRight: "0.4rem", opacity: 0.6 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Max
                  </span>
                  <span className="overviewKeyValue__val">
                    {priceMax > 0 ? formatIDR(priceMax) : "—"}
                  </span>
                </div>
              </div>
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
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                    <button
                      type="button"
                      className="overviewActionBtn"
                      onClick={() => onSetActiveTab("customers")}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Kelola Customers
                    </button>
                    <button
                      type="button"
                      className="overviewActionBtn"
                      onClick={() => {
                        onToggleShow("showInventory");
                      }}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Inventory
                    </button>
                    <button
                      type="button"
                      className="overviewActionBtn overviewActionBtn--primary"
                      onClick={() => {
                        onToggleShow("showAnalytics");
                      }}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
                        <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Analytics
                    </button>
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
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => onExport("csv")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => onExport("json")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  className="btn-luxury"
                  onClick={() => onExport("pdf")}
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Export PDF
                </button>
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
            <button
              type="button"
              className="adminDashboard__actionBtn"
              onClick={() => onToggleShow("showNotifications")}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              className="adminDashboard__actionBtn adminDashboard__actionBtn--logout"
              onClick={onLogout}
              title="Keluar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
            <div
              className="adminDashboard__error"
              role="alert"
            >
              <p className="adminDashboard__errorTitle">
                Failed to load dashboard data
              </p>
              <p className="adminDashboard__errorText">{errorMessage}</p>
            </div>
          )}

          {!loading && !errorMessage && (
            <div className="adminDashboard__tabPanel" role="tabpanel">
              {renderMainContent()}
            </div>
          )}

          {loading && viewState.activeTab === "overview" && (
            <div className="adminOverview adminOverview--loading">
              <div className="adminOverview__stats">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  {[1, 2, 3, 4, 5, 6].map((i) => (
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
        actions={[
          {
            id: "new-order",
            label: "Order Baru",
            icon: "📦",
            onClick: () => onSetActiveTab("orders"),
            variant: "primary",
          },
          {
            id: "new-bouquet",
            label: "Tambah Bouquet",
            icon: "🌸",
            onClick: () => onSetActiveTab("upload"),
            variant: "primary",
          },
          {
            id: "view-customers",
            label: "Lihat Customers",
            icon: "👤",
            onClick: () => onSetActiveTab("customers"),
          },
          {
            id: "edit-bouquet",
            label: "Edit Bouquet",
            icon: "✏️",
            onClick: () => onSetActiveTab("edit"),
          },
          {
            id: "analytics",
            label: "Analytics",
            icon: "📊",
            onClick: () => onSetActiveTab("analytics"),
          },
          {
            id: "notifications",
            label: "Notifications",
            icon: "🔔",
            onClick: () => onToggleShow("showNotifications"),
          },
          {
            id: "inventory",
            label: "Inventory",
            icon: "📦",
            onClick: () => onToggleShow("showInventory"),
          },
          {
            id: "system-status",
            label: "System Status",
            icon: "⚙️",
            onClick: () => onToggleShow("showSystemStatus"),
          },
        ]}
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

/**
 * Dashboard Page View - Class Component
 * Refactored to use class component with SOLID principles
 * Separated into methods for better organization
 */

import React, { Component } from "react";
import "../styles/DashboardPage.css";
import type { ActiveTab } from "../models/dashboard-page-model";
import type { DashboardPageViewProps } from "./dashboard-page.types";
import TabNavigation from "../components/common/TabNavigation";
import AlertMessage from "../components/common/AlertMessage";
import IconButton from "../components/common/IconButton";
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
import { DASHBOARD_TABS } from "./dashboard-page.static";
import { SKELETON_COUNTS } from "./dashboard-page.constants";
import { DASHBOARD_STYLES } from "./dashboard-page.styles";
import BouquetUploader from "./sections/dashboard-uploader-section";
import BouquetEditorSection from "./sections/Bouquet-editor-section";
import HeroSliderEditorSection from "./sections/HeroSliderEditorSection";
import OrdersSection from "./sections/orders-section";
import CustomersSection from "./sections/customers-section";
import OverviewSection from "./sections/OverviewSection";
import NotificationsCenter from "../components/modals/NotificationsCenter";
import InventoryManager from "../components/modals/InventoryManager";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import QuickActionsPanel from "../components/modals/QuickActionsPanel";
import DashboardSearch from "../components/modals/DashboardSearch";
import ActivityLog from "../components/modals/ActivityLog";
import SystemStatus from "../components/modals/SystemStatus";
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
  private getIcon = (iconKey: string, props?: React.ComponentProps<any>): React.ReactNode => {
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
        icon: Icon ? <Icon {...DASHBOARD_STYLES.ICON_LARGE} /> : null,
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
   * Render metrics overview section
   * Refactored to use OverviewSection component (SOLID, DRY)
   */
  private renderMetrics = (): React.ReactNode => {
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
      <OverviewSection
        overviewMetrics={overviewMetrics}
        overviewText={overviewText}
        insightsError={insightsError}
        visitorsCount={visitorsCount}
        bouquets={bouquets}
        collectionsCount={collectionsCount}
        salesMetrics={salesMetrics}
        salesError={salesError}
        insights={insights}
        viewState={viewState}
        onSetActiveTab={onSetActiveTab}
        onCopyOverview={onCopyOverview}
        onReloadDashboard={onReloadDashboard}
        onToggleShow={onToggleShow}
        onExport={onExport}
      />
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
            icon={<NotificationIcon {...DASHBOARD_STYLES.ICON_HEADER} />}
          />
          <IconButton
            variant="ghost"
            size="md"
            onClick={onLogout}
            ariaLabel="Keluar"
            tooltip="Keluar"
            className="adminDashboard__actionBtn adminDashboard__actionBtn--logout"
            icon={<LogoutIcon {...DASHBOARD_STYLES.ICON_HEADER} />}
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


/**
 * Overview Header Section Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles overview header rendering
 */

import React, { Component } from "react";
import "../../styles/DashboardPage.css";
import QuickActionButton from "../../components/common/QuickActionButton";
import AlertMessage from "../../components/common/AlertMessage";
import { OVERVIEW_ACTIONS } from "../dashboard-page.static";
import { calculateLastUpdated, formatLastUpdatedLabel } from "../dashboard-page.helpers";
import type { ActiveTab } from "../../models/dashboard-page-model";
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

interface OverviewHeaderSectionProps {
  bouquets: Bouquet[];
  overviewText: string;
  copyStatus?: "" | "copied" | "failed" | null;
  onSetActiveTab: (tab: ActiveTab) => void;
  onCopyOverview: (text: string) => void;
  onReloadDashboard: () => void;
}

/**
 * Overview Header Section Component
 * Handles overview header with actions and copy status
 */
class OverviewHeaderSection extends Component<OverviewHeaderSectionProps> {
  /**
   * Render overview action buttons
   */
  private renderActions = (): React.ReactNode => {
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

  render(): React.ReactNode {
    const { bouquets, copyStatus } = this.props;

    const lastUpdatedMs = calculateLastUpdated(bouquets);
    const lastUpdatedLabel = formatLastUpdatedLabel(lastUpdatedMs);

    return (
      <>
        <div className="overviewHeader" aria-label="Ringkasan cepat">
          <div className="overviewHeader__meta">
            <p className="overviewHeader__title">Ringkasan cepat</p>
            <p className="overviewHeader__sub">
              Terakhir diperbarui: <b>{lastUpdatedLabel}</b>
            </p>
          </div>
          {this.renderActions()}
        </div>

        {(copyStatus === "copied" || copyStatus === "failed") && (
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
  }
}

export default OverviewHeaderSection;


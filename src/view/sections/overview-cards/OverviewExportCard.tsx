/**
 * Overview Export Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles export card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import LuxuryButton from "../../../components/buttons/LuxuryButton";
import { EXPORT_BUTTONS } from "../../dashboard-page.static";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import { ExportIcon } from "../../dashboard-page.icons";

interface OverviewExportCardProps {
  onExport: (format: "csv" | "json" | "pdf") => void;
}

/**
 * Overview Export Card Component
 * Handles export card rendering
 */
class OverviewExportCard extends Component<OverviewExportCardProps> {
  render(): React.ReactNode {
    const { onExport } = this.props;

    return (
      <div className="overviewCard" aria-label="Export analytics">
        <p className="overviewCard__title">
          <ExportIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
          Export Analytics
        </p>
        <div style={DASHBOARD_STYLES.EXPORT_BUTTONS_CONTAINER}>
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
      </div>
    );
  }
}

export default OverviewExportCard;


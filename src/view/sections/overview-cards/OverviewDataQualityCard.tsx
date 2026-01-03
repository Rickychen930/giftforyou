/**
 * Overview Data Quality Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles data quality card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { DATA_QUALITY_ITEMS } from "../../dashboard-page.static";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import { getOverviewMetricValue } from "../../dashboard-page.helpers";
import type { OverviewMetrics } from "../../../view/dashboard-page.types";
import {
  ImageIcon,
  CollectionGridIcon,
  InfoIcon,
} from "../../dashboard-page.icons";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  ImageIcon,
  CollectionGridIcon,
  InfoIcon,
};

interface OverviewDataQualityCardProps {
  overviewMetrics: OverviewMetrics;
}

/**
 * Overview Data Quality Card Component
 * Handles data quality card rendering
 */
class OverviewDataQualityCard extends Component<OverviewDataQualityCardProps> {
  render(): React.ReactNode {
    const { overviewMetrics } = this.props;

    return (
      <div className="overviewCard" aria-label="Kualitas data">
        <p className="overviewCard__title">Kualitas data</p>
        <ul className="overviewList" aria-label="Ringkasan kualitas data">
          {DATA_QUALITY_ITEMS.map((item) => {
            const value = getOverviewMetricValue(overviewMetrics, item.valueKey) as number;
            const warningValue = getOverviewMetricValue(overviewMetrics, item.warningKey) as number;
            const Icon = ICON_MAP[item.iconKey];
            const hasWarning = warningValue > 0;

            return (
              <li key={item.label} className={`overviewList__item ${hasWarning ? "overviewList__item--warning" : ""}`}>
                <span>
                  {Icon && <Icon {...DASHBOARD_STYLES.ICON_SMALL} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_SMALL_OPACITY_LOW} />}
                  {item.label}
                </span>
                <b>{value}</b>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default OverviewDataQualityCard;


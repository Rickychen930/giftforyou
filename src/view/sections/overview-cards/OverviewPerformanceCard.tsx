/**
 * Overview Performance Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles performance card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { formatMs, formatBytes } from "../../../utils/performance-monitor";
import { PERFORMANCE_METRICS } from "../../dashboard-page.static";
import { GRADE_LABELS } from "../../dashboard-page.constants-extended";
import { DASHBOARD_STYLES as STYLES } from "../../dashboard-page.styles";
import type { DashboardPageViewState } from "../../../models/dashboard-page-model";
import { PerformanceIcon } from "../../dashboard-page.icons";

interface OverviewPerformanceCardProps {
  viewState: DashboardPageViewState;
}

/**
 * Overview Performance Card Component
 * Handles performance card rendering
 */
class OverviewPerformanceCard extends Component<OverviewPerformanceCardProps> {
  /**
   * Render performance metrics
   */
  private renderPerformanceMetrics = (): React.ReactNode => {
    const { viewState } = this.props;
    const { performance } = viewState;

    if (performance.loading) {
      return <p className="overviewCard__empty">Memuat metrik performa...</p>;
    }

    return (
      <div className="overviewKeyValue" style={STYLES.MARGIN_TOP}>
        {PERFORMANCE_METRICS.map((metric) => {
          const value = performance.metrics[metric.valueKey as keyof typeof performance.metrics];
          if (value === undefined) return null;

          const status = metric.statusKey ? performance.score.details[metric.statusKey as keyof typeof performance.score.details] : undefined;
          const formattedValue = metric.format === "ms" 
            ? formatMs(value as number) 
            : metric.format === "bytes" 
              ? `${performance.metrics.totalResources} (${formatBytes(performance.metrics.totalSize || 0)})` 
              : (value as number).toFixed(3);

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

  render(): React.ReactNode {
    const { viewState } = this.props;
    const { performance } = viewState;

    return (
      <div className="overviewCard overviewCard--performance" aria-label="Performance metrics">
        <p className="overviewCard__title">
          <PerformanceIcon {...STYLES.ICON_MEDIUM} style={STYLES.ICON_WITH_MARGIN_OPACITY} />
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
                {GRADE_LABELS[performance.score.grade] || performance.score.grade}
              </div>
            </div>
            {this.renderPerformanceMetrics()}
          </>
        )}
      </div>
    );
  }
}

export default OverviewPerformanceCard;


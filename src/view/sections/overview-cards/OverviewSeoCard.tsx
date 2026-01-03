/**
 * Overview SEO Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles SEO card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { DASHBOARD_LIMITS, GRADE_LABELS, SEO_STATUS_ICONS, TREND_ARROWS } from "../../dashboard-page.constants-extended";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import type { DashboardPageViewState } from "../../../models/dashboard-page-model";
import { SeoIcon } from "../../dashboard-page.icons";

interface OverviewSeoCardProps {
  viewState: DashboardPageViewState;
}

/**
 * Overview SEO Card Component
 * Handles SEO card rendering
 */
class OverviewSeoCard extends Component<OverviewSeoCardProps> {
  render(): React.ReactNode {
    const { viewState } = this.props;
    const { seo } = viewState;

    return (
      <div className="overviewCard overviewCard--seo" aria-label="SEO analysis">
        <p className="overviewCard__title">
          <SeoIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={DASHBOARD_STYLES.ICON_WITH_MARGIN_OPACITY} />
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
                {GRADE_LABELS[seo.analysis.grade] || seo.analysis.grade}
              </div>
            </div>

            <div className="overviewSeoChecks" style={DASHBOARD_STYLES.SEO_CHECKS_CONTAINER}>
              {seo.analysis.checks.slice(0, DASHBOARD_LIMITS.SEO_CHECKS).map((check, idx) => (
                <div key={idx} className={`overviewSeoCheck overviewSeoCheck--${check.status}`}>
                  <span className="overviewSeoCheck__icon">
                    {SEO_STATUS_ICONS[check.status] || ""}
                  </span>
                  <div className="overviewSeoCheck__content">
                    <span className="overviewSeoCheck__name">{check.name}</span>
                    <span className="overviewSeoCheck__message">{check.message}</span>
                  </div>
                </div>
              ))}
            </div>

            {seo.analysis.recommendations.length > 0 && (
              <div className="overviewSeoRecommendations" style={DASHBOARD_STYLES.RECOMMENDATIONS_CONTAINER}>
                <p style={DASHBOARD_STYLES.RECOMMENDATIONS_TITLE}>Rekomendasi:</p>
                <ul style={DASHBOARD_STYLES.RECOMMENDATIONS_LIST}>
                  {seo.analysis.recommendations.slice(0, DASHBOARD_LIMITS.SEO_RECOMMENDATIONS).map((rec, idx) => (
                    <li key={idx} style={DASHBOARD_STYLES.RECOMMENDATIONS_ITEM}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {seo.trends && (
              <div style={DASHBOARD_STYLES.TRENDS_CONTAINER}>
                <p style={DASHBOARD_STYLES.TRENDS_TITLE}>Trends (30 days):</p>
                {seo.trends.score && (
                  <div style={DASHBOARD_STYLES.TRENDS_ITEM}>
                    <span style={DASHBOARD_STYLES.TRENDS_LABEL}>Score: </span>
                    <span className={seo.trends.score.trend === "up" ? "overviewKeyValue__val--good" : ""}>
                      {seo.trends.score.changePercent.toFixed(1)}% {TREND_ARROWS[seo.trends.score.trend] || ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default OverviewSeoCard;


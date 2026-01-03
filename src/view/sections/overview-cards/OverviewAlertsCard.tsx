/**
 * Overview Alerts Card Component
 * OOP-based class component following SOLID principles
 * Single Responsibility: Only handles alerts card rendering
 */

import React, { Component } from "react";
import "../../../styles/DashboardPage.css";
import { DASHBOARD_LIMITS } from "../../dashboard-page.constants-extended";
import { DASHBOARD_STYLES } from "../../dashboard-page.styles";
import type { DashboardPageViewState } from "../../../models/dashboard-page-model";
import { AlertIcon } from "../../dashboard-page.icons";

interface OverviewAlertsCardProps {
  viewState: DashboardPageViewState;
}

/**
 * Overview Alerts Card Component
 * Handles alerts card rendering
 */
class OverviewAlertsCard extends Component<OverviewAlertsCardProps> {
  render(): React.ReactNode {
    const { viewState } = this.props;
    const { alerts } = viewState;

    if (!alerts.showAlerts || alerts.alerts.length === 0) return null;

    return (
      <div className="overviewCard overviewCard--alerts" aria-label="Alerts">
        <p className="overviewCard__title">
          <AlertIcon {...DASHBOARD_STYLES.ICON_MEDIUM} style={{ ...DASHBOARD_STYLES.ICON_MARGIN, ...DASHBOARD_STYLES.ICON_OPACITY }} />
          Alerts ({alerts.alerts.length})
        </p>
        <div className="overviewAlerts" style={DASHBOARD_STYLES.ALERTS_CONTAINER}>
          {alerts.alerts.slice(0, DASHBOARD_LIMITS.ALERTS_DISPLAY).map((alert) => (
            <div key={alert.id} className={`overviewAlert overviewAlert--${alert.severity}`}>
              <div className="overviewAlert__content">
                <span className="overviewAlert__title">{alert.title}</span>
                <span className="overviewAlert__message">{alert.message}</span>
              </div>
            </div>
          ))}
          {alerts.alerts.length > DASHBOARD_LIMITS.ALERTS_DISPLAY && (
            <p style={DASHBOARD_STYLES.ALERT_MORE_TEXT}>
              +{alerts.alerts.length - DASHBOARD_LIMITS.ALERTS_DISPLAY} more alerts
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default OverviewAlertsCard;


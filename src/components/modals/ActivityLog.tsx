/**
 * Activity Log Component (OOP)
 * Class-based component extending BaseModal
 */

import React from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/ActivityLog.css";

interface ActivityItem {
  id: string;
  type: "order" | "customer" | "bouquet" | "system" | "user";
  action: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityLogProps extends Omit<BaseModalProps, "title" | "children"> {
  // No additional props needed
}

interface ActivityLogState extends BaseModalState {
  activities: ActivityItem[];
  isLoading: boolean;
}

/**
 * Activity Log Component
 * Class-based component extending BaseModal
 */
class ActivityLog extends BaseModal<ActivityLogProps, ActivityLogState> {
  protected baseClass: string = "activityLog";

  constructor(props: ActivityLogProps) {
    super(props);
    this.state = {
      ...this.state,
      activities: [],
      isLoading: true,
    };
  }

  componentDidUpdate(prevProps: ActivityLogProps): void {
    super.componentDidUpdate(prevProps);
    if (this.props.isOpen && !prevProps.isOpen) {
      this.loadActivities();
    }
  }

  private loadActivities = async (): Promise<void> => {
    this.setState({ isLoading: true });
    // TODO: Fetch from API
    // For now, use mock data
    const mockActivities: ActivityItem[] = [
      {
        id: "1",
        type: "order",
        action: "created",
        description: "Order baru dibuat oleh customer",
        timestamp: new Date(),
        user: "Admin",
      },
      {
        id: "2",
        type: "bouquet",
        action: "updated",
        description: "Bouquet 'Rose Garden' diperbarui",
        timestamp: new Date(Date.now() - 3600000),
        user: "Admin",
      },
    ];
    this.setState({ activities: mockActivities, isLoading: false });
  };

  private formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString("id-ID");
  }

  private getTypeIcon(type: ActivityItem["type"]): string {
    switch (type) {
      case "order":
        return "📦";
      case "customer":
        return "👤";
      case "bouquet":
        return "🌸";
      case "system":
        return "⚙️";
      case "user":
        return "🔐";
      default:
        return "📝";
    }
  }

  private renderActivityItem(activity: ActivityItem): React.ReactNode {
    return (
      <div key={activity.id} className={`${this.baseClass}__item`}>
        <div className={`${this.baseClass}__itemIcon ${this.baseClass}__itemIcon--${activity.type}`}>
          {this.getTypeIcon(activity.type)}
        </div>
        <div className={`${this.baseClass}__itemContent`}>
          <div className={`${this.baseClass}__itemHeader`}>
            <span className={`${this.baseClass}__itemAction`}>{activity.action}</span>
            <span className={`${this.baseClass}__itemTime`}>{this.formatTime(activity.timestamp)}</span>
          </div>
          <p className={`${this.baseClass}__itemDescription`}>{activity.description}</p>
          {activity.user && (
            <span className={`${this.baseClass}__itemUser`}>oleh {activity.user}</span>
          )}
        </div>
      </div>
    );
  }

  protected renderHeader(): React.ReactNode {
    return (
      <div className={`${this.baseClass}__header`}>
        <h3 className={`${this.baseClass}__title`}>Activity Log</h3>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup Activity Log"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  protected renderBody(): React.ReactNode {
    const { activities, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className={`${this.baseClass}__loading`}>
          <svg
            className={`${this.baseClass}__spinner`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <span>Memuat aktivitas...</span>
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <div className={`${this.baseClass}__empty`}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p>Belum ada aktivitas</p>
        </div>
      );
    }

    return (
      <div className={`${this.baseClass}__content`}>
        <div className={`${this.baseClass}__list`}>
          {activities.map((activity) => this.renderActivityItem(activity))}
        </div>
      </div>
    );
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer needed
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isVisible } = this.state;

    if (!isOpen && !isVisible) return null;

    return (
      <>
        <div
          className="activityLogOverlay"
          onClick={this.handleOverlayClick}
          aria-hidden="true"
        />
        <div className={this.baseClass}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </>
    );
  }
}

export default ActivityLog;


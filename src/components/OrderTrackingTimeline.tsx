/**
 * Order Tracking Timeline Component
 * Displays order activity history in a beautiful timeline format
 */

import React, { useMemo } from "react";
import type { OrderActivity } from "../services/customer.service";
import "../styles/OrderTrackingTimeline.css";

interface OrderTrackingTimelineProps {
  activities?: OrderActivity[];
  createdAt?: string;
  orderStatus?: string;
}

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  activities = [],
  createdAt,
  orderStatus,
}) => {
  // Combine created date with activities and sort by date
  const timelineItems = useMemo(() => {
    const items: Array<OrderActivity & { isCreated?: boolean }> = [];

    // Add created activity if createdAt exists
    if (createdAt) {
      items.push({
        at: createdAt,
        kind: "created",
        message: "Pesanan dibuat",
        isCreated: true,
      });
    }

    // Add other activities
    if (activities && activities.length > 0) {
      items.push(...activities);
    }

    // Sort by date (oldest first) with validation
    return items
      .filter((item) => {
        if (!item || !item.at || typeof item.at !== "string") return false;
        try {
          const date = new Date(item.at);
          return Number.isFinite(date.getTime());
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.at).getTime();
          const dateB = new Date(b.at).getTime();
          if (!Number.isFinite(dateA) || !Number.isFinite(dateB)) return 0;
          return dateA - dateB; // Oldest first
        } catch {
          return 0;
        }
      });
  }, [activities, createdAt]);

  const getActivityIcon = (kind: string) => {
    switch (kind) {
      case "created":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case "status":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "payment":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
            <path d="M1 10h22" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "delivery":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
            <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "bouquet":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getActivityColor = (kind: string) => {
    switch (kind) {
      case "created":
        return "timeline__icon--created";
      case "status":
        return "timeline__icon--status";
      case "payment":
        return "timeline__icon--payment";
      case "delivery":
        return "timeline__icon--delivery";
      case "bouquet":
        return "timeline__icon--bouquet";
      default:
        return "timeline__icon--default";
    }
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString || typeof dateString !== "string" || dateString.trim() === "") {
      return "-";
    }
    try {
      const date = new Date(dateString);
      if (!Number.isFinite(date.getTime())) {
        return dateString;
      }
      
      const now = new Date();
      if (!Number.isFinite(now.getTime())) {
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      
      const diffMs = now.getTime() - date.getTime();
      if (!Number.isFinite(diffMs) || diffMs < 0) {
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays < 7) return `${diffDays} hari yang lalu`;

      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString || "-";
    }
  };

  if (timelineItems.length === 0) {
    return (
      <div className="timeline timeline--empty">
        <p className="timeline__emptyText">Belum ada aktivitas pesanan</p>
      </div>
    );
  }

  return (
    <div className="timeline">
      <div className="timeline__line"></div>
      {timelineItems.map((activity, index) => {
        const isLast = index === timelineItems.length - 1;
        const isActive = isLast && orderStatus !== "terkirim";

        return (
          <div key={`${activity.at}-${index}`} className={`timeline__item ${isActive ? "timeline__item--active" : ""}`}>
            <div className={`timeline__icon ${getActivityColor(activity.kind)}`}>
              {getActivityIcon(activity.kind)}
            </div>
            <div className="timeline__content">
              <p className="timeline__message">{activity.message}</p>
              <span className="timeline__time">{formatDateTime(activity.at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTrackingTimeline;


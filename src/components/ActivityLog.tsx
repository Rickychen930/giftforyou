import React, { useState, useEffect } from "react";
import "../styles/ActivityLog.css";

interface ActivityItem {
  id: string;
  type: "order" | "customer" | "bouquet" | "system" | "user";
  action: string;
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityLogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen]);

  const loadActivities = async () => {
    setIsLoading(true);
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
    setActivities(mockActivities);
    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
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
  };

  const getTypeIcon = (type: ActivityItem["type"]) => {
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
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="activityLogOverlay" onClick={onClose} aria-hidden="true" />
      <div className="activityLog">
        <div className="activityLog__header">
          <h3 className="activityLog__title">Activity Log</h3>
          <button
            type="button"
            className="activityLog__close"
            onClick={onClose}
            aria-label="Tutup Activity Log"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="activityLog__content">
          {isLoading ? (
            <div className="activityLog__loading">
              <svg className="activityLog__spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              <span>Memuat aktivitas...</span>
            </div>
          ) : activities.length > 0 ? (
            <div className="activityLog__list">
              {activities.map((activity) => (
                <div key={activity.id} className="activityLog__item">
                  <div className={`activityLog__itemIcon activityLog__itemIcon--${activity.type}`}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="activityLog__itemContent">
                    <div className="activityLog__itemHeader">
                      <span className="activityLog__itemAction">{activity.action}</span>
                      <span className="activityLog__itemTime">{formatTime(activity.timestamp)}</span>
                    </div>
                    <p className="activityLog__itemDescription">{activity.description}</p>
                    {activity.user && (
                      <span className="activityLog__itemUser">oleh {activity.user}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activityLog__empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <p>Belum ada aktivitas</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityLog;


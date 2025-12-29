import React from "react";
import "../../styles/common/StatusBadge.css";

export type StatusBadgeType = "ready" | "preorder" | "featured" | "new" | "limited";

export interface StatusBadgeProps {
  type: StatusBadgeType;
  label?: string;
  count?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  label,
  count,
  className = "",
  size = "md",
}) => {
  const getLabel = () => {
    if (label) return label;
    switch (type) {
      case "ready":
        return "Siap";
      case "preorder":
        return "Preorder";
      case "featured":
        return "Featured";
      case "new":
        return "Baru";
      case "limited":
        return count ? `${count} tersedia` : "Terbatas";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "ready":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "preorder":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "featured":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "new":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "limited":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <span
      className={`status-badge status-badge--${type} status-badge--${size} ${className}`}
      role="status"
      aria-label={getLabel()}
    >
      {getIcon()}
      <span className="status-badge__text">{getLabel()}</span>
    </span>
  );
};

export default StatusBadge;


/**
 * Metric Card Component
 * Luxury and responsive metric card for dashboard
 */

import React from "react";
import "../../styles/MetricCard.css";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "info" | "success" | "warning" | "featured" | "revenue" | "orders" | "customers" | "pending" | "visits" | "bouquets" | "collections";
  className?: string;
  ariaLabel?: string;
}

/**
 * Metric Card Component
 * Luxury styled metric card
 */
const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  note,
  icon,
  variant = "primary",
  className = "",
  ariaLabel,
}) => {
  return (
    <div
      className={`metricCard metricCard--${variant} ${className}`}
      role="region"
      aria-label={ariaLabel || label}
    >
      {icon && (
        <div className="metricCard__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="metricCard__content">
        <p className="metricCard__label">{label}</p>
        <p className="metricCard__value" aria-label={`${label}: ${value}`}>
          {value}
        </p>
        {note && <p className="metricCard__note">{note}</p>}
      </div>
    </div>
  );
};

export default MetricCard;


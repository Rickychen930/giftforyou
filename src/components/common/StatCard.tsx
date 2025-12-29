/**
 * Stat Card Component
 * Luxury and responsive statistics card
 */

import React from "react";
import LuxuryTooltip from "../LuxuryTooltip";
import "../../styles/StatCard.css";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  iconVariant?: "orders" | "pending" | "completed" | "favorites" | "default";
  className?: string;
}

/**
 * Stat Card Component
 * Luxury styled statistics card with icon and tooltip
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  tooltip,
  iconVariant = "default",
  className = "",
}) => {
  const cardContent = (
    <div className={`statCard ${className}`}>
      <div className={`statCard__icon statCard__icon--${iconVariant}`}>
        {icon}
      </div>
      <div className="statCard__content">
        <p className="statCard__label">{label}</p>
        <p className="statCard__value">{value}</p>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <LuxuryTooltip content={tooltip} position="top">
        {cardContent}
      </LuxuryTooltip>
    );
  }

  return cardContent;
};

export default StatCard;


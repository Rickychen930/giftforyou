/**
 * Summary Card Component
 * Luxury and responsive summary card for displaying key-value pairs
 */

import React from "react";
import "../../styles/SummaryCard.css";

interface SummaryItem {
  label: string;
  value: React.ReactNode;
  isTotal?: boolean;
  isNested?: boolean;
}

interface SummaryCardProps {
  title?: string;
  titleIcon?: React.ReactNode;
  items: SummaryItem[];
  className?: string;
}

/**
 * Summary Card Component
 * Luxury styled summary card for displaying information
 */
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  titleIcon,
  items,
  className = "",
}) => {
  return (
    <div className={`summaryCard ${className}`}>
      {title && (
        <h2 className="summaryCard__title">
          {titleIcon && <span className="summaryCard__titleIcon">{titleIcon}</span>}
          {title}
        </h2>
      )}
      <div className="summaryCard__content">
        {items.map((item, index) => (
          <div
            key={index}
            className={`summaryCard__item ${
              item.isTotal ? "summaryCard__item--total" : ""
            } ${item.isNested ? "summaryCard__item--nested" : ""}`}
          >
            <span className="summaryCard__label">{item.label}</span>
            <span className="summaryCard__value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;


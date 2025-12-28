import React from "react";
import "../styles/UrgencyIndicator.css";

interface UrgencyIndicatorProps {
  type: "limited-stock" | "same-day" | "preorder";
  stockCount?: number;
  deadlineTime?: string; // e.g., "14:00"
  className?: string;
}

const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({
  type,
  stockCount,
  deadlineTime = "14:00",
  className = "",
}) => {
  const getContent = () => {
    switch (type) {
      case "limited-stock":
        if (stockCount !== undefined && stockCount > 0) {
          return {
            icon: "⚠️",
            text: stockCount <= 3 ? `Hanya tersisa ${stockCount} pcs!` : `Stok terbatas (${stockCount} pcs)`,
            urgency: stockCount <= 3 ? "high" : "medium",
          };
        }
        return {
          icon: "⚠️",
          text: "Stok terbatas!",
          urgency: "medium",
        };

      case "same-day":
        return {
          icon: "⚡",
          text: `Order sebelum ${deadlineTime} untuk same-day delivery`,
          urgency: "high",
        };

      case "preorder":
        return {
          icon: "📅",
          text: "Pre-order - Pesan minimal 3 hari sebelumnya",
          urgency: "low",
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div
      className={`urgencyIndicator urgencyIndicator--${content.urgency} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <span className="urgencyIndicator__icon" aria-hidden="true">
        {content.icon}
      </span>
      <span className="urgencyIndicator__text">{content.text}</span>
    </div>
  );
};

export default UrgencyIndicator;


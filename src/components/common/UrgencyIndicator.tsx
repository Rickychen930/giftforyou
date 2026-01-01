/**
 * Urgency Indicator Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/UrgencyIndicator.css";

interface UrgencyIndicatorProps {
  type: "limited-stock" | "same-day" | "preorder";
  stockCount?: number;
  deadlineTime?: string; // e.g., "14:00"
  className?: string;
}

interface UrgencyIndicatorState {
  // No state needed, but keeping for consistency
}

/**
 * Urgency Indicator Component
 * Class-based component for urgency indicators
 */
class UrgencyIndicator extends Component<UrgencyIndicatorProps, UrgencyIndicatorState> {
  private baseClass: string = "urgencyIndicator";

  private getContent(): { icon: string; text: string; urgency: "high" | "medium" | "low" } | null {
    const { type, stockCount, deadlineTime = "14:00" } = this.props;

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
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    const content = this.getContent();
    if (!content) return className;

    return `${this.baseClass} ${this.baseClass}--${content.urgency} ${className}`.trim();
  }

  render(): React.ReactNode {
    const content = this.getContent();
    if (!content) return null;

    return (
      <div className={this.getClasses()} role="alert" aria-live="polite">
        <span className={`${this.baseClass}__icon`} aria-hidden="true">
          {content.icon}
        </span>
        <span className={`${this.baseClass}__text`}>{content.text}</span>
      </div>
    );
  }
}

export default UrgencyIndicator;


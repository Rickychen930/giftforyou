/**
 * Metric Card Component (OOP)
 * Extends BaseCard following SOLID principles
 */

import React from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import "../../styles/MetricCard.css";

interface MetricCardProps extends BaseCardProps {
  label: string;
  value: React.ReactNode;
  note?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "info" | "success" | "warning" | "featured" | "revenue" | "orders" | "customers" | "pending" | "visits" | "bouquets" | "collections";
  ariaLabel?: string;
}

interface MetricCardState {
  isHovered: boolean;
}

/**
 * Metric Card Component
 * Class-based component extending BaseCard
 */
class MetricCard extends BaseCard<MetricCardProps, MetricCardState> {
  protected baseClass: string = "metricCard";

  constructor(props: MetricCardProps) {
    super(props);
  }

  protected getClasses(): string {
    const { variant = "primary", className = "" } = this.props;
    const variantClass = `${this.baseClass}--${variant}`;
    const hoverClass = this.state.isHovered ? `${this.baseClass}--hovered` : "";
    return `${this.baseClass} ${variantClass} ${hoverClass} ${className}`.trim();
  }

  protected renderContent(): React.ReactNode {
    const { label, value, note, icon, ariaLabel } = this.props;

    return (
      <>
        {icon && (
          <div className={`${this.baseClass}__icon`} aria-hidden="true">
            {icon}
          </div>
        )}
        <div className={`${this.baseClass}__content`}>
          <p className={`${this.baseClass}__label`}>{label}</p>
          <p className={`${this.baseClass}__value`} aria-label={`${label}: ${value}`}>
            {value}
          </p>
          {note && <p className={`${this.baseClass}__note`}>{note}</p>}
        </div>
      </>
    );
  }

  render(): React.ReactNode {
    const { ariaLabel, label } = this.props;

    return (
      <div
        className={this.getClasses()}
        role="region"
        aria-label={ariaLabel || label}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderContent()}
      </div>
    );
  }
}

export default MetricCard;


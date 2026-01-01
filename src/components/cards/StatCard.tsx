/**
 * Stat Card Component (OOP)
 * Extends BaseCard following SOLID principles
 */

import React from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import LuxuryTooltip from "../LuxuryTooltip";
import "../../styles/StatCard.css";

interface StatCardProps extends BaseCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  iconVariant?: "orders" | "pending" | "completed" | "favorites" | "default";
}

interface StatCardState {
  isHovered: boolean;
}

/**
 * Stat Card Component
 * Class-based component extending BaseCard
 */
class StatCard extends BaseCard<StatCardProps, StatCardState> {
  protected baseClass: string = "statCard";

  constructor(props: StatCardProps) {
    super(props);
  }

  protected getClasses(): string {
    const { iconVariant = "default", className = "" } = this.props;
    const iconVariantClass = `${this.baseClass}__icon--${iconVariant}`;
    const hoverClass = this.state.isHovered ? `${this.baseClass}--hovered` : "";
    return `${this.baseClass} ${hoverClass} ${className}`.trim();
  }

  protected renderContent(): React.ReactNode {
    const { icon, label, value, iconVariant = "default" } = this.props;

    return (
      <>
        <div className={`${this.baseClass}__icon ${this.baseClass}__icon--${iconVariant}`}>
          {icon}
        </div>
        <div className={`${this.baseClass}__content`}>
          <p className={`${this.baseClass}__label`}>{label}</p>
          <p className={`${this.baseClass}__value`}>{value}</p>
        </div>
      </>
    );
  }

  render(): React.ReactNode {
    const { tooltip } = this.props;
    const cardContent = (
      <div
        className={this.getClasses()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderContent()}
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
  }
}

export default StatCard;


/**
 * Stat Card Component (OOP)
 * Extends BaseCard following SOLID principles
 */

import React from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import LuxuryTooltip from "../common/LuxuryTooltip";
import "../../styles/StatCard.css";

interface StatCardProps extends BaseCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  iconVariant?: "orders" | "pending" | "completed" | "favorites" | "default";
}

// Set default BaseCard props for StatCard
const defaultStatCardProps: Partial<BaseCardProps> = {
  variant: "glass",
  padding: "md",
  shadow: "md",
  hoverable: true,
};

interface StatCardState {
  isHovered: boolean;
  isPressed: boolean;
}

/**
 * Stat Card Component
 * Class-based component extending BaseCard
 */
class StatCard extends BaseCard<StatCardProps, StatCardState> {
  protected baseClass: string = "statCard";

  constructor(props: StatCardProps) {
    super({
      ...defaultStatCardProps,
      ...props,
    } as StatCardProps);
  }

  protected getClasses(): string {
    const { className = "" } = this.props;
    
    // Use BaseCard's getClasses and add StatCard specific classes
    const baseClasses = super.getClasses();
    const hoverClass = this.state.isHovered ? `${this.baseClass}--hovered` : "";
    
    return `${baseClasses} ${this.baseClass} ${hoverClass} ${className}`.trim();
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
    const { tooltip, ariaLabel } = this.props;
    const cardAttrs = this.getCardAttributes();
    
    const cardContent = (
      <div
        {...cardAttrs}
        className={this.getClasses()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        aria-label={ariaLabel}
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


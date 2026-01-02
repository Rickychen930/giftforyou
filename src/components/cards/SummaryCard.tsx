/**
 * Summary Card Component (OOP)
 * Extends BaseCard following SOLID principles
 */

import React from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import "../../styles/SummaryCard.css";

export interface SummaryItem {
  label: string;
  value: React.ReactNode;
  isTotal?: boolean;
  isNested?: boolean;
}

interface SummaryCardProps extends BaseCardProps {
  title?: string;
  titleIcon?: React.ReactNode;
  items: SummaryItem[];
}

interface SummaryCardState {
  isHovered: boolean;
  isPressed: boolean;
}

// Set default BaseCard props for SummaryCard
const defaultSummaryCardProps: Partial<BaseCardProps> = {
  variant: "glass",
  padding: "lg",
  shadow: "md",
  hoverable: true,
};

/**
 * Summary Card Component
 * Class-based component extending BaseCard
 * Enhanced with BaseCard luxury variants
 */
class SummaryCard extends BaseCard<SummaryCardProps, SummaryCardState> {
  protected baseClass: string = "summaryCard";

  constructor(props: SummaryCardProps) {
    super({
      ...defaultSummaryCardProps,
      ...props,
    } as SummaryCardProps);
  }

  protected getClasses(): string {
    const { className = "" } = this.props;
    
    // Use BaseCard's getClasses and add SummaryCard specific classes
    const baseClasses = super.getClasses();
    const hoverClass = this.state.isHovered ? `${this.baseClass}--hovered` : "";
    
    return `${baseClasses} ${this.baseClass} ${hoverClass} ${className}`.trim();
  }


  protected renderHeader(): React.ReactNode {
    const { title, titleIcon } = this.props;
    if (!title) return null;

    return (
      <h2 className={`${this.baseClass}__title`}>
        {titleIcon && <span className={`${this.baseClass}__titleIcon`}>{titleIcon}</span>}
        {title}
      </h2>
    );
  }

  protected renderContent(): React.ReactNode {
    const { items } = this.props;

    return (
      <div className={`${this.baseClass}__content`}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`${this.baseClass}__item ${
              item.isTotal ? `${this.baseClass}__item--total` : ""
            } ${item.isNested ? `${this.baseClass}__item--nested` : ""}`}
          >
            <span className={`${this.baseClass}__label`}>{item.label}</span>
            <span className={`${this.baseClass}__value`}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  render(): React.ReactNode {
    const { ariaLabel } = this.props;
    const cardAttrs = this.getCardAttributes();

    return (
      <div
        {...cardAttrs}
        className={this.getClasses()}
        aria-label={ariaLabel}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }
}

export default SummaryCard;


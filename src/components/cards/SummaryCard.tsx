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
}

/**
 * Summary Card Component
 * Class-based component extending BaseCard
 */
class SummaryCard extends BaseCard<SummaryCardProps, SummaryCardState> {
  protected baseClass: string = "summaryCard";

  constructor(props: SummaryCardProps) {
    super(props);
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
    return (
      <div
        className={this.getClasses()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }
}

export default SummaryCard;


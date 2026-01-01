/**
 * Detail Card Component (OOP)
 * Class-based component following SOLID principles
 * Reusable card component for detail views with title and content
 */

import React, { Component } from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import "../../styles/DetailCard.css";

export interface DetailCardProps extends BaseCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}

interface DetailCardState {
  isHovered: boolean;
}

/**
 * Detail Card Component
 * Class-based component extending BaseCard for detail views
 */
class DetailCard extends BaseCard<DetailCardProps, DetailCardState> {
  protected baseClass: string = "detailCard";

  protected renderHeader(): React.ReactNode {
    const { title, titleIcon } = this.props;
    
    return (
      <h3 className={`${this.baseClass}__title`}>
        {titleIcon && <span className={`${this.baseClass}__titleIcon`}>{titleIcon}</span>}
        {title}
      </h3>
    );
  }

  protected renderContent(): React.ReactNode {
    const { children } = this.props;
    return <div className={`${this.baseClass}__content`}>{children}</div>;
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

export default DetailCard;


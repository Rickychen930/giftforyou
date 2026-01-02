/**
 * Detail Card Component (OOP)
 * Class-based component following SOLID principles
 * Reusable card component for detail views with title and content
 * Enhanced with BaseCard luxury variants
 */

import React, { Component } from "react";
import { BaseCard, BaseCardProps, CardVariant } from "../base/BaseCard";
import "../../styles/DetailCard.css";

export interface DetailCardProps extends BaseCardProps {
  title: string;
  titleIcon?: React.ReactNode;
  children: React.ReactNode;
}

interface DetailCardState {
  isHovered: boolean;
  isPressed: boolean;
}

/**
 * Detail Card Component
 * Class-based component extending BaseCard for detail views
 * Uses glass morphism variant by default for luxury feel
 */
class DetailCard extends BaseCard<DetailCardProps, DetailCardState> {
  protected baseClass: string = "detailCard";

  /**
   * Get default variant for DetailCard (glass morphism)
   */
  private getDefaultVariant(): CardVariant {
    return this.props.variant || "glass";
  }

  /**
   * Override getClasses to use glass variant by default
   */
  protected getClasses(): string {
    const { 
      className = "", 
      padding = "lg",
      shadow = "md",
      hoverable = true,
      interactive = false
    } = this.props;
    
    const variant = this.getDefaultVariant();
    const hoverClass = this.state.isHovered && hoverable ? `${this.baseClass}--hovered` : "";
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const variantClass = `${this.baseClass}--${variant}`;
    const paddingClass = `${this.baseClass}--padding-${padding}`;
    const shadowClass = shadow !== "none" ? `${this.baseClass}--shadow-${shadow}` : "";
    const interactiveClass = interactive ? `${this.baseClass}--interactive` : "";
    
    // Combine with DetailCard specific classes
    return `${this.baseClass} ${variantClass} ${paddingClass} ${shadowClass} ${hoverClass} ${pressedClass} ${interactiveClass} ${className}`.trim();
  }

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
    const cardAttrs = this.getCardAttributes();
    
    return (
      <div
        {...cardAttrs}
        className={this.getClasses()}
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

export default DetailCard;


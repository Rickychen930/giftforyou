/**
 * Base Card Component (Abstract)
 * OOP Base Class for all card components
 * Follows SOLID principles
 * Enhanced with luxury variants and responsive design
 */

import React, { Component } from "react";
import "../../styles/base/BaseCard.css";

export type CardVariant = "default" | "glass" | "elevated" | "outlined" | "gradient";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardShadow = "none" | "sm" | "md" | "lg" | "xl" | "brand";

export interface BaseCardProps {
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  shadow?: CardShadow;
  hoverable?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export interface BaseCardState {
  isHovered: boolean;
  isPressed: boolean;
}

/**
 * Abstract Base Card Class
 * All card components should extend this class
 * Enhanced with luxury styling variants
 */
export abstract class BaseCard<P extends BaseCardProps = BaseCardProps, S extends BaseCardState = BaseCardState>
  extends Component<P, S> {
  
  protected baseClass: string = "baseCard";

  constructor(props: P) {
    super(props);
    this.state = {
      isHovered: false,
      isPressed: false,
    } as S;
  }

  /**
   * Get CSS classes for the card
   * Override in child classes for custom styling
   */
  protected getClasses(): string {
    const { 
      className = "", 
      variant = "default",
      padding = "md",
      shadow = "md",
      hoverable = true,
      interactive = false
    } = this.props;
    
    const hoverClass = this.state.isHovered && hoverable ? `${this.baseClass}--hovered` : "";
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const variantClass = `${this.baseClass}--${variant}`;
    const paddingClass = `${this.baseClass}--padding-${padding}`;
    const shadowClass = shadow !== "none" ? `${this.baseClass}--shadow-${shadow}` : "";
    const interactiveClass = interactive ? `${this.baseClass}--interactive` : "";
    
    return `${this.baseClass} ${variantClass} ${paddingClass} ${shadowClass} ${hoverClass} ${pressedClass} ${interactiveClass} ${className}`.trim();
  }

  /**
   * Handle hover events
   */
  protected handleMouseEnter = (): void => {
    const { hoverable = true } = this.props;
    if (hoverable) {
      this.setState({ isHovered: true });
    }
  };

  protected handleMouseLeave = (): void => {
    this.setState({ isHovered: false, isPressed: false });
  };

  /**
   * Handle press events for interactive cards
   */
  protected handleMouseDown = (): void => {
    const { interactive = false } = this.props;
    if (interactive) {
      this.setState({ isPressed: true });
    }
  };

  protected handleMouseUp = (): void => {
    this.setState({ isPressed: false });
  };

  /**
   * Handle click events
   */
  protected handleClick = (): void => {
    const { onClick, interactive = false } = this.props;
    if (interactive && onClick) {
      onClick();
    }
  };

  /**
   * Get card attributes for accessibility and interaction
   */
  protected getCardAttributes(): React.HTMLAttributes<HTMLDivElement> {
    const { ariaLabel, interactive = false, onClick } = this.props;
    const attrs: React.HTMLAttributes<HTMLDivElement> = {
      "aria-label": ariaLabel,
    };

    if (interactive) {
      attrs.role = "button";
      attrs.tabIndex = 0;
      attrs.onClick = onClick || this.handleClick;
      attrs.onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onClick) onClick();
        }
      };
    }

    return attrs;
  }

  /**
   * Render card header (optional)
   * Override in child classes
   */
  protected renderHeader(): React.ReactNode {
    return null;
  }

  /**
   * Render card content
   * Override in child classes
   */
  protected renderContent(): React.ReactNode {
    return this.props.children;
  }

  /**
   * Render card footer (optional)
   * Override in child classes
   */
  protected renderFooter(): React.ReactNode {
    return null;
  }

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}


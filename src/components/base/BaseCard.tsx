/**
 * Base Card Component (Abstract)
 * OOP Base Class for all card components
 * Follows SOLID principles
 */

import React, { Component } from "react";

export interface BaseCardProps {
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export interface BaseCardState {
  isHovered: boolean;
}

/**
 * Abstract Base Card Class
 * All card components should extend this class
 */
export abstract class BaseCard<P extends BaseCardProps = BaseCardProps, S extends BaseCardState = BaseCardState>
  extends Component<P, S> {
  
  protected baseClass: string = "baseCard";

  constructor(props: P) {
    super(props);
    this.state = {
      isHovered: false,
    } as S;
  }

  /**
   * Get CSS classes for the card
   * Override in child classes for custom styling
   */
  protected getClasses(): string {
    const { className = "" } = this.props;
    const hoverClass = this.state.isHovered ? `${this.baseClass}--hovered` : "";
    return `${this.baseClass} ${hoverClass} ${className}`.trim();
  }

  /**
   * Handle hover events
   */
  protected handleMouseEnter = (): void => {
    this.setState({ isHovered: true });
  };

  protected handleMouseLeave = (): void => {
    this.setState({ isHovered: false });
  };

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


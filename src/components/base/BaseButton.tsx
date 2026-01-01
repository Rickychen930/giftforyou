/**
 * Base Button Component (Abstract)
 * OOP Base Class for all button components
 * Follows SOLID principles
 */

import React, { Component } from "react";

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

export interface BaseButtonState {
  isPressed: boolean;
  isFocused: boolean;
}

/**
 * Abstract Base Button Class
 * All button components should extend this class
 */
export abstract class BaseButton<P extends BaseButtonProps = BaseButtonProps, S extends BaseButtonState = BaseButtonState> 
  extends Component<P, S> {
  
  protected baseClass: string = "baseBtn";

  constructor(props: P) {
    super(props);
    this.state = {
      isPressed: false,
      isFocused: false,
    } as S;
  }

  /**
   * Get CSS classes for the button
   * Override in child classes for custom styling
   */
  protected getClasses(): string {
    const { variant = "default", size = "md", isLoading, className = "", disabled } = this.props;
    const variantClass = `${this.baseClass}--${variant}`;
    const sizeClass = `${this.baseClass}--${size}`;
    const loadingClass = isLoading ? `${this.baseClass}--loading` : "";
    const disabledClass = disabled || isLoading ? `${this.baseClass}--disabled` : "";
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";

    return `${this.baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${pressedClass} ${focusedClass} ${className}`.trim();
  }

  /**
   * Handle button press (for accessibility)
   */
  protected handleMouseDown = (): void => {
    this.setState({ isPressed: true });
  };

  protected handleMouseUp = (): void => {
    this.setState({ isPressed: false });
  };

  protected handleFocus = (): void => {
    this.setState({ isFocused: true });
  };

  protected handleBlur = (): void => {
    this.setState({ isFocused: false });
  };

  /**
   * Render loading spinner
   * Override in child classes for custom spinner
   */
  protected renderSpinner(): React.ReactNode {
    if (!this.props.isLoading) return null;
    
    return (
      <svg 
        className={`${this.baseClass}__spinner`} 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        aria-hidden="true"
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeDasharray="31.416" 
          strokeDashoffset="31.416" 
          opacity="0.3"
        >
          <animate 
            attributeName="stroke-dasharray" 
            dur="2s" 
            values="0 31.416;15.708 15.708;0 31.416;0 31.416" 
            repeatCount="indefinite"
          />
          <animate 
            attributeName="stroke-dashoffset" 
            dur="2s" 
            values="0;-15.708;-31.416;-31.416" 
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  }

  /**
   * Render icon
   * Override in child classes for custom icon rendering
   */
  protected renderIcon(): React.ReactNode {
    const { icon, iconPosition = "left", isLoading } = this.props;
    if (!icon || isLoading) return null;

    const iconClass = `${this.baseClass}__icon ${this.baseClass}__icon--${iconPosition}`;
    return <span className={iconClass}>{icon}</span>;
  }

  /**
   * Render button content
   * Override in child classes for custom content
   */
  protected renderContent(): React.ReactNode {
    return <span className={`${this.baseClass}__content`}>{this.props.children}</span>;
  }

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}


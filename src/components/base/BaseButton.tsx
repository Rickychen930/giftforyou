/**
 * Base Button Component (Abstract)
 * OOP Base Class for all button components
 * Follows SOLID principles
 * Enhanced with luxury variants, ripple effect, and responsive design
 */

import React, { Component } from "react";
import "../../styles/base/BaseButton.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gradient" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonIconPosition = "left" | "right" | "only";

export interface BaseButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "variant"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  children?: React.ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
}

export interface BaseButtonState {
  isPressed: boolean;
  isFocused: boolean;
  ripples: Array<{ id: number; x: number; y: number }>;
}

/**
 * Abstract Base Button Class
 * All button components should extend this class
 */
export abstract class BaseButton<P extends BaseButtonProps = BaseButtonProps, S extends BaseButtonState = BaseButtonState> 
  extends Component<P, S> {
  
  protected baseClass: string = "baseBtn";

  private rippleIdCounter: number = 0;

  constructor(props: P) {
    super(props);
    this.state = {
      isPressed: false,
      isFocused: false,
      ripples: [],
    } as unknown as S;
  }

  /**
   * Get CSS classes for the button
   * Override in child classes for custom styling
   */
  protected getClasses(): string {
    const { 
      variant = "primary", 
      size = "md", 
      isLoading, 
      className = "", 
      disabled,
      fullWidth = false,
      icon,
      iconPosition = "left"
    } = this.props;
    
    const variantClass = `${this.baseClass}--${variant}`;
    const sizeClass = `${this.baseClass}--${size}`;
    const loadingClass = isLoading ? `${this.baseClass}--loading` : "";
    const disabledClass = disabled || isLoading ? `${this.baseClass}--disabled` : "";
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";
    const fullWidthClass = fullWidth ? `${this.baseClass}--full-width` : "";
    const iconOnlyClass = icon && iconPosition === "only" ? `${this.baseClass}--icon-only` : "";

    return `${this.baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${pressedClass} ${focusedClass} ${fullWidthClass} ${iconOnlyClass} ${className}`.trim();
  }

  /**
   * Handle button press (for accessibility)
   */
  protected handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>): void => {
    this.setState({ isPressed: true });
    
    // Ripple effect
    const { ripple = true } = this.props;
    if (ripple && !this.props.disabled && !this.props.isLoading) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: this.rippleIdCounter++,
        x,
        y,
      };
      
      this.setState((prevState) => ({
        ripples: [...prevState.ripples, newRipple],
      }));
      
      // Remove ripple after animation
      setTimeout(() => {
        this.setState((prevState) => ({
          ripples: prevState.ripples.filter((r) => r.id !== newRipple.id),
        }));
      }, 600);
    }
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
   * Render ripple effects
   */
  protected renderRipples(): React.ReactNode {
    const { ripples } = this.state;
    if (ripples.length === 0) return null;

    return (
      <span className={`${this.baseClass}__ripples`}>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className={`${this.baseClass}__ripple`}
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
            }}
          />
        ))}
      </span>
    );
  }

  /**
   * Render icon
   * Override in child classes for custom icon rendering
   */
  protected renderIcon(): React.ReactNode {
    const { icon, iconPosition = "left", isLoading } = this.props;
    if (!icon || isLoading) return null;

    // Icon only mode
    if (iconPosition === "only") {
      return <span className={`${this.baseClass}__icon ${this.baseClass}__icon--only`}>{icon}</span>;
    }

    const iconClass = `${this.baseClass}__icon ${this.baseClass}__icon--${iconPosition}`;
    return <span className={iconClass}>{icon}</span>;
  }

  /**
   * Render button content
   * Override in child classes for custom content
   */
  protected renderContent(): React.ReactNode {
    const { children, icon, iconPosition = "left" } = this.props;
    
    // Don't render content if icon-only
    if (icon && iconPosition === "only") {
      return null;
    }
    
    return <span className={`${this.baseClass}__content`}>{children}</span>;
  }

  /**
   * Abstract method - must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}


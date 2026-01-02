/**
 * Quick Action Button Component (OOP)
 * Extends BaseButton following SOLID principles
 */

import React from "react";
import { BaseButton, BaseButtonProps } from "../base/BaseButton";
import "../../styles/QuickActionButton.css";

interface QuickActionButtonProps extends Omit<BaseButtonProps, "variant" | "children" | "iconPosition"> {
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  ariaLabel?: string;
  title?: string;
}

interface QuickActionButtonState {
  isPressed: boolean;
  isFocused: boolean;
  ripples: Array<{ id: number; x: number; y: number }>;
}

/**
 * Quick Action Button Component
 * Class-based component extending BaseButton
 * Enhanced with BaseButton luxury variants and features
 */
class QuickActionButton extends BaseButton<QuickActionButtonProps, QuickActionButtonState> {
  protected baseClass: string = "quickActionBtn";

  constructor(props: QuickActionButtonProps) {
    super({
      ...props,
      iconPosition: "left", // QuickActionButton uses icon on top, but BaseButton expects left/right
    } as QuickActionButtonProps);
  }

  protected getClasses(): string {
    const { variant = "outline", className = "" } = this.props;
    
    // Use BaseButton's getClasses and add QuickActionButton specific classes
    const baseClasses = super.getClasses();
    const variantClass = `${this.baseClass}--${variant}`;
    
    return `${baseClasses} ${this.baseClass} ${variantClass} ${className}`.trim();
  }

  protected renderIcon(): React.ReactNode {
    // QuickActionButton has icon on top, so we override the icon rendering
    const { icon, isLoading } = this.props;
    if (!icon || isLoading) return null;
    
    return <div className={`${this.baseClass}__icon`}>{icon}</div>;
  }

  protected renderContent(): React.ReactNode {
    const { label } = this.props;
    return <span className={`${this.baseClass}__label`}>{label}</span>;
  }

  render(): React.ReactNode {
    const { label, ariaLabel, title, onClick, onMouseDown, onMouseUp, onFocus, onBlur, disabled, isLoading, ...restProps } = this.props;

    return (
      <button
        {...restProps}
        type="button"
        className={this.getClasses()}
        disabled={disabled || isLoading}
        onClick={onClick}
        aria-label={ariaLabel || label}
        title={title || label}
        onMouseDown={(e) => {
          this.handleMouseDown(e);
          if (onMouseDown) onMouseDown(e);
        }}
        onMouseUp={(e) => {
          this.handleMouseUp();
          if (onMouseUp) onMouseUp(e);
        }}
        onFocus={(e) => {
          this.handleFocus();
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          this.handleBlur();
          if (onBlur) onBlur(e);
        }}
      >
        {this.renderRipples()}
        {this.renderSpinner()}
        {!isLoading && this.renderIcon()}
        {this.renderContent()}
      </button>
    );
  }
}

export default QuickActionButton;


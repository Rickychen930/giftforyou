/**
 * Icon Button Component (OOP)
 * Extends BaseButton following SOLID principles
 */

import React from "react";
import { BaseButton, BaseButtonProps } from "../base/BaseButton";
import "../../styles/IconButton.css";

interface IconButtonProps extends Omit<BaseButtonProps, "children" | "iconPosition"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon: React.ReactNode;
  ariaLabel: string;
  tooltip?: string;
}

interface IconButtonState {
  isPressed: boolean;
  isFocused: boolean;
  ripples: Array<{ id: number; x: number; y: number }>;
}

/**
 * Icon Button Component
 * Class-based component extending BaseButton
 */
class IconButton extends BaseButton<IconButtonProps, IconButtonState> {
  protected baseClass: string = "iconBtn";

  constructor(props: IconButtonProps) {
    super({
      ...props,
      iconPosition: "only", // IconButton always uses icon-only mode
    } as IconButtonProps);
  }

  protected getClasses(): string {
    const { variant = "ghost", className = "" } = this.props;
    
    // Use BaseButton's getClasses and add IconButton specific classes
    const baseClasses = super.getClasses();
    const variantClass = `${this.baseClass}--${variant}`;
    
    return `${baseClasses} ${this.baseClass} ${variantClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { ariaLabel, tooltip, onMouseDown, onMouseUp, onFocus, onBlur, disabled, isLoading, ...restProps } = this.props;

    return (
      <button
        {...restProps}
        className={this.getClasses()}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        title={tooltip || ariaLabel}
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
      </button>
    );
  }
}

export default IconButton;


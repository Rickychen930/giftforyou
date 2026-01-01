/**
 * Icon Button Component (OOP)
 * Extends BaseButton following SOLID principles
 */

import React from "react";
import { BaseButton, BaseButtonProps } from "../base/BaseButton";
import "../../styles/IconButton.css";

interface IconButtonProps extends Omit<BaseButtonProps, "children"> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger";
  icon: React.ReactNode;
  ariaLabel: string;
  tooltip?: string;
}

interface IconButtonState {
  isPressed: boolean;
  isFocused: boolean;
}

/**
 * Icon Button Component
 * Class-based component extending BaseButton
 */
class IconButton extends BaseButton<IconButtonProps, IconButtonState> {
  protected baseClass: string = "iconBtn";


  protected getClasses(): string {
    const { variant = "default", size = "md", className = "" } = this.props;
    const variantClass = `${this.baseClass}--${variant}`;
    const sizeClass = `${this.baseClass}--${size}`;
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";

    return `${this.baseClass} ${variantClass} ${sizeClass} ${pressedClass} ${focusedClass} ${className}`.trim();
  }

  protected renderIcon(): React.ReactNode {
    return <span className={`${this.baseClass}__icon`}>{this.props.icon}</span>;
  }

  render(): React.ReactNode {
    const { ariaLabel, tooltip, onMouseDown, onMouseUp, onFocus, onBlur } = this.props;

    return (
      <button
        className={this.getClasses()}
        aria-label={ariaLabel}
        title={tooltip || ariaLabel}
        onMouseDown={(e) => {
          this.handleMouseDown();
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
        {...this.props}
      >
        {this.renderIcon()}
      </button>
    );
  }
}

export default IconButton;


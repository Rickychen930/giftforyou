/**
 * Quick Action Button Component (OOP)
 * Extends BaseButton following SOLID principles
 */

import React from "react";
import { BaseButton, BaseButtonProps } from "../base/BaseButton";
import "../../styles/QuickActionButton.css";

interface QuickActionButtonProps extends Omit<BaseButtonProps, "variant"> {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "primary";
  ariaLabel?: string;
  title?: string;
}

interface QuickActionButtonState {
  isPressed: boolean;
  isFocused: boolean;
}

/**
 * Quick Action Button Component
 * Class-based component extending BaseButton
 */
class QuickActionButton extends BaseButton<QuickActionButtonProps, QuickActionButtonState> {
  protected baseClass: string = "quickActionBtn";


  protected getClasses(): string {
    const { variant = "default", className = "" } = this.props;
    const variantClass = `${this.baseClass}--${variant}`;
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";

    return `${this.baseClass} ${variantClass} ${pressedClass} ${focusedClass} ${className}`.trim();
  }

  protected renderIcon(): React.ReactNode {
    return <div className={`${this.baseClass}__icon`}>{this.props.icon}</div>;
  }

  protected renderContent(): React.ReactNode {
    return <span className={`${this.baseClass}__label`}>{this.props.label}</span>;
  }

  render(): React.ReactNode {
    const { label, ariaLabel, title, onClick, onMouseDown, onMouseUp, onFocus, onBlur } = this.props;

    return (
      <button
        type="button"
        className={this.getClasses()}
        onClick={onClick}
        aria-label={ariaLabel || label}
        title={title || label}
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
      >
        {this.renderIcon()}
        {this.renderContent()}
      </button>
    );
  }
}

export default QuickActionButton;


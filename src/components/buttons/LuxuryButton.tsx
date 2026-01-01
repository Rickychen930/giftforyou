/**
 * Luxury Button Component (OOP)
 * Extends BaseButton following SOLID principles
 */

import React from "react";
import { BaseButton, BaseButtonProps } from "../base/BaseButton";
import "../../styles/LuxuryButton.css";

interface LuxuryButtonProps extends BaseButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

interface LuxuryButtonState {
  isPressed: boolean;
  isFocused: boolean;
}

/**
 * Luxury Button Component
 * Class-based component extending BaseButton
 */
class LuxuryButton extends BaseButton<LuxuryButtonProps, LuxuryButtonState> {
  protected baseClass: string = "luxuryBtn";

  constructor(props: LuxuryButtonProps) {
    super(props);
  }

  protected getClasses(): string {
    const { variant = "primary", size = "md", isLoading, className = "", disabled } = this.props;
    const variantClass = `${this.baseClass}--${variant}`;
    const sizeClass = `${this.baseClass}--${size}`;
    const loadingClass = isLoading ? `${this.baseClass}--loading` : "";
    const disabledClass = disabled || isLoading ? `${this.baseClass}--disabled` : "";
    const pressedClass = this.state.isPressed ? `${this.baseClass}--pressed` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";

    return `${this.baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${pressedClass} ${focusedClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { disabled, isLoading, onClick, onMouseDown, onMouseUp, onFocus, onBlur } = this.props;

    return (
      <button
        className={this.getClasses()}
        disabled={disabled || isLoading}
        onClick={onClick}
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
        {this.renderSpinner()}
        {!isLoading && this.renderIcon()}
        {this.renderContent()}
      </button>
    );
  }
}

export default LuxuryButton;


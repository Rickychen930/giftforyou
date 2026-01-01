/**
 * Success Icon Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/SuccessIcon.css";

interface SuccessIconProps {
  size?: number;
  className?: string;
}

interface SuccessIconState {
  // No state needed, but keeping for consistency
}

/**
 * Success Icon Component
 * Class-based component for animated success checkmark
 */
class SuccessIcon extends Component<SuccessIconProps, SuccessIconState> {
  private baseClass: string = "successIcon";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private getStyle(): React.CSSProperties {
    const { size = 80 } = this.props;
    return { width: size, height: size };
  }

  render(): React.ReactNode {
    const { size = 80 } = this.props;

    return (
      <div className={this.getClasses()} style={this.getStyle()}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            className={`${this.baseClass}__circle`}
          />
          <path
            d="M8 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${this.baseClass}__check`}
          />
        </svg>
      </div>
    );
  }
}

export default SuccessIcon;

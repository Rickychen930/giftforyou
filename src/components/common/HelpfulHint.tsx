/**
 * Helpful Hint Component (OOP)
 * Class-based component following SOLID principles
 * Displays helpful guidance or hints to users
 */

import React, { Component } from "react";
import "../../styles/common/HelpfulHint.css";

interface HelpfulHintProps {
  /**
   * Hint message
   */
  message: string;
  /**
   * Hint variant (info, tip, note)
   */
  variant?: "info" | "tip" | "note";
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Additional CSS class
   */
  className?: string;
  /**
   * Whether hint is dismissible
   */
  dismissible?: boolean;
}

interface HelpfulHintState {
  isVisible: boolean;
}

/**
 * Helpful Hint Component
 * Provides helpful guidance to users
 * Follows Single Responsibility: only handles hint display
 */
class HelpfulHint extends Component<HelpfulHintProps, HelpfulHintState> {
  private baseClass: string = "helpfulHint";

  constructor(props: HelpfulHintProps) {
    super(props);
    this.state = {
      isVisible: true,
    };
  }

  private handleDismiss = (): void => {
    this.setState({ isVisible: false });
  };

  private getDefaultIcon(): React.ReactNode {
    const { variant = "info" } = this.props;
    
    const iconMap = {
      info: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      tip: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      note: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    };

    return iconMap[variant];
  }

  render(): React.ReactNode {
    const { message, variant = "info", icon, className, dismissible = false } = this.props;
    const { isVisible } = this.state;

    if (!isVisible) return null;

    return (
      <div
        className={`${this.baseClass} ${this.baseClass}--${variant} ${className || ""}`.trim()}
        role="note"
        aria-label={`${variant} hint`}
      >
        <div className={`${this.baseClass}__icon`}>
          {icon || this.getDefaultIcon()}
        </div>
        <p className={`${this.baseClass}__message`}>{message}</p>
        {dismissible && (
          <button
            type="button"
            className={`${this.baseClass}__dismiss`}
            onClick={this.handleDismiss}
            aria-label="Tutup hint"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  }
}

export default HelpfulHint;


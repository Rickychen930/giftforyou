/**
 * Auto Save Indicator Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/AutoSaveIndicator.css";

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
  className?: string;
}

interface AutoSaveIndicatorState {
  show: boolean;
  message: string;
  timeoutId: NodeJS.Timeout | null;
}

/**
 * Auto Save Indicator Component
 * Class-based component for auto-save status indicator
 */
class AutoSaveIndicator extends Component<AutoSaveIndicatorProps, AutoSaveIndicatorState> {
  private baseClass: string = "autoSaveIndicator";

  constructor(props: AutoSaveIndicatorProps) {
    super(props);
    this.state = {
      show: false,
      message: "",
      timeoutId: null,
    };
  }

  componentDidUpdate(prevProps: AutoSaveIndicatorProps): void {
    const { isSaving, lastSaved } = this.props;

    if (isSaving && !prevProps.isSaving) {
      this.setState({ show: true, message: "Menyimpan..." });
    } else if (!isSaving && prevProps.isSaving && lastSaved) {
      this.setState({ show: true, message: "Tersimpan" });
      const timeoutId = setTimeout(() => {
        this.setState({ show: false, timeoutId: null });
      }, 2000);
      this.setState({ timeoutId });
    }
  }

  componentWillUnmount(): void {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  }

  private getClasses(): string {
    const { isSaving, className = "" } = this.props;
    const savingClass = isSaving ? `${this.baseClass}--saving` : `${this.baseClass}--saved`;
    return `${this.baseClass} ${savingClass} ${className}`.trim();
  }

  private renderSpinner(): React.ReactNode {
    return (
      <svg
        className={`${this.baseClass}__spinner`}
        width="14"
        height="14"
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

  private renderCheckIcon(): React.ReactNode {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { isSaving } = this.props;
    const { show, message } = this.state;

    if (!show) return null;

    return (
      <div className={this.getClasses()} role="status" aria-live="polite">
        <div className={`${this.baseClass}__content`}>
          {isSaving ? (
            <>
              {this.renderSpinner()}
              <span>{message}</span>
            </>
          ) : (
            <>
              {this.renderCheckIcon()}
              <span>{message}</span>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default AutoSaveIndicator;


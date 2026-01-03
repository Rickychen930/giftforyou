/**
 * Error Display Component (OOP)
 * Class-based component following SOLID principles
 * Luxury, responsive, reusable error display component
 * MVC Pattern: View component for error display
 */

import React, { Component } from "react";
import type {
  ErrorDisplayConfig,
  ErrorSeverity,
  ErrorAction,
  ErrorDisplayState,
} from "../../models/error-display-model";
import { ErrorDisplayDefaults } from "../../models/error-display-model";
import "../../styles/ErrorDisplay.css";

interface ErrorDisplayProps extends ErrorDisplayConfig {
  // Props are defined in ErrorDisplayConfig
}

/**
 * Error Display Component
 * Class-based component for displaying errors with luxury styling
 * Follows OOP principles: Encapsulation, Single Responsibility
 */
class ErrorDisplay extends Component<ErrorDisplayProps, ErrorDisplayState> {
  private readonly baseClass: string = "errorDisplay";
  private readonly MAX_RETRIES: number = 3;

  constructor(props: ErrorDisplayProps) {
    super(props);
    this.state = {
      isRetrying: false,
      retryCount: 0,
    };
  }

  /**
   * Get severity with default fallback
   * Encapsulation: Private method for internal logic
   */
  private getSeverity(): ErrorSeverity {
    return this.props.severity || "error";
  }

  /**
   * Get title with default fallback
   * Encapsulation: Private method for internal logic
   */
  private getTitle(): string {
    const { title } = this.props;
    if (title) return title;
    return ErrorDisplayDefaults.TITLES[this.getSeverity()];
  }

  /**
   * Get CSS classes for the component
   * Encapsulation: Private method for styling logic
   */
  private getClasses(): string {
    const { className = "", severity } = this.props;
    const severityClass = severity || "error";
    return `${this.baseClass} ${this.baseClass}--${severityClass} ${className}`.trim();
  }

  /**
   * Get default icon based on severity
   * Encapsulation: Private method for icon logic
   */
  private getDefaultIcon(): React.ReactNode {
    const severity = this.getSeverity();

    switch (severity) {
      case "error":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8V12M12 16H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default: // info
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 16V12M12 8H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
    }
  }

  /**
   * Handle retry action
   * Encapsulation: Private method for retry logic
   */
  private handleRetry = async (): Promise<void> => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= this.MAX_RETRIES) {
      console.warn("Maximum retry attempts reached");
      return;
    }

    if (!onRetry) {
      // Default retry: reload page
      window.location.reload();
      return;
    }

    this.setState({ isRetrying: true, retryCount: retryCount + 1 });

    try {
      await onRetry();
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      this.setState({ isRetrying: false });
    }
  };

  /**
   * Render action buttons
   * Encapsulation: Private method for action rendering
   */
  private renderActions(): React.ReactNode {
    const { actions, showRetry, onRetry, retryLabel } = this.props;
    const { isRetrying, retryCount } = this.state;
    const hasActions = actions && actions.length > 0;
    const shouldShowRetry = showRetry !== false && (onRetry || !hasActions);

    if (!hasActions && !shouldShowRetry) {
      return null;
    }

    return (
      <div className={`${this.baseClass}__actions`}>
        {actions?.map((action: ErrorAction, index: number) => (
          <button
            key={index}
            type="button"
            onClick={action.onClick}
            className={`${this.baseClass}__action ${this.baseClass}__action--${action.variant || "primary"}`}
            aria-label={action.ariaLabel || action.label}
            disabled={isRetrying}
          >
            {action.label}
          </button>
        ))}

        {shouldShowRetry && (
          <button
            type="button"
            onClick={this.handleRetry}
            className={`${this.baseClass}__action ${this.baseClass}__action--primary`}
            aria-label={retryLabel || ErrorDisplayDefaults.RETRY_LABEL}
            disabled={isRetrying || retryCount >= this.MAX_RETRIES}
          >
            {isRetrying ? "Memuat..." : retryLabel || ErrorDisplayDefaults.RETRY_LABEL}
          </button>
        )}
      </div>
    );
  }

  /**
   * Get inline styles for max-width
   * Encapsulation: Private method for styling
   */
  private getStyles(): React.CSSProperties {
    const { maxWidth } = this.props;
    return {
      maxWidth: maxWidth || ErrorDisplayDefaults.DEFAULT_MAX_WIDTH,
    };
  }

  /**
   * Render method
   * Single Responsibility: Only handles UI rendering
   */
  render(): React.ReactNode {
    const { message, icon } = this.props;
    const title = this.getTitle();

    return (
      <div
        className={this.getClasses()}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        style={this.getStyles()}
      >
        {/* Decorative top border */}
        <div className={`${this.baseClass}__border`} aria-hidden="true" />

        {/* Icon container */}
        <div className={`${this.baseClass}__icon`} aria-hidden="true">
          {icon || this.getDefaultIcon()}
        </div>

        {/* Content */}
        <div className={`${this.baseClass}__content`}>
          <h3 className={`${this.baseClass}__title`}>{title}</h3>
          <p className={`${this.baseClass}__message`}>{message}</p>
        </div>

        {/* Actions */}
        {this.renderActions()}
      </div>
    );
  }
}

export default ErrorDisplay;


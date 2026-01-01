/**
 * Alert Message Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/AlertMessage.css";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

interface AlertMessageState {
  displayMessage: string;
}

/**
 * Alert Message Component
 * Class-based component for alert messages
 */
class AlertMessage extends Component<AlertMessageProps, AlertMessageState> {
  private baseClass: string = "alertMessage";

  constructor(props: AlertMessageProps) {
    super(props);
    this.state = {
      displayMessage: props.message,
    };
  }

  componentDidUpdate(prevProps: AlertMessageProps): void {
    if (prevProps.message !== this.props.message) {
      this.setState({ displayMessage: this.props.message });
    }
  }

  private getClasses(): string {
    const { variant, className = "" } = this.props;
    return `${this.baseClass} ${this.baseClass}--${variant} ${className}`.trim();
  }

  private getDefaultIcon(): React.ReactNode {
    const { variant, icon } = this.props;
    if (icon) return icon;

    switch (variant) {
      case "success":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case "error":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "warning":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  }

  render(): React.ReactNode {
    const { displayMessage } = this.state;

    return (
      <div className={this.getClasses()} role="alert">
        <span className={`${this.baseClass}__icon`}>{this.getDefaultIcon()}</span>
        <span className={`${this.baseClass}__message`}>{displayMessage}</span>
      </div>
    );
  }
}

export default AlertMessage;

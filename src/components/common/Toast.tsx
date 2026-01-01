/**
 * Toast Component (Merged & OOP)
 * Combines LuxuryToast and Toast functionality
 * Class-based component following OOP principles
 */

import React, { Component } from "react";
import "../../styles/LuxuryToast.css";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  /**
   * Toast object (for LuxuryToastContainer usage)
   */
  toast?: Toast;
  /**
   * Message (for simple usage)
   */
  message?: string;
  /**
   * Type (for simple usage)
   */
  type?: ToastType;
  /**
   * Is visible (for simple usage)
   */
  isVisible?: boolean;
  /**
   * On close callback
   */
  onClose: (id?: string) => void;
  /**
   * Duration in milliseconds
   */
  duration?: number;
}

interface ToastState {
  isVisible: boolean;
  isExiting: boolean;
}

/**
 * Toast Component (Class-based)
 * Unified toast component supporting both usage patterns
 */
class ToastComponent extends Component<ToastProps, ToastState> {
  private timer: NodeJS.Timeout | null = null;

  constructor(props: ToastProps) {
    super(props);
    this.state = {
      isVisible: false,
      isExiting: false,
    };
  }

  componentDidMount(): void {
    // Trigger entrance animation
    setTimeout(() => {
      this.setState({ isVisible: true });
    }, 10);

    // Auto close
    const duration = this.getDuration();
    if (duration > 0) {
      this.timer = setTimeout(() => {
        this.handleClose();
      }, duration);
    }
  }

  componentWillUnmount(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private getDuration(): number {
    if (this.props.toast) {
      return this.props.toast.duration || 4000;
    }
    return this.props.duration || 4000;
  }

  private getType(): ToastType {
    if (this.props.toast) {
      return this.props.toast.type;
    }
    return this.props.type || "info";
  }

  private getMessage(): string {
    if (this.props.toast) {
      return this.props.toast.message;
    }
    return this.props.message || "";
  }

  private shouldRender(): boolean {
    if (this.props.toast) {
      return true; // Always render if toast object provided
    }
    return this.props.isVisible ?? false;
  }

  private handleClose = (): void => {
    this.setState({ isExiting: true });
    setTimeout(() => {
      if (this.props.toast) {
        this.props.onClose(this.props.toast.id);
      } else {
        this.props.onClose();
      }
    }, 300);
  };

  private getIcon(): React.ReactNode {
    const type = this.getType();
    
    switch (type) {
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
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "warning":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "info":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return null;
    }
  }

  render(): React.ReactNode {
    if (!this.shouldRender()) {
      return null;
    }

    const type = this.getType();
    const message = this.getMessage();
    const { isVisible, isExiting } = this.state;

    return (
      <div
        className={`luxuryToast luxuryToast--${type} ${isVisible ? "luxuryToast--visible" : ""} ${isExiting ? "luxuryToast--exiting" : ""}`}
        role="alert"
        aria-live="polite"
      >
        <div className="luxuryToast__content">
          <div className="luxuryToast__icon">{this.getIcon()}</div>
          <p className="luxuryToast__message">{message}</p>
          <button
            type="button"
            className="luxuryToast__close"
            onClick={this.handleClose}
            aria-label="Tutup notifikasi"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="luxuryToast__progress">
          <div className="luxuryToast__progressBar" />
        </div>
      </div>
    );
  }
}

export default ToastComponent;


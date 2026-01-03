/**
 * Error Boundary with Retry Component (OOP)
 * Class-based component following SOLID principles
 * Provides error recovery with retry mechanism
 */

import React, { Component, ReactNode } from "react";
import "../../styles/ErrorBoundaryWithRetry.css";
import AlertMessage from "./AlertMessage";

interface ErrorBoundaryWithRetryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  errorMessage?: string;
  showRetry?: boolean;
}

interface ErrorBoundaryWithRetryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Error Boundary with Retry Component
 * Catches errors and provides retry mechanism
 */
class ErrorBoundaryWithRetry extends Component<
  ErrorBoundaryWithRetryProps,
  ErrorBoundaryWithRetryState
> {
  private baseClass: string = "errorBoundaryWithRetry";
  private readonly MAX_RETRIES = 3;

  constructor(props: ErrorBoundaryWithRetryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryWithRetryState {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = (): void => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= this.MAX_RETRIES) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));

    if (onRetry) {
      onRetry();
    }
  };

  private renderErrorFallback(): ReactNode {
    const { fallback, errorMessage, showRetry = true } = this.props;
    const { error, retryCount } = this.state;

    if (fallback) {
      return fallback;
    }

    const message = errorMessage || error?.message || "Terjadi kesalahan saat memuat data.";
    const canRetry = showRetry && retryCount < this.MAX_RETRIES;

    return (
      <div className={this.baseClass} role="alert" aria-live="polite">
        <AlertMessage
          variant="error"
          message={message}
          className={`${this.baseClass}__alert`}
        />
        {canRetry && (
          <div className={`${this.baseClass}__actions`}>
            <button
              type="button"
              onClick={this.handleRetry}
              className={`${this.baseClass}__retryButton`}
              aria-label="Coba lagi"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {retryCount >= this.MAX_RETRIES && (
          <p className={`${this.baseClass}__maxRetries`}>
            Sudah mencoba beberapa kali. Silakan refresh halaman.
          </p>
        )}
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithRetry;


/**
 * Error Boundary Component
 * Luxury, Elegant, Clean UI/UX
 * Follows SOLID, OOP, DRY principles
 * Fully responsive on all devices
 */

import React from "react";
import "../styles/ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

/**
 * Error Boundary Class Component
 * Catches React errors and displays elegant error UI
 * Implements OOP principles with clear separation of concerns
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount: number = 0;
  private readonly MAX_RETRIES: number = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  /**
   * Get derived state from error (React lifecycle)
   * SOLID: Single Responsibility - only handles error state
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Component did catch error (React lifecycle)
   * SOLID: Single Responsibility - only logs error
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error("ErrorBoundary caught an error:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optional: Send to error reporting service
    this.reportError(error, errorInfo);
  }

  /**
   * Report error to external service (optional)
   * SOLID: Single Responsibility - only handles error reporting
   */
  private reportError(error: Error, errorInfo: React.ErrorInfo): void {
    // Only report in production or if explicitly enabled
    if (process.env.NODE_ENV === "production" || process.env.REACT_APP_ENABLE_ERROR_REPORTING === "true") {
      try {
        // Example: Send to error tracking service
        // You can integrate with Sentry, LogRocket, etc.
        if (typeof window !== "undefined" && (window as any).errorTracker) {
          (window as any).errorTracker.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
            tags: {
              errorBoundary: true,
              errorId: this.state.errorId,
            },
          });
        }
      } catch (reportError) {
        // Silently fail error reporting to prevent infinite loops
        console.warn("Failed to report error:", reportError);
      }
    }
  }

  /**
   * Handle reload action
   * SOLID: Single Responsibility - only handles reload
   */
  private handleReload = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Reload page
    window.location.reload();
  };

  /**
   * Handle retry action
   * SOLID: Single Responsibility - only handles retry
   */
  private handleRetry = (): void => {
    if (this.retryCount >= this.MAX_RETRIES) {
      // Max retries reached, reload page
      this.handleReload();
      return;
    }

    this.retryCount += 1;

    // Reset error state to allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  /**
   * Handle go home action
   * SOLID: Single Responsibility - only handles navigation
   */
  private handleGoHome = (): void => {
    // Navigate to home
    window.location.href = "/";
  };

  /**
   * Handle go back action
   * SOLID: Single Responsibility - only handles navigation
   */
  private handleGoBack = (): void => {
    // Go back in history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If no history, go to home
      this.handleGoHome();
    }
  };

  /**
   * Get error message based on error type
   * SOLID: Single Responsibility - only formats error message
   */
  private getErrorMessage(): string {
    const { error } = this.state;

    if (!error) {
      return "Terjadi kesalahan yang tidak diketahui.";
    }

    // Check for common error types
    if (error.message.includes("ChunkLoadError") || error.message.includes("Loading chunk")) {
      return "Gagal memuat aplikasi. Silakan refresh halaman.";
    }

    if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
      return "Masalah koneksi jaringan. Periksa koneksi internet Anda.";
    }

    if (error.message.includes("timeout")) {
      return "Waktu permintaan habis. Silakan coba lagi.";
    }

    // Default message
    return "Terjadi kesalahan saat memuat halaman. Silakan coba lagi.";
  }

  /**
   * Get error details for debugging (development only)
   * SOLID: Single Responsibility - only formats error details
   */
  private getErrorDetails(): string | null {
    const { error, errorInfo } = this.state;

    // Only show details in development
    if (process.env.NODE_ENV !== "development") {
      return null;
    }

    if (!error && !errorInfo) {
      return null;
    }

    const details: string[] = [];

    if (error) {
      details.push(`Error: ${error.message}`);
      if (error.stack) {
        details.push(`\nStack:\n${error.stack}`);
      }
    }

    if (errorInfo?.componentStack) {
      details.push(`\nComponent Stack:\n${errorInfo.componentStack}`);
    }

    return details.join("\n");
  }

  /**
   * Render custom fallback if provided
   * SOLID: Open/Closed - allows extension via fallback prop
   */
  private renderCustomFallback(): React.ReactNode | null {
    const { fallback } = this.props;
    const { error, errorInfo } = this.state;

    if (fallback && error && errorInfo) {
      return fallback(error, errorInfo);
    }

    return null;
  }

  /**
   * Render default error UI
   * SOLID: Single Responsibility - only renders error UI
   */
  private renderErrorUI(): React.ReactNode {
    const { errorId } = this.state;
    const errorMessage = this.getErrorMessage();
    const errorDetails = this.getErrorDetails();
    const canRetry = this.retryCount < this.MAX_RETRIES;

    return (
      <main className="errorBoundary" role="alert" aria-live="polite">
        <div className="errorBoundary__container">
          <div className="errorBoundary__card">
            {/* Icon */}
            <div className="errorBoundary__icon-wrapper">
              <svg
                className="errorBoundary__icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="errorBoundary__title">Oops! Terjadi Kesalahan</h1>

            {/* Message */}
            <p className="errorBoundary__message">{errorMessage}</p>

            {/* Error ID (for support) */}
            {errorId && (
              <div className="errorBoundary__error-id">
                <span className="errorBoundary__error-id-label">Error ID:</span>
                <code className="errorBoundary__error-id-value">{errorId}</code>
              </div>
            )}

            {/* Error Details (development only) */}
            {errorDetails && (
              <details className="errorBoundary__details">
                <summary className="errorBoundary__details-summary">
                  Detail Error (Development)
                </summary>
                <pre className="errorBoundary__details-content">{errorDetails}</pre>
              </details>
            )}

            {/* Actions */}
            <div className="errorBoundary__actions">
              {canRetry && (
                <button
                  type="button"
                  className="errorBoundary__button errorBoundary__button--primary"
                  onClick={this.handleRetry}
                  aria-label="Coba lagi"
                >
                  <svg
                    className="errorBoundary__button-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                      fill="currentColor"
                    />
                  </svg>
                  Coba Lagi
                </button>
              )}

              <button
                type="button"
                className="errorBoundary__button errorBoundary__button--secondary"
                onClick={this.handleReload}
                aria-label="Refresh halaman"
              >
                <svg
                  className="errorBoundary__button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                    fill="currentColor"
                  />
                </svg>
                Refresh
              </button>

              <button
                type="button"
                className="errorBoundary__button errorBoundary__button--tertiary"
                onClick={this.handleGoBack}
                aria-label="Kembali"
              >
                <svg
                  className="errorBoundary__button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                    fill="currentColor"
                  />
                </svg>
                Kembali
              </button>

              <a
                href="/"
                className="errorBoundary__button errorBoundary__button--tertiary"
                aria-label="Ke halaman utama"
              >
                <svg
                  className="errorBoundary__button-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
                    fill="currentColor"
                  />
                </svg>
                Beranda
              </a>
            </div>

            {/* Help Text */}
            <p className="errorBoundary__help">
              Jika masalah berlanjut, silakan hubungi tim support dengan Error ID di atas.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Render method
   * SOLID: Single Responsibility - only decides what to render
   */
  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Try custom fallback first
    const customFallback = this.renderCustomFallback();
    if (customFallback) {
      return customFallback;
    }

    // Render default error UI
    return this.renderErrorUI();
  }
}

export default ErrorBoundary;

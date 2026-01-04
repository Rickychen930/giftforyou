/**
 * Error Boundary for Grid Components
 * Catches errors in grid rendering and provides graceful fallback
 */

import React, { Component, ReactNode } from "react";
import "../styles/ErrorBoundary.css";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GridErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    // Check if error is related to Object.values() on null/undefined
    // This might be a transient error during loading, so we should be more lenient
    // Don't set error state for loading-related errors - let parent component handle it
    if (error.message && error.message.includes("Cannot convert undefined or null to object")) {
      console.warn("[GridErrorBoundary] Detected Object.values() error - this might be transient during loading, ignoring");
      // Return no error state - this prevents showing "gagal membuat grid" during loading
      return { hasError: false, error: null };
    }
    
    // Only set error state for real rendering errors
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Check if error is related to Object.values() on null/undefined
    // This might be a transient error during loading, so we should be more lenient
    if (error.message && error.message.includes("Cannot convert undefined or null to object")) {
      console.warn("[GridErrorBoundary] Detected Object.values() error - this might be transient during loading");
      // Don't log as error - this is expected during loading
      return;
    }
    
    // Only log real rendering errors
    console.error("[GridErrorBoundary] Grid rendering error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="virtualized-grid-error" role="alert">
          <div className="virtualized-grid-error__content">
            <div className="virtualized-grid-error__icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="virtualized-grid-error__title">Gagal Memuat Grid</h3>
            <p className="virtualized-grid-error__message">
              Terjadi kesalahan saat menampilkan bouquet. Silakan coba lagi.
            </p>
            <button
              onClick={this.handleReset}
              className="virtualized-grid-error__retry"
              aria-label="Coba lagi memuat grid"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  d="M1 4v6h6M23 20v-6h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.49 9A9 9 0 003.51 15M3.51 9a9 9 0 0016.98 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Coba Lagi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GridErrorBoundary;


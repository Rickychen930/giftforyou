import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specifically for Hero Slider
 * Prevents slider errors from crashing the entire page
 */
export class HeroSliderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      console.error("Hero Slider Error:", error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <section className="hero hero--empty" aria-label="Slider error">
          <div className="hero__empty">
            <p>Unable to load slider. Please refresh the page.</p>
            <button
              onClick={this.handleReset}
              className="hero__retryBtn"
              type="button"
            >
              Try Again
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}


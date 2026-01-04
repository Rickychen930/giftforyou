/**
 * Error Boundary for Customer Dashboard
 * Handles errors gracefully with luxury UI
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/CustomerDashboardErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class CustomerDashboardErrorBoundary extends Component<Props, State> {
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
    if (process.env.NODE_ENV === "development") {
      console.error("Customer Dashboard Error:", error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="customerDashboardError">
          <div className="customerDashboardError__container">
            <div className="customerDashboardError__icon" aria-hidden="true">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="customerDashboardError__title">Terjadi Kesalahan</h1>
            <p className="customerDashboardError__message">
              Maaf, terjadi kesalahan saat memuat dashboard. Silakan coba lagi atau hubungi
              dukungan jika masalah berlanjut.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="customerDashboardError__details">
                <summary>Detail Error (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="customerDashboardError__actions">
              <button
                type="button"
                onClick={this.handleReset}
                className="customerDashboardError__button customerDashboardError__button--primary"
              >
                Coba Lagi
              </button>
              <Link
                to="/customer/dashboard"
                className="customerDashboardError__button customerDashboardError__button--secondary"
              >
                Muat Ulang Halaman
              </Link>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default CustomerDashboardErrorBoundary;


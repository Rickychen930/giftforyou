import React from "react";
import "../styles/ErrorBoundary.css";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // Keep logging minimal; avoid crashing the app entirely.
    // eslint-disable-next-line no-console
    console.error("App crashed:", error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="errorBoundary" role="alert" aria-live="polite">
        <div className="errorBoundary__card">
          <div className="errorBoundary__title">Something went wrong</div>
          <div className="errorBoundary__text">
            Please refresh the page, or go back to Home.
          </div>

          <div className="errorBoundary__actions">
            <button
              type="button"
              className="errorBoundary__btn errorBoundary__btn--primary"
              onClick={this.handleReload}
            >
              Refresh
            </button>
            <a
              className="errorBoundary__btn errorBoundary__btn--secondary"
              href="/"
            >
              Home
            </a>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;

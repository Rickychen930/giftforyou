/**
 * Back To Top Button Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/footer/BackToTopButton.css";

interface BackToTopButtonState {
  isVisible: boolean;
  rafId: number;
}

/**
 * Back To Top Button Component
 * Class-based component for scroll-to-top functionality
 */
class BackToTopButton extends Component<{}, BackToTopButtonState> {
  private baseClass: string = "back-to-top";

  constructor(props: {}) {
    super(props);
    this.state = {
      isVisible: false,
      rafId: 0,
    };
  }

  componentDidMount(): void {
    this.updateVisibility();
    window.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  componentWillUnmount(): void {
    window.removeEventListener("scroll", this.handleScroll);
    if (this.state.rafId) {
      window.cancelAnimationFrame(this.state.rafId);
    }
  }

  private updateVisibility = (): void => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.setState({ isVisible: y > 420, rafId: 0 });
  };

  private handleScroll = (): void => {
    if (this.state.rafId) return;
    const rafId = window.requestAnimationFrame(this.updateVisibility);
    this.setState({ rafId });
  };

  private scrollToTop = (): void => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  private getClasses(): string {
    const { isVisible } = this.state;
    const visibleClass = isVisible ? `${this.baseClass}--visible` : "";
    return `${this.baseClass} ${visibleClass}`.trim();
  }

  render(): React.ReactNode {
    return (
      <button
        onClick={this.scrollToTop}
        className={this.getClasses()}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 19V5M12 5l-7 7M12 5l7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
}

export default BackToTopButton;

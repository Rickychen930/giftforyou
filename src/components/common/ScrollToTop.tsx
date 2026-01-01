/**
 * Scroll To Top Component (Merged)
 * Combines functionality from scroll-to-top.tsx and ScrollToTop.tsx
 * OOP-based with class component
 */

import React, { Component } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/ScrollToTop.css";

interface ScrollToTopProps {
  /**
   * Threshold in pixels before button appears (default: 300)
   */
  threshold?: number;
  /**
   * Show button (default: true)
   * If false, only handles route change scrolling
   */
  showButton?: boolean;
  /**
   * Scroll behavior (default: "smooth")
   */
  behavior?: ScrollBehavior;
}

interface ScrollToTopState {
  isVisible: boolean;
}

/**
 * Scroll To Top Component
 * Handles both route change scrolling and scroll-to-top button
 */
class ScrollToTop extends Component<ScrollToTopProps, ScrollToTopState> {
  private scrollTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ScrollToTopProps) {
    super(props);
    this.state = {
      isVisible: false,
    };
  }

  componentDidMount(): void {
    const { showButton = true } = this.props;
    if (showButton) {
      window.addEventListener("scroll", this.handleScroll);
    }
  }

  componentWillUnmount(): void {
    const { showButton = true } = this.props;
    if (showButton) {
      window.removeEventListener("scroll", this.handleScroll);
    }
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
  }

  private handleScroll = (): void => {
    const { threshold = 300 } = this.props;
    const isVisible = window.pageYOffset > threshold;
    this.setState({ isVisible });
  };

  private scrollToTop = (): void => {
    const { behavior = "smooth" } = this.props;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : behavior;
    
    window.scrollTo({
      top: 0,
      behavior: scrollBehavior,
    });
  };

  render(): React.ReactNode {
    const { showButton = true } = this.props;
    const { isVisible } = this.state;

    if (!showButton) {
      return null;
    }

    return (
      <button
        className={`scroll-to-top ${isVisible ? "is-visible" : ""}`}
        onClick={this.scrollToTop}
        aria-label="Scroll to top"
        title="Kembali ke atas"
        type="button"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          aria-hidden="true"
        >
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

/**
 * Route Change Scroll Handler (HOC)
 * Handles scrolling on route changes
 */
export const RouteScrollHandler: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;


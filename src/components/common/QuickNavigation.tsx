/**
 * Quick Navigation Component (OOP)
 * Class-based component following SOLID principles
 * Sticky navigation for easy section access
 */

import React, { Component, RefObject } from "react";
import "../../styles/QuickNavigation.css";

interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface QuickNavigationState {
  activeSection: string;
  isVisible: boolean;
}

interface QuickNavigationProps {
  items: NavigationItem[];
  threshold?: number;
}

/**
 * Quick Navigation Component
 * Provides sticky navigation for easy section access
 */
class QuickNavigation extends Component<QuickNavigationProps, QuickNavigationState> {
  private baseClass: string = "quickNavigation";
  private navRef: RefObject<HTMLElement>;
  private intersectionObserver: IntersectionObserver | null = null;
  private scrollTimeout: NodeJS.Timeout | null = null;

  constructor(props: QuickNavigationProps) {
    super(props);
    this.state = {
      activeSection: "",
      isVisible: false,
    };
    this.navRef = React.createRef();
  }

  componentDidMount(): void {
    this.setupScrollListener();
    this.setupIntersectionObserver();
  }

  componentWillUnmount(): void {
    if (this.cleanupScrollListener) {
      this.cleanupScrollListener();
    }
    this.cleanupIntersectionObserver();
  }

  private cleanupScrollListener: (() => void) | null = null;

  private setupScrollListener(): void {
    if (typeof window === "undefined") return;

    const handleScroll = (): void => {
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      this.scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY;
        const threshold = this.props.threshold || 300;
        this.setState({ isVisible: scrollY > threshold });

        // Find active section
        const sections = this.props.items.map((item) => {
          const element = document.getElementById(item.id);
          return {
            id: item.id,
            element,
            top: element ? element.getBoundingClientRect().top + scrollY : 0,
          };
        });

        const currentSection = sections
          .filter((s) => s.element)
          .reverse()
          .find((s) => scrollY >= s.top - 100);

        if (currentSection) {
          this.setState({ activeSection: currentSection.id });
        }
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    this.cleanupScrollListener = () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }

  private setupIntersectionObserver(): void {
    if (typeof window === "undefined" || !window.IntersectionObserver) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) {
              this.setState({ activeSection: id });
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    this.props.items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        this.intersectionObserver?.observe(element);
      }
    });
  }

  private cleanupIntersectionObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  private handleNavClick = (id: string): void => {
    const element = document.getElementById(id);
    if (!element) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollBehavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: scrollBehavior,
    });

    this.setState({ activeSection: id });
  };

  render(): React.ReactNode {
    const { items } = this.props;
    const { activeSection, isVisible } = this.state;

    if (!isVisible) return null;

    return (
      <nav
        ref={this.navRef}
        className={this.baseClass}
        aria-label="Quick navigation"
        role="navigation"
      >
        <div className={`${this.baseClass}__container`}>
          {items.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${this.baseClass}__item ${isActive ? `${this.baseClass}__item--active` : ""}`}
                onClick={() => this.handleNavClick(item.id)}
                aria-label={`Jump to ${item.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                {item.icon && <span className={`${this.baseClass}__icon`}>{item.icon}</span>}
                <span className={`${this.baseClass}__label`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
}

export default QuickNavigation;


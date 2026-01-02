/**
 * Review Auto Scroll Component
 * Luxury auto-scrolling container for reviews
 * OOP-based class component following SOLID principles
 * Auto-scrolls from left to right with pause on hover
 */

import React, { Component, RefObject } from "react";
import "../../styles/reviews/ReviewAutoScroll.css";

export interface ReviewAutoScrollProps {
  children: React.ReactNode;
  speed?: number; // Scroll speed in pixels per second (default: 30)
  pauseOnHover?: boolean; // Pause scrolling on hover (default: true)
  gap?: number; // Gap between items in pixels (default: 32)
  className?: string;
}

interface ReviewAutoScrollState {
  isPaused: boolean;
  isVisible: boolean;
}

/**
 * Review Auto Scroll Component
 * Displays items in a horizontal auto-scrolling container
 * Follows Single Responsibility Principle: only handles auto-scroll logic
 */
export class ReviewAutoScroll extends Component<ReviewAutoScrollProps, ReviewAutoScrollState> {
  private baseClass: string = "review-auto-scroll";
  private scrollContainerRef: RefObject<HTMLDivElement>;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private scrollPosition: number = 0;
  private readonly DEFAULT_SPEED = 30; // pixels per second
  private readonly DEFAULT_GAP = 40; // Increased gap for better spacing between cards

  constructor(props: ReviewAutoScrollProps) {
    super(props);
    this.state = {
      isPaused: false,
      isVisible: false,
    };
    this.scrollContainerRef = React.createRef();
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
    this.startAutoScroll();
  }

  componentDidUpdate(prevProps: ReviewAutoScrollProps): void {
    if (prevProps.children !== this.props.children) {
      // Reset scroll position when children change
      this.scrollPosition = 0;
      if (this.scrollContainerRef.current) {
        this.scrollContainerRef.current.scrollLeft = 0;
      }
    }
  }

  componentWillUnmount(): void {
    this.stopAutoScroll();
    this.cleanupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    if (!this.scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setState({ isVisible: true });
            if (!this.state.isPaused) {
              this.startAutoScroll();
            }
          } else {
            this.setState({ isVisible: false });
            this.stopAutoScroll();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    observer.observe(this.scrollContainerRef.current);
  }

  private cleanupIntersectionObserver(): void {
    // Cleanup is handled by browser when element is removed
  }

  private startAutoScroll = (): void => {
    if (this.animationFrameId !== null) return;

    const animate = (timestamp: number): void => {
      if (this.lastTimestamp === 0) {
        this.lastTimestamp = timestamp;
      }

      const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Convert to seconds
      this.lastTimestamp = timestamp;

      if (!this.state.isPaused && this.state.isVisible) {
        const container = this.scrollContainerRef.current;
        if (container) {
          const speed = this.props.speed ?? this.DEFAULT_SPEED;
          const scrollAmount = speed * deltaTime;

          this.scrollPosition += scrollAmount;
          const contentWidth = container.scrollWidth / 2; // Divide by 2 because content is duplicated
          const maxScroll = contentWidth - container.clientWidth;

          if (this.scrollPosition >= maxScroll) {
            // Reset to start for seamless infinite scroll
            this.scrollPosition = 0;
            container.scrollLeft = 0;
          } else {
            container.scrollLeft = this.scrollPosition;
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  };

  private stopAutoScroll = (): void => {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTimestamp = 0;
  };

  private handleMouseEnter = (): void => {
    if (this.props.pauseOnHover !== false) {
      this.setState({ isPaused: true });
    }
  };

  private handleMouseLeave = (): void => {
    if (this.props.pauseOnHover !== false) {
      this.setState({ isPaused: false });
      if (this.state.isVisible) {
        this.startAutoScroll();
      }
    }
  };

  render(): React.ReactNode {
    const { children, className = "", gap = this.DEFAULT_GAP } = this.props;

    return (
      <div
        className={`${this.baseClass} ${className}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div
          ref={this.scrollContainerRef}
          className={`${this.baseClass}__container`}
          role="list"
          aria-label="Auto-scrolling reviews"
        >
          <div 
            className={`${this.baseClass}__content`}
            style={{ gap: `${gap}px` }}
          >
            {children}
            {/* Duplicate content for seamless infinite scroll */}
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default ReviewAutoScroll;


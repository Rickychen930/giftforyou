/**
 * Bouquet Card Horizontal Scroll Component
 * Luxury horizontal scroll for displaying bouquet cards
 * OOP-based class component following SOLID principles
 * Effective for many bouquets, elegant, and fully responsive
 */

import React, { Component, RefObject } from "react";
import "../../styles/collections/BouquetCardHorizontalScroll.css";
import { BouquetCardInternal } from "../cards/BouquetCard";
import type { BouquetCardProps } from "../cards/BouquetCard";

export interface BouquetCardHorizontalScrollProps {
  bouquets: BouquetCardProps[];
  loading?: boolean;
  onBouquetClick?: (bouquetId: string) => void;
  showNavigation?: boolean;
  showIndicators?: boolean;
  maxVisible?: number;
}

interface BouquetCardHorizontalScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  currentIndex: number;
  scrollPosition: number;
}

/**
 * Bouquet Card Horizontal Scroll Component
 * Displays bouquet cards in a horizontal scrollable container
 * Follows Single Responsibility Principle: only handles horizontal scroll layout
 */
export class BouquetCardHorizontalScroll extends Component<
  BouquetCardHorizontalScrollProps,
  BouquetCardHorizontalScrollState
> {
  private baseClass: string = "bouquet-card-horizontal-scroll";
  private scrollContainerRef: RefObject<HTMLDivElement>;
  private scrollTimeout: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly SCROLL_DEBOUNCE = 150;
  // Dynamic card width calculation - responsive to viewport
  private getCardWidth(): number {
    if (typeof window === "undefined") return 280;
    const viewportWidth = window.innerWidth;
    // Match CSS clamp values: clamp(240px, 20vw, 280px)
    if (viewportWidth <= 640) return 240; // Mobile
    if (viewportWidth <= 1024) return Math.max(240, Math.min(280, viewportWidth * 0.2)); // Tablet
    return 280; // Desktop
  }
  
  private getCardGap(): number {
    if (typeof window === "undefined") return 24;
    const viewportWidth = window.innerWidth;
    // Match CSS gap: clamp(var(--space-4), 2vw, var(--space-6))
    // --space-4 = 16px, --space-6 = 24px
    if (viewportWidth <= 640) return 16; // Mobile
    if (viewportWidth <= 1024) return Math.max(16, Math.min(24, viewportWidth * 0.02)); // Tablet
    return 24; // Desktop
  }

  constructor(props: BouquetCardHorizontalScrollProps) {
    super(props);
    this.state = {
      canScrollLeft: false,
      canScrollRight: true,
      currentIndex: 0,
      scrollPosition: 0,
    };
    this.scrollContainerRef = React.createRef();
  }

  /**
   * Prevent unnecessary re-renders when props haven't changed
   */
  shouldComponentUpdate(nextProps: BouquetCardHorizontalScrollProps, nextState: BouquetCardHorizontalScrollState): boolean {
    const { bouquets, loading } = this.props;
    const { canScrollLeft, canScrollRight, currentIndex, scrollPosition } = this.state;

    return (
      nextProps.loading !== loading ||
      nextProps.bouquets.length !== bouquets.length ||
      nextProps.bouquets !== bouquets ||
      nextState.canScrollLeft !== canScrollLeft ||
      nextState.canScrollRight !== canScrollRight ||
      nextState.currentIndex !== currentIndex ||
      nextState.scrollPosition !== scrollPosition
    );
  }

  componentDidMount(): void {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      this.updateScrollButtons();
      this.setupScrollListener();
      this.setupResizeObserver();
    });
  }

  componentDidUpdate(prevProps: BouquetCardHorizontalScrollProps): void {
    if (prevProps.bouquets.length !== this.props.bouquets.length) {
      this.updateScrollButtons();
    }
  }

  componentWillUnmount(): void {
    this.cleanupScrollListener();
    this.cleanupResizeObserver();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  private setupScrollListener(): void {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", this.handleScroll, { passive: true });
  }

  private cleanupScrollListener(): void {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    container.removeEventListener("scroll", this.handleScroll);
  }

  private setupResizeObserver(): void {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    // Use ResizeObserver to handle container size changes for responsive design
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        // Debounce resize updates
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        this.scrollTimeout = window.setTimeout(() => {
          this.updateScrollButtons();
        }, this.SCROLL_DEBOUNCE);
      });
      this.resizeObserver.observe(container);
    }
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private handleScroll = (): void => {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = window.setTimeout(() => {
      this.updateScrollButtons();
      this.updateCurrentIndex();
    }, this.SCROLL_DEBOUNCE);
  };

  private updateScrollButtons(): void {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const canScrollLeft = scrollLeft > 0;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 10; // 10px threshold

    this.setState({
      canScrollLeft,
      canScrollRight,
      scrollPosition: scrollLeft,
    });
  }

  private updateCurrentIndex(): void {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const cardWidth = this.getCardWidth() + this.getCardGap();
    const index = Math.round(scrollLeft / cardWidth);

    this.setState({ currentIndex: index });
  }

  private scrollTo = (direction: "left" | "right"): void => {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = this.getCardWidth() + this.getCardGap();
    const currentScroll = container.scrollLeft;
    const targetScroll =
      direction === "left"
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  private scrollToIndex = (index: number): void => {
    const container = this.scrollContainerRef.current;
    if (!container) return;

    const cardWidth = this.getCardWidth() + this.getCardGap();
    const targetScroll = index * cardWidth;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  private handlePrevClick = (): void => {
    this.scrollTo("left");
  };

  private handleNextClick = (): void => {
    this.scrollTo("right");
  };

  private renderNavigationButtons(): React.ReactNode {
    const { showNavigation = true } = this.props;
    if (!showNavigation) return null;

    const { canScrollLeft, canScrollRight } = this.state;

    return (
      <>
        {canScrollLeft && (
          <button
            type="button"
            className={`${this.baseClass}__nav-btn ${this.baseClass}__nav-btn--prev`}
            onClick={this.handlePrevClick}
            aria-label="Scroll ke kiri"
            title="Scroll ke kiri"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            className={`${this.baseClass}__nav-btn ${this.baseClass}__nav-btn--next`}
            onClick={this.handleNextClick}
            aria-label="Scroll ke kanan"
            title="Scroll ke kanan"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </>
    );
  }

  private renderIndicators(): React.ReactNode {
    const { showIndicators = true, bouquets } = this.props;
    if (!showIndicators || bouquets.length <= 4) return null;

    const container = this.scrollContainerRef.current;
    if (!container) return null;

    const { scrollLeft, clientWidth } = container;
    const cardWidth = this.getCardWidth() + this.getCardGap();
    const visibleCards = Math.max(1, Math.floor(clientWidth / cardWidth));
    const totalPages = Math.ceil(bouquets.length / visibleCards);
    const currentPage = Math.min(
      Math.floor(scrollLeft / (cardWidth * visibleCards)),
      totalPages - 1
    );

    if (totalPages <= 1) return null;

    return (
      <div className={`${this.baseClass}__indicators`} aria-hidden="true">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${this.baseClass}__indicator ${
              currentPage === index ? `${this.baseClass}__indicator--active` : ""
            }`}
            onClick={() => {
              const targetScroll = index * cardWidth * visibleCards;
              container.scrollTo({
                left: targetScroll,
                behavior: "smooth",
              });
            }}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    );
  }

  render(): React.ReactNode {
    const { bouquets, loading = false, maxVisible } = this.props;
    const displayBouquets = maxVisible
      ? bouquets.slice(0, maxVisible)
      : bouquets;

    if (loading) {
      return (
        <div className={this.baseClass} aria-busy="true" aria-live="polite">
          <div className={`${this.baseClass}__container`}>
            <div className={`${this.baseClass}__scroll`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`${this.baseClass}__skeleton`}
                  aria-hidden="true"
                >
                  <div className={`${this.baseClass}__skeleton-image`} />
                  <div className={`${this.baseClass}__skeleton-body`}>
                    <div className={`${this.baseClass}__skeleton-title`} />
                    <div className={`${this.baseClass}__skeleton-price`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (displayBouquets.length === 0) {
      return null;
    }

    return (
      <div className={this.baseClass} role="region" aria-label="Bouquet cards scroll">
        <div className={`${this.baseClass}__wrapper`}>
          <div
            ref={this.scrollContainerRef}
            className={`${this.baseClass}__container`}
            role="list"
            aria-label="Bouquet cards"
          >
            <div className={`${this.baseClass}__scroll`}>
              {displayBouquets.map((bouquet) => (
                <div
                  key={bouquet._id}
                  className={`${this.baseClass}__item`}
                  role="listitem"
                >
                  <BouquetCardInternal
                    _id={bouquet._id}
                    name={bouquet.name}
                    description={bouquet.description}
                    price={bouquet.price}
                    type={bouquet.type}
                    size={bouquet.size}
                    image={bouquet.image}
                    status={bouquet.status}
                    collectionName={bouquet.collectionName}
                    customPenanda={bouquet.customPenanda || []}
                    isNewEdition={bouquet.isNewEdition}
                    isFeatured={bouquet.isFeatured}
                  />
                </div>
              ))}
            </div>
          </div>
          {this.renderNavigationButtons()}
        </div>
        {this.renderIndicators()}
      </div>
    );
  }
}

export default BouquetCardHorizontalScroll;


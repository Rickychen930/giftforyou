/**
 * Bouquet Card Grid Component
 * Optimized grid layout for displaying multiple bouquet cards
 * OOP-based class component following SOLID principles
 * Luxury, elegant, efficient, and fully responsive
 */

import React, { Component, RefObject } from "react";
import "../../styles/collections/BouquetCardGrid.css";
import { BouquetCardInternal } from "../cards/BouquetCard";
import type { BouquetCardProps } from "../cards/BouquetCard";

export interface BouquetCardGridProps {
  bouquets: BouquetCardProps[];
  columns?: number;
  loading?: boolean;
  onBouquetClick?: (bouquetId: string) => void;
  maxVisible?: number;
}

interface BouquetCardGridState {
  visibleCount: number;
  isIntersecting: boolean;
}

/**
 * Bouquet Card Grid Component
 * Efficiently displays bouquet cards with lazy loading
 * Follows Single Responsibility Principle: only handles grid layout
 */
export class BouquetCardGrid extends Component<BouquetCardGridProps, BouquetCardGridState> {
  private baseClass: string = "bouquet-card-grid";
  private containerRef: RefObject<HTMLDivElement>;
  private intersectionObserver: IntersectionObserver | null = null;
  private readonly INITIAL_VISIBLE = 12;
  private readonly LOAD_MORE_COUNT = 12;
  private readonly LOAD_MORE_THRESHOLD = 0.7;

  constructor(props: BouquetCardGridProps) {
    super(props);
    const { maxVisible, bouquets } = props;
    this.state = {
      visibleCount: maxVisible || Math.min(this.INITIAL_VISIBLE, bouquets.length),
      isIntersecting: false,
    };
    this.containerRef = React.createRef();
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
  }

  componentDidUpdate(prevProps: BouquetCardGridProps): void {
    if (prevProps.bouquets.length !== this.props.bouquets.length) {
      // Reset visible count when bouquets change
      const { maxVisible, bouquets } = this.props;
      this.setState({
        visibleCount: maxVisible || Math.min(this.INITIAL_VISIBLE, bouquets.length),
      });
      // Re-setup observer if container ref exists
      if (this.containerRef.current && !this.intersectionObserver) {
        this.setupIntersectionObserver();
      }
    }
  }

  componentWillUnmount(): void {
    this.cleanupIntersectionObserver();
  }

  private setupIntersectionObserver(): void {
    if (!this.containerRef.current) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.setState({ isIntersecting: true });
            this.loadMoreIfNeeded();
          }
        });
      },
      {
        threshold: this.LOAD_MORE_THRESHOLD,
        rootMargin: "300px",
      }
    );

    this.intersectionObserver.observe(this.containerRef.current);
  }

  private cleanupIntersectionObserver(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  private loadMoreIfNeeded(): void {
    const { bouquets, maxVisible } = this.props;
    const { visibleCount } = this.state;

    const maxCount = maxVisible || bouquets.length;

    if (visibleCount < maxCount) {
      // Load more bouquets when user scrolls near the end
      requestAnimationFrame(() => {
        this.setState((prevState) => ({
          visibleCount: Math.min(
            prevState.visibleCount + this.LOAD_MORE_COUNT,
            maxCount
          ),
        }));
      });
    }
  }

  // Removed getGridColumns - now using CSS auto-fill grid for better performance

  render(): React.ReactNode {
    const { bouquets, loading = false, columns } = this.props;
    const { visibleCount } = this.state;

    // Get grid style if columns prop is provided
    const gridStyle = columns
      ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
      : undefined;

    if (loading) {
      return (
        <div className={this.baseClass} aria-busy="true" aria-live="polite">
          <div
            className={`${this.baseClass}__grid`}
            style={gridStyle}
          >
            {Array.from({ length: this.INITIAL_VISIBLE }).map((_, i) => (
              <div key={i} className={`${this.baseClass}__skeleton`} aria-hidden="true">
                <div className={`${this.baseClass}__skeleton-image`} />
                <div className={`${this.baseClass}__skeleton-body`}>
                  <div className={`${this.baseClass}__skeleton-title`} />
                  <div className={`${this.baseClass}__skeleton-price`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (bouquets.length === 0) {
      return null;
    }

    const visibleBouquets = bouquets.slice(0, visibleCount);
    const hasMore = bouquets.length > visibleCount;

    return (
      <div
        ref={this.containerRef}
        className={this.baseClass}
        role="region"
        aria-label="Bouquet cards grid"
      >
        <div
          className={`${this.baseClass}__grid`}
          style={gridStyle}
        >
          {visibleBouquets.map((bouquet) => (
            <BouquetCardInternal
              key={bouquet._id}
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
          ))}
        </div>

        {hasMore && (
          <div className={`${this.baseClass}__load-more-indicator`} aria-hidden="true">
            <div className={`${this.baseClass}__load-more-dots`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default BouquetCardGrid;


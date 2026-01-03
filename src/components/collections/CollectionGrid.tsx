/**
 * Collection Grid Component
 * Efficient grid layout for displaying multiple collections
 * OOP-based class component following SOLID principles
 * Luxury, elegant, clean UI/UX, and fully responsive
 */

import React, { Component, RefObject } from "react";
import "../../styles/collections/CollectionGrid.css";
import CollectionCard, { type CollectionContainerProps } from "../cards/CollectionCard";

export interface CollectionGridProps {
  collections: Array<{
    id: string;
    name: string;
    description: string;
    bouquets: CollectionContainerProps["bouquets"];
  }>;
  loading?: boolean;
  onCollectionClick?: (collectionId: string) => void;
}

interface CollectionGridState {
  visibleCollections: number;
  isIntersecting: boolean;
}

/**
 * Collection Grid Component
 * Efficiently displays multiple collections with lazy loading
 * Follows Single Responsibility Principle: only handles grid layout
 */
export class CollectionGrid extends Component<CollectionGridProps, CollectionGridState> {
  private baseClass: string = "collection-grid";
  private containerRef: RefObject<HTMLDivElement>;
  private intersectionObserver: IntersectionObserver | null = null;
  private readonly INITIAL_VISIBLE = 3;
  private readonly LOAD_MORE_THRESHOLD = 0.8;
  // Cache for prepared collections to avoid recalculation
  private preparedCollectionsCache: {
    key: string;
    result: Array<{
      id: string;
      name: string;
      description: string;
      bouquets: CollectionContainerProps["bouquets"];
    }>;
  } | null = null;

  constructor(props: CollectionGridProps) {
    super(props);
    this.state = {
      visibleCollections: this.INITIAL_VISIBLE,
      isIntersecting: false,
    };
    this.containerRef = React.createRef();
  }

  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Enhanced with edge case handling
   */
  shouldComponentUpdate(nextProps: CollectionGridProps, nextState: CollectionGridState): boolean {
    const { collections, loading } = this.props;
    const { visibleCollections, isIntersecting } = this.state;

    // Edge case: handle null/undefined collections
    const safeCollections = Array.isArray(collections) ? collections : [];
    const safeNextCollections = Array.isArray(nextProps.collections) ? nextProps.collections : [];

    return (
      nextProps.loading !== loading ||
      safeNextCollections.length !== safeCollections.length ||
      nextProps.collections !== collections ||
      nextState.visibleCollections !== visibleCollections ||
      nextState.isIntersecting !== isIntersecting
    );
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
  }

  componentDidUpdate(prevProps: CollectionGridProps): void {
    // Edge case: handle null/undefined collections
    const prevCollections = Array.isArray(prevProps.collections) ? prevProps.collections : [];
    const currentCollections = Array.isArray(this.props.collections) ? this.props.collections : [];
    
    if (prevCollections.length !== currentCollections.length) {
      // Reset visible count when collections change
      this.setState({ visibleCollections: this.INITIAL_VISIBLE });
      // Re-setup observer if container ref exists and observer is not set
      if (this.containerRef.current && !this.intersectionObserver) {
        this.setupIntersectionObserver();
      }
    }
  }


  private setupIntersectionObserver(): void {
    if (!this.containerRef.current || this.intersectionObserver) return;

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
        rootMargin: "200px",
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

  private loadMoreTimeout: number | null = null;

  private loadMoreIfNeeded(): void {
    const { collections } = this.props;
    const { visibleCollections } = this.state;

    // Edge case: handle null/undefined collections
    const safeCollections = Array.isArray(collections) ? collections : [];
    const maxCollections = safeCollections.length;

    if (visibleCollections >= maxCollections) return;

    // Throttle load more operations to prevent excessive state updates
    if (this.loadMoreTimeout) {
      return;
    }

    this.loadMoreTimeout = window.setTimeout(() => {
      this.loadMoreTimeout = null;
      // Load more collections when user scrolls near the end
      requestAnimationFrame(() => {
        this.setState((prevState) => ({
          visibleCollections: Math.min(
            prevState.visibleCollections + 2,
            maxCollections
          ),
        }));
      });
    }, 100); // Throttle to max once per 100ms
  }

  componentWillUnmount(): void {
    this.cleanupIntersectionObserver();
    if (this.loadMoreTimeout) {
      clearTimeout(this.loadMoreTimeout);
      this.loadMoreTimeout = null;
    }
  }

  private handleCollectionClick = (collectionId: string): void => {
    this.props.onCollectionClick?.(collectionId);
  };

  render(): React.ReactNode {
    const { collections, loading = false } = this.props;
    const { visibleCollections } = this.state;

    // Edge case: handle loading state
    if (loading) {
      return (
        <div className={this.baseClass} aria-busy="true" aria-live="polite">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${this.baseClass}__skeleton`} aria-hidden="true">
              <div className={`${this.baseClass}__skeleton-header`} />
              <div className={`${this.baseClass}__skeleton-grid`}>
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className={`${this.baseClass}__skeleton-card`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Edge case: handle null/undefined/empty collections
    const safeCollections = Array.isArray(collections) ? collections : [];
    if (safeCollections.length === 0) {
      return null;
    }

    // Edge case: ensure visibleCollections is within bounds
    const maxVisible = Math.min(visibleCollections, safeCollections.length);
    const visibleItems = safeCollections.slice(0, maxVisible);

    return (
      <div
        ref={this.containerRef}
        className={this.baseClass}
        role="region"
        aria-label="Collections grid"
      >
        {visibleItems.map((collection, index) => {
          // Edge case: validate collection data before rendering
          if (!collection || !collection.id || !collection.name) {
            return null;
          }
          return (
            <CollectionCard
              key={collection.id}
              id={collection.id}
              name={collection.name}
              description={collection.description || ""}
              bouquets={Array.isArray(collection.bouquets) ? collection.bouquets : []}
              index={index}
            />
          );
        })}
      </div>
    );
  }
}

export default CollectionGrid;


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

  constructor(props: CollectionGridProps) {
    super(props);
    this.state = {
      visibleCollections: this.INITIAL_VISIBLE,
      isIntersecting: false,
    };
    this.containerRef = React.createRef();
  }

  componentDidMount(): void {
    this.setupIntersectionObserver();
  }

  componentDidUpdate(prevProps: CollectionGridProps): void {
    if (prevProps.collections.length !== this.props.collections.length) {
      // Reset visible count when collections change
      this.setState({ visibleCollections: this.INITIAL_VISIBLE });
      // Re-setup observer if container ref exists and observer is not set
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

  private loadMoreIfNeeded(): void {
    const { collections } = this.props;
    const { visibleCollections } = this.state;

    if (visibleCollections < collections.length) {
      // Load more collections when user scrolls near the end
      requestAnimationFrame(() => {
        this.setState((prevState) => ({
          visibleCollections: Math.min(
            prevState.visibleCollections + 2,
            collections.length
          ),
        }));
      });
    }
  }

  private handleCollectionClick = (collectionId: string): void => {
    this.props.onCollectionClick?.(collectionId);
  };

  render(): React.ReactNode {
    const { collections, loading = false } = this.props;
    const { visibleCollections } = this.state;

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

    if (collections.length === 0) {
      return null;
    }

    const visibleItems = collections.slice(0, visibleCollections);

    return (
      <div
        ref={this.containerRef}
        className={this.baseClass}
        role="region"
        aria-label="Collections grid"
      >
        {visibleItems.map((collection, index) => (
          <CollectionCard
            key={collection.id}
            id={collection.id}
            name={collection.name}
            description={collection.description}
            bouquets={collection.bouquets}
            index={index}
          />
        ))}
      </div>
    );
  }
}

export default CollectionGrid;


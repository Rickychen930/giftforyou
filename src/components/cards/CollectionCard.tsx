/**
 * Collection Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/CollectionCardComponent.css";
import type { BouquetCardProps } from "./BouquetCard";
import BouquetCardHorizontalScroll from "../collections/BouquetCardHorizontalScroll";

export interface CollectionContainerProps {
  id: string;
  name: string;
  description: string;
  bouquets: BouquetCardProps[];
  index?: number;
}

// Re-export BouquetCardProps for backward compatibility
export type { BouquetCardProps };

interface CollectionCardState {
  // No state needed, but keeping for consistency
}

/**
 * Collection Card Component
 * Class-based component for collection card display
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class CollectionCard extends Component<CollectionContainerProps, CollectionCardState> {
  private baseClass: string = "collectionCard";

  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimized: check primitive props first (cheaper), then reference equality
   * Enhanced with edge case handling
   */
  shouldComponentUpdate(nextProps: CollectionContainerProps): boolean {
    const { id, name, description, bouquets } = this.props;

    // Edge case: handle null/undefined props
    const safeBouquets = Array.isArray(bouquets) ? bouquets : [];
    const safeNextBouquets = Array.isArray(nextProps.bouquets) ? nextProps.bouquets : [];

    // Fast path: check primitive values first
    if (
      nextProps.id !== id ||
      nextProps.name !== name ||
      nextProps.description !== description ||
      safeNextBouquets.length !== safeBouquets.length
    ) {
      return true;
    }

    // Only check reference equality if lengths match (more expensive check)
    return nextProps.bouquets !== bouquets;
  }

  /**
   * Get valid bouquets with edge case handling
   */
  private getValidBouquets(): BouquetCardProps[] {
    // Edge case: handle null/undefined bouquets
    if (!this.props.bouquets) return [];
    if (!Array.isArray(this.props.bouquets)) return [];
    
    // Edge case: filter out invalid bouquets
    return this.props.bouquets.filter((bouquet) => 
      bouquet != null && 
      typeof bouquet === "object" && 
      bouquet._id && 
      typeof bouquet.name === "string"
    );
  }

  private getPreviewBouquets(): BouquetCardProps[] {
    // Show all bouquets in horizontal scroll for better UX
    return this.getValidBouquets();
  }

  // Memoized href to avoid recalculation
  private browseHrefCache: string | null = null;
  private browseHrefCacheKey: string | null = null;

  private getBrowseHref(): string {
    const { name } = this.props;
    // Cache href to avoid encoding on every render
    if (this.browseHrefCacheKey === name && this.browseHrefCache) {
      return this.browseHrefCache;
    }
    this.browseHrefCache = `/collection?name=${encodeURIComponent(name)}`;
    this.browseHrefCacheKey = name;
    return this.browseHrefCache;
  }

  // Removed renderBouquetCard - now using BouquetCardGrid component

  private renderEmptyState(): React.ReactNode {
    const browseHref = this.getBrowseHref();
    const { name } = this.props;

    return (
      <div className={`${this.baseClass}__empty`} role="status" aria-live="polite">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${this.baseClass}__emptyIcon`}
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className={`${this.baseClass}__emptyTitle`}>Lihat koleksi ini</p>
        <p className={`${this.baseClass}__emptyText`}>Lihat semua bouquet di koleksi ini.</p>

        <div className={`${this.baseClass}__emptyActions`}>
          <Link
            to={browseHref}
            className={`${this.baseClass}__ctaBtn`}
            aria-label={`Lihat koleksi ${name}`}
            title="Lihat koleksi"
          >
            Lihat koleksi
          </Link>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { name, description, index = 0 } = this.props;
    const validBouquets = this.getValidBouquets();
    const previewBouquets = this.getPreviewBouquets();
    const browseHref = this.getBrowseHref();

    return (
      <section
        className={this.baseClass}
        aria-label={`Koleksi ${name}`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <header className={`${this.baseClass}__header`}>
          <div className={`${this.baseClass}__heading`}>
            <div className={`${this.baseClass}__titleRow`}>
              <h2 className={`${this.baseClass}__title`}>{name}</h2>
              {validBouquets.length > 0 && (
                <span
                  className={`${this.baseClass}__count`}
                  aria-label={`${validBouquets.length} produk`}
                >
                  {validBouquets.length}
                </span>
              )}
            </div>
            <p className={`${this.baseClass}__description`}>{description}</p>
          </div>
        </header>

        {validBouquets.length === 0 ? (
          this.renderEmptyState()
        ) : (
          <div className={`${this.baseClass}__previewWrap`}>
            <BouquetCardHorizontalScroll
              bouquets={previewBouquets}
              loading={false}
              showNavigation={true}
              showIndicators={previewBouquets.length > 4}
              onBouquetClick={(bouquetId) => {
                // Optional: Handle bouquet click - navigation handled by BouquetCard component
                // Can be extended for analytics tracking if needed
              }}
            />

            {validBouquets.length > 0 && (
              <div className={`${this.baseClass}__footer`}>
                <Link
                  to={browseHref}
                  className={`${this.baseClass}__ctaBtn`}
                  aria-label={`Lihat semua ${validBouquets.length} bouquet di koleksi ${name}`}
                  title="Lihat semua bouquet"
                >
                  <span className={`${this.baseClass}__ctaText`}>
                    Lihat Semua Koleksi
                  </span>
                  <span className={`${this.baseClass}__ctaCount`}>
                    {validBouquets.length} produk
                  </span>
                  <svg
                    className={`${this.baseClass}__ctaIcon`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
}

export default CollectionCard;

// Backward compatibility: export as CollectionContainer
export { CollectionCard as CollectionContainer };


/**
 * Catalog Skeleton Component (OOP)
 * Class-based component following SOLID principles
 * Uses unified SkeletonLoader component
 */

import React, { Component } from "react";
import SkeletonLoader from "../common/SkeletonLoader";
import "../../styles/catalog/CatalogSkeleton.css";

export interface CatalogSkeletonProps {
  count?: number;
  showLoadingState?: boolean;
}

interface CatalogSkeletonState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Skeleton Component
 * Class-based component for catalog loading skeleton
 */
class CatalogSkeleton extends Component<CatalogSkeletonProps, CatalogSkeletonState> {
  private baseClass: string = "catalog-skeleton";

  private renderSkeletonCard(): React.ReactNode {
    return (
      <div className={`${this.baseClass}__card`}>
        <SkeletonLoader variant="rectangular" height={200} className={`${this.baseClass}__card-media`} />
        <div className={`${this.baseClass}__card-body`}>
          <SkeletonLoader variant="text" height={20} className={`${this.baseClass}__line ${this.baseClass}__line--title`} />
          <SkeletonLoader variant="text" height={16} className={`${this.baseClass}__line`} />
          <SkeletonLoader variant="text" height={16} width="60%" className={`${this.baseClass}__line ${this.baseClass}__line--short`} />
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { count = 6, showLoadingState = true } = this.props;

    return (
      <>
        {showLoadingState && (
          <div className={`${this.baseClass}__loading`} aria-live="polite" aria-busy="true">
            <div className={`${this.baseClass}__loading-content`}>
              <div className={`${this.baseClass}__spinner`}></div>
              <div className={`${this.baseClass}__loading-text`}>
                <strong>Memuat bouquet…</strong>
                <span>Mohon tunggu sebentar</span>
              </div>
            </div>
          </div>
        )}
        <div className={`${this.baseClass}__grid`} aria-hidden="true">
          {Array.from({ length: count }).map((_, idx) => (
            <React.Fragment key={idx}>{this.renderSkeletonCard()}</React.Fragment>
          ))}
        </div>
      </>
    );
  }
}

export default CatalogSkeleton;

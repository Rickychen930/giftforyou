import React from "react";
import "../../styles/catalog/CatalogSkeleton.css";

export interface CatalogSkeletonProps {
  count?: number;
  showLoadingState?: boolean;
}

const CatalogSkeleton: React.FC<CatalogSkeletonProps> = ({
  count = 6,
  showLoadingState = true,
}) => {
  return (
    <>
      {showLoadingState && (
        <div className="catalog-skeleton__loading" aria-live="polite" aria-busy="true">
          <div className="catalog-skeleton__loading-content">
            <div className="catalog-skeleton__spinner"></div>
            <div className="catalog-skeleton__loading-text">
              <strong>Memuat bouquet…</strong>
              <span>Mohon tunggu sebentar</span>
            </div>
          </div>
        </div>
      )}
      <div className="catalog-skeleton__grid" aria-hidden="true">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="catalog-skeleton__card">
            <div className="catalog-skeleton__card-media" />
            <div className="catalog-skeleton__card-body">
              <div className="catalog-skeleton__line catalog-skeleton__line--title" />
              <div className="catalog-skeleton__line" />
              <div className="catalog-skeleton__line catalog-skeleton__line--short" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CatalogSkeleton;


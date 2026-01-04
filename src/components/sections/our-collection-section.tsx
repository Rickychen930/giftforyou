/**
 * Our Collection Section Component
 * Luxury, elegant UI/UX with React Query, infinite scroll, and performance optimizations
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { useMemo, useEffect, useState, useRef, memo } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionContainer from "../collection-container-component";
import { prepareCollections } from "../../utils/collection-transformer";
import { useCollections } from "../../hooks/useCollections";
import ErrorBoundaryCollection from "../error-boundary-collection";
import type { Collection } from "../../models/domain/collection";

interface OurCollectionViewProps {
  items?: Collection[]; // Optional - if not provided, will fetch via React Query
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

// Enhanced Loading skeleton component with better animations
const CollectionSkeleton: React.FC<{ delay?: number }> = memo(({ delay = 0 }) => (
  <div 
    className="collectionCard collectionCard--skeleton" 
    aria-hidden="true"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="collectionCard__header">
      <div className="collectionCard__heading">
        <div className="skeleton skeleton--title skeleton--pulse"></div>
        <div className="skeleton skeleton--description skeleton--pulse"></div>
      </div>
    </div>
    <div className="collectionCard__scrollWrap">
      <div className="collectionCard__scroll">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bouquetCard bouquetCard--skeleton"
            style={{ animationDelay: `${delay + i * 100}ms` }}
          >
            <div className="skeleton skeleton--image skeleton--shimmer"></div>
            <div className="bouquetCard__body">
              <div className="skeleton skeleton--text skeleton--pulse"></div>
              <div className="skeleton skeleton--text skeleton--short skeleton--pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

CollectionSkeleton.displayName = "CollectionSkeleton";

// Error state component with retry functionality
const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = memo(({ message, onRetry }) => (
  <div className="ourCollection__error" role="alert" aria-live="polite">
    <div className="ourCollection__errorIcon" aria-hidden="true">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 9V13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 17H12.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3 className="ourCollection__errorTitle">Gagal memuat koleksi</h3>
    <p className="ourCollection__errorText">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ourCollection__errorRetry"
        aria-label="Coba lagi memuat koleksi"
      >
        Coba Lagi
      </button>
    )}
  </div>
));

ErrorState.displayName = "ErrorState";

// Empty state component
const EmptyState: React.FC = memo(() => (
  <div
    className="ourCollection__empty"
    role="status"
    aria-live="polite"
  >
    <div className="ourCollection__emptyIcon" aria-hidden="true">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3 className="ourCollection__emptyTitle">Belum ada koleksi</h3>
    <p className="ourCollection__emptyText">
      Silakan cek kembali — koleksi baru akan ditambahkan secara
      berkala.
    </p>
  </div>
));

EmptyState.displayName = "EmptyState";

const OurCollectionSection: React.FC<OurCollectionViewProps> = ({
  items: propItems,
  loading: propLoading,
  errorMessage: propErrorMessage,
  onRetry: propOnRetry,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Use React Query if items not provided via props
  const {
    data: queryData,
    isLoading: queryLoading,
    error: queryError,
    refetch: queryRefetch,
  } = useCollections({
    enabled: !propItems, // Only fetch if items not provided
  });

  // Determine which data source to use - memoized to prevent unnecessary recalculations
  const items = useMemo(() => {
    return propItems ?? queryData ?? [];
  }, [propItems, queryData]);

  const loading = propLoading ?? queryLoading;
  const errorMessage = propErrorMessage ?? (queryError?.message ?? "");
  const onRetry = propOnRetry ?? (() => queryRefetch());

  // Memoize prepared collections for performance
  const prepared = useMemo(() => {
    return prepareCollections(items);
  }, [items]);

  // Intersection Observer for scroll animations - using native API
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    observer.observe(currentSection);

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [isVisible]);

  return (
    <ErrorBoundaryCollection>
      <section
        ref={sectionRef}
        className={`ourCollection ${isVisible ? "ourCollection--visible" : ""}`}
        id="OurCollection"
        aria-labelledby="ourCollection-title"
      >
        <div className="ourCollection__container">
          <header className="ourCollection__header">
            <p className="ourCollection__eyebrow">Pilihan terbaik untuk setiap momen</p>

            <h2 id="ourCollection-title" className="ourCollection__title">
              Koleksi Kami
            </h2>

            <p className="ourCollection__subtitle">
              Bouquet dan gift arrangement pilihan untuk perayaan, kejutan, dan
              keseharian yang lebih elegan.
            </p>
          </header>

          {loading ? (
            <div
              className="ourCollection__grid ourCollection__grid--loading"
              aria-busy="true"
              aria-live="polite"
            >
              <CollectionSkeleton delay={0} />
              <CollectionSkeleton delay={150} />
              <CollectionSkeleton delay={300} />
            </div>
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={onRetry} />
          ) : !prepared.length ? (
            <EmptyState />
          ) : (
            <div className="ourCollection__grid ourCollection__grid--loaded">
              {prepared.map((c, index) => (
                <CollectionContainer
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  description={c.description}
                  bouquets={c.bouquets}
                  index={index}
                  style={{ 
                    "--card-index": index,
                    animationDelay: `${index * 100}ms`
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </ErrorBoundaryCollection>
  );
};

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: OurCollectionViewProps, nextProps: OurCollectionViewProps): boolean => {
  // If loading state changed, allow re-render
  if (prevProps.loading !== nextProps.loading) return false;
  
  // If error message changed, allow re-render
  if (prevProps.errorMessage !== nextProps.errorMessage) return false;
  
  // Compare items array
  if (prevProps.items?.length !== nextProps.items?.length) return false;
  
  // Compare items by reference and key fields
  if (prevProps.items !== nextProps.items) {
    if (!prevProps.items || !nextProps.items) return false;
    
    const prevIds = prevProps.items.map((item: Collection) => {
      const anyC = item as { _id?: string; id?: string; name?: string };
      return anyC?._id ?? anyC?.id ?? anyC?.name ?? "";
    }).sort().join(",");
    
    const nextIds = nextProps.items.map((item: Collection) => {
      const anyC = item as { _id?: string; id?: string; name?: string };
      return anyC?._id ?? anyC?.id ?? anyC?.name ?? "";
    }).sort().join(",");
    
    if (prevIds !== nextIds) return false;
  }
  
  return true;
};

// Memoize component with custom comparison for optimal performance
export default memo(OurCollectionSection, arePropsEqual);

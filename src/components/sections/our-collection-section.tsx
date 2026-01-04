// src/components/sections/our-collection-section.tsx
import React, { useMemo, useEffect, useRef, useState, useCallback, memo } from "react";
import "../../styles/OurCollectionSection.css";
import CollectionContainer from "../collection-container-component";
import { prepareCollections } from "../../utils/collection-transformer";
import type { Collection } from "../../models/domain/collection";

interface OurCollectionViewProps {
  items: Collection[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

// Loading skeleton component - memoized for performance
const CollectionSkeleton: React.FC = memo(() => (
  <div className="collectionCard collectionCard--skeleton" aria-hidden="true">
    <div className="collectionCard__header">
      <div className="collectionCard__heading">
        <div className="skeleton skeleton--title"></div>
        <div className="skeleton skeleton--description"></div>
      </div>
    </div>
    <div className="collectionCard__scrollWrap">
      <div className="collectionCard__scroll">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bouquetCard bouquetCard--skeleton">
            <div className="skeleton skeleton--image"></div>
            <div className="bouquetCard__body">
              <div className="skeleton skeleton--text"></div>
              <div className="skeleton skeleton--text skeleton--short"></div>
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
  items,
  loading = false,
  errorMessage = "",
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoize prepared collections for performance
  const prepared = useMemo(() => {
    return prepareCollections(items ?? []);
  }, [items]);

  // Intersection Observer callback - memoized and optimized
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after visible to prevent unnecessary callbacks
          if (observerRef.current && sectionRef.current) {
            observerRef.current.unobserve(sectionRef.current);
          }
        }
      });
    });
  }, []);

  // Intersection Observer for scroll animations - optimized with single observer
  useEffect(() => {
    const currentSection = sectionRef.current;
    if (!currentSection || isVisible) return; // Don't create observer if already visible

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    observerRef.current.observe(currentSection);

    return () => {
      if (observerRef.current && currentSection) {
        observerRef.current.unobserve(currentSection);
        observerRef.current = null;
      }
    };
  }, [handleIntersection, isVisible]);

  return (
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
            className="ourCollection__grid"
            aria-busy="true"
            aria-live="polite"
          >
            <CollectionSkeleton />
            <CollectionSkeleton />
          </div>
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : !prepared.length ? (
          <EmptyState />
        ) : (
          <div className="ourCollection__grid">
            {prepared.map((c, index) => (
              <CollectionContainer
                key={c.id}
                id={c.id}
                name={c.name}
                description={c.description}
                bouquets={c.bouquets}
                index={index}
                style={{ "--card-index": index } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: OurCollectionViewProps, nextProps: OurCollectionViewProps): boolean => {
  // If loading state changed, allow re-render
  if (prevProps.loading !== nextProps.loading) return false;
  
  // If error message changed, allow re-render
  if (prevProps.errorMessage !== nextProps.errorMessage) return false;
  
  // Deep compare items array
  if (prevProps.items.length !== nextProps.items.length) return false;
  
  // Compare items by reference and key fields (shallow comparison is enough for arrays)
  // Since items come from API and are replaced, reference comparison should work
  if (prevProps.items !== nextProps.items) {
    // Only re-render if items actually changed (by ID comparison)
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

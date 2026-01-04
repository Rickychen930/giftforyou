/**
 * Infinite Scroll Bouquet Grid Component
 * Combines react-window virtualization with infinite scroll
 * Follows SOLID, DRY, MVP principles
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useInView } from "../hooks/useInView";
import { useInfiniteBouquets, type BouquetQueryParams, type BouquetResponse } from "../hooks/useBouquets";
import VirtualizedBouquetGrid from "./virtualized-bouquet-grid";
import BouquetCard from "./bouquet-card-component";
import GridErrorBoundary from "./grid-error-boundary";
import type { InfiniteData } from "@tanstack/react-query";
import "../styles/InfiniteBouquetGrid.css";

interface InfiniteBouquetGridProps {
  filters?: Omit<BouquetQueryParams, "page">;
  useVirtualization?: boolean;
  containerHeight?: number;
}

const InfiniteBouquetGrid: React.FC<InfiniteBouquetGridProps> = ({
  filters = {},
  useVirtualization = true,
  containerHeight = 800,
}) => {
  const [containerWidth, setContainerWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
  });

  // Detect mobile for better UX (disable virtualization on mobile)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch bouquets with infinite scroll
  // React Query automatically resets when queryKey changes (filters are in queryKey)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useInfiniteBouquets(filters);

  // Flatten all pages into a single array with deduplication
  // Handle edge cases: null/undefined data, invalid pages, missing bouquets
  const allBouquets = useMemo(() => {
    if (!data) return [];
    if (!data.pages) return [];
    if (!Array.isArray(data.pages)) return [];
    
    try {
      const all = (data as InfiniteData<BouquetResponse>).pages.flatMap((page: BouquetResponse | null | undefined) => {
        // Handle null/undefined pages
        if (!page || typeof page !== "object") return [];
        // Ensure page.bouquets is an array
        if (!Array.isArray(page.bouquets)) return [];
        // Filter out null/undefined bouquets
        return page.bouquets.filter((b): b is NonNullable<typeof b> => b != null && typeof b === "object");
      });
      
      // Deduplicate by _id to prevent duplicate items
      const seen = new Set<string>();
      return all.filter((bouquet) => {
        if (!bouquet || typeof bouquet !== "object") return false;
        if (!bouquet._id) return false;
        const id = String(bouquet._id);
        if (!id || id === "undefined" || id === "null") return false;
        if (seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      });
    } catch (error) {
      console.error("[InfiniteBouquetGrid] Error processing bouquets:", error);
      return [];
    }
  }, [data]);

  // Handle container width changes with ResizeObserver for better performance
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial width
    updateWidth();

    // Use ResizeObserver for more efficient width tracking
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize for older browsers
    window.addEventListener("resize", updateWidth);
    
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Network offline detection
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isOffline) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isOffline]);

  // Skeleton loading component
  const SkeletonCard = useCallback(() => (
    <div className="infinite-grid-skeleton-card" aria-hidden="true">
      <div className="infinite-grid-skeleton-card__image" />
      <div className="infinite-grid-skeleton-card__body">
        <div className="infinite-grid-skeleton-card__line infinite-grid-skeleton-card__line--title" />
        <div className="infinite-grid-skeleton-card__line infinite-grid-skeleton-card__line--medium" />
        <div className="infinite-grid-skeleton-card__line infinite-grid-skeleton-card__line--short" />
      </div>
    </div>
  ), []);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="infinite-grid-loading" aria-live="polite" aria-busy="true">
        <div className="infinite-grid-skeleton-grid" role="list" aria-label="Memuat bouquet">
          {Array.from({ length: 12 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
        <div className="infinite-grid-loading__message">
          <div className="infinite-grid-spinner">
            <div className="becSpinner" style={{ width: "24px", height: "24px", borderWidth: "2px" }}></div>
          </div>
          <p>Memuat bouquet...</p>
        </div>
      </div>
    );
  }

  // Error state with better recovery
  if (error) {
    return (
      <div className="infinite-grid-error" role="alert">
        <div className="infinite-grid-error__icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="infinite-grid-error__title">Gagal Memuat Bouquet</h3>
        <p className="infinite-grid-error__message">
          {isOffline
            ? "Tidak ada koneksi internet. Pastikan perangkat Anda terhubung ke internet."
            : error.message || "Terjadi kesalahan saat memuat data. Silakan coba lagi."}
        </p>
        <div className="infinite-grid-error__actions">
          <button
            onClick={() => refetch()}
            className="infinite-grid-retry"
            disabled={isRefetching || isOffline}
            aria-label="Coba muat ulang bouquet"
          >
            {isRefetching ? (
              <>
                <div className="becSpinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                <span>Memuat ulang...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M1 4v6h6M23 20v-6h-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.49 9A9 9 0 003.51 15M3.51 9a9 9 0 0016.98 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Coba Lagi</span>
              </>
            )}
          </button>
          {isOffline && (
            <p className="infinite-grid-error__offline-hint">
              Periksa koneksi internet Anda dan coba lagi.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (allBouquets.length === 0) {
    return (
      <div className="infinite-grid-empty" role="status">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>
        <h3>Tidak ada bouquet ditemukan</h3>
        <p>Coba sesuaikan filter atau hapus beberapa filter untuk melihat lebih banyak hasil.</p>
      </div>
    );
  }

  // Disable virtualization on mobile for better UX
  // Ensure containerWidth is valid before using virtualization
  const safeContainerWidth = typeof containerWidth === "number" && Number.isFinite(containerWidth) && containerWidth > 0
    ? containerWidth
    : 1200;
  const safeContainerHeight = typeof containerHeight === "number" && Number.isFinite(containerHeight) && containerHeight > 0
    ? containerHeight
    : 800;
  const shouldUseVirtualization = useVirtualization && !isMobile && safeContainerWidth > 0 && allBouquets.length > 0;

  return (
    <GridErrorBoundary>
      <div className="infinite-grid-wrapper" ref={containerRef}>
        {shouldUseVirtualization ? (
          <VirtualizedBouquetGrid
            bouquets={allBouquets}
            containerWidth={safeContainerWidth}
            containerHeight={safeContainerHeight}
            gap={16}
          />
        ) : (
        <div className="infinite-grid-standard" role="list" aria-label="Daftar bouquet">
          {allBouquets.map((bouquet) => {
            // Validate bouquet before rendering
            if (!bouquet || typeof bouquet !== "object" || !bouquet._id) {
              return null;
            }
            return (
              <BouquetCard
                key={String(bouquet._id)}
                _id={String(bouquet._id)}
                name={bouquet.name || ""}
                description={bouquet.description}
                price={typeof bouquet.price === "number" ? bouquet.price : 0}
                type={bouquet.type}
                size={bouquet.size}
                image={bouquet.image}
                status={bouquet.status || "ready"}
                collectionName={bouquet.collectionName}
                customPenanda={Array.isArray(bouquet.customPenanda) ? bouquet.customPenanda : []}
                isNewEdition={Boolean(bouquet.isNewEdition)}
                isFeatured={Boolean(bouquet.isFeatured)}
              />
            );
          })}
        </div>
      )}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="infinite-grid-load-more">
          {isFetchingNextPage ? (
            <div className="infinite-grid-load-more__loading">
              <div className="infinite-grid-skeleton-grid infinite-grid-skeleton-grid--compact" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
              <div className="infinite-grid-spinner">
                <div className="becSpinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
                <span>Memuat lebih banyak...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="infinite-grid-load-more-btn"
              aria-label="Muat lebih banyak bouquet"
              disabled={isOffline}
            >
              <span>Muat Lebih Banyak</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && allBouquets.length > 0 && (
        <div className="infinite-grid-end" role="status" aria-live="polite">
          <p>Semua bouquet telah dimuat ({allBouquets.length} bouquet)</p>
        </div>
      )}
      </div>
    </GridErrorBoundary>
  );
};

export default InfiniteBouquetGrid;


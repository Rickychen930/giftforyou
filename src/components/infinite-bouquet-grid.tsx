/**
 * Infinite Scroll Bouquet Grid Component
 * Combines react-window virtualization with infinite scroll
 * Follows SOLID, DRY, MVP principles
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useInView } from "../hooks/useInView";
import { useInfiniteBouquets, type BouquetQueryParams, type BouquetResponse } from "../hooks/useBouquets";
import VirtualizedBouquetGrid from "./virtualized-bouquet-grid";
import BouquetCard from "./bouquet-card-component";
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
  } = useInfiniteBouquets(filters);

  // Flatten all pages into a single array
  const allBouquets = useMemo(() => {
    if (!data?.pages) return [];
    return (data as InfiniteData<BouquetResponse>).pages.flatMap((page: BouquetResponse) => page.bouquets);
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

  // Load more when in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Loading state
  if (isLoading) {
    return (
      <div className="infinite-grid-loading" aria-live="polite" aria-busy="true">
        <div className="infinite-grid-spinner">
          <div className="becSpinner" style={{ width: "32px", height: "32px", borderWidth: "3px" }}></div>
        </div>
        <p>Memuat bouquet...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="infinite-grid-error" role="alert">
        <p>Gagal memuat bouquet: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="infinite-grid-retry"
        >
          Coba Lagi
        </button>
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
  const shouldUseVirtualization = useVirtualization && !isMobile && containerWidth > 0;

  return (
    <div className="infinite-grid-wrapper" ref={containerRef}>
      {shouldUseVirtualization ? (
        <VirtualizedBouquetGrid
          bouquets={allBouquets}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
          gap={16}
        />
      ) : (
        <div className="infinite-grid-standard" role="list" aria-label="Daftar bouquet">
          {allBouquets.map((bouquet) => (
            <BouquetCard
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
              customPenanda={bouquet.customPenanda}
              isNewEdition={bouquet.isNewEdition}
              isFeatured={bouquet.isFeatured}
            />
          ))}
        </div>
      )}

      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="infinite-grid-load-more">
          {isFetchingNextPage ? (
            <div className="infinite-grid-spinner">
              <div className="becSpinner" style={{ width: "24px", height: "24px", borderWidth: "2px" }}></div>
              <span>Memuat lebih banyak...</span>
            </div>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="infinite-grid-load-more-btn"
              aria-label="Muat lebih banyak bouquet"
            >
              Muat Lebih Banyak
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
  );
};

export default InfiniteBouquetGrid;


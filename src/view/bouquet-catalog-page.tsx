/**
 * Bouquet Catalog Page View
 * Pure presentation component - no business logic
 */

import React, { useRef, useEffect } from "react";
import "../styles/BouquetCatalogPage.css";

import type { Bouquet } from "../models/domain/bouquet";
import type { FilterChip } from "../components/catalog/CatalogActiveFilters";

// Reusable Catalog Components
import CatalogHeader from "../components/catalog/CatalogHeader";
import CatalogSearch from "../components/catalog/CatalogSearch";
import CatalogFilters from "../components/catalog/CatalogFilters";
import CatalogGrid from "../components/catalog/CatalogGrid";
import CatalogPagination from "../components/catalog/CatalogPagination";
import CatalogEmpty from "../components/catalog/CatalogEmpty";
import CatalogSkeleton from "../components/catalog/CatalogSkeleton";
import CatalogActiveFilters from "../components/catalog/CatalogActiveFilters";
import CatalogResetButton from "../components/catalog/CatalogResetButton";

type Range = [number, number];

interface BouquetCatalogPageViewProps {
  bouquets: Bouquet[];
  total: number;
  allTypes: string[];
  allSizes: string[];
  allCollections: string[];

  collectionNameFilter: string;
  searchQuery: string;

  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  sortBy: string;

  currentPage: number;
  itemsPerPage: number;
  minPrice?: number;
  hasActiveFilters: boolean;
  filterChips: FilterChip[];

  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes" | "selectedCollections") => void;
  onClearAll: () => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;

  onClearSearchQuery: () => void;
  onClearCollectionNameFilter: () => void;
  onSearchChange?: (query: string) => void;
  onScrollToResults: (resultsRef: React.RefObject<HTMLElement>) => void;
  onLoad?: () => void;

  loading?: boolean;
  error?: string | null;
}

/**
 * Bouquet Catalog Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const BouquetCatalogPageView: React.FC<BouquetCatalogPageViewProps> = ({
  bouquets,
  total,
  allTypes,
  allSizes,
  allCollections,
  collectionNameFilter,
  searchQuery,
  priceRange,
  selectedTypes,
  selectedSizes,
  selectedCollections,
  sortBy,
  currentPage,
  itemsPerPage,
  minPrice,
  hasActiveFilters,
  filterChips,
  onPriceChange,
  onToggleFilter,
  onClearFilter,
  onClearAll,
  onSortChange,
  onPageChange,
  onClearSearchQuery,
  onClearCollectionNameFilter,
  onSearchChange,
  onScrollToResults,
  onLoad,
  loading = false,
  error = null,
}) => {
  const resultsRef = useRef<HTMLElement>(null);

  // Notify controller when component is ready
  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Scroll to results when page or filters change
  useEffect(() => {
    if (!loading && bouquets.length > 0) {
      onScrollToResults(resultsRef);
    }
  }, [currentPage, selectedTypes, selectedSizes, priceRange, sortBy, loading, bouquets.length, onScrollToResults]);

  if (error) {
    return (
      <section className="catalog-page">
        <CatalogHeader title="Katalog Bouquet" subtitle="Jelajahi bouquet dan koleksi terbaru kami." />
        <div className="catalog-page__error" role="alert">
          {error}
        </div>
      </section>
    );
  }

  const skeletonCount = Math.max(6, Math.min(itemsPerPage || 0, 12));

  return (
    <section className="catalog-page" aria-labelledby="catalog-title">
      <CatalogHeader
        totalItems={total}
        minPrice={minPrice}
        loading={loading}
      />

      <div className="catalog-page__summary">
        <CatalogSearch
          value={searchQuery}
          onSearch={onSearchChange}
          onClear={onClearSearchQuery}
          disabled={loading}
        />
        {hasActiveFilters && !loading && (
          <div className="catalog-page__summary-actions">
            <CatalogResetButton
              onClearAll={onClearAll}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {filterChips.length > 0 && (
        <CatalogActiveFilters chips={filterChips} loading={loading} />
      )}

      <div className="catalog-page__layout">
        <CatalogFilters
          priceRange={priceRange}
          selectedTypes={selectedTypes}
          selectedSizes={selectedSizes}
          selectedCollections={selectedCollections}
          allTypes={allTypes}
          allSizes={allSizes}
          allCollections={allCollections}
          sortBy={sortBy}
          disabled={loading}
          onPriceChange={onPriceChange}
          onToggleFilter={onToggleFilter}
          onClearFilter={onClearFilter}
          onSortChange={onSortChange}
        />

        <main className="catalog-page__results" aria-label="Hasil bouquet" ref={resultsRef}>
          {loading ? (
            <CatalogSkeleton count={skeletonCount} showLoadingState />
          ) : bouquets.length > 0 ? (
            <>
              <CatalogGrid
                bouquets={bouquets}
                ariaLabel={`Menampilkan ${bouquets.length} dari ${total} bouquet`}
              />
              <CatalogPagination
                currentPage={currentPage}
                totalItems={total}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <CatalogEmpty
              hasActiveFilters={hasActiveFilters}
              chips={filterChips}
              onClearAll={onClearAll}
              onRemoveLastFilter={filterChips.length > 0 ? filterChips[filterChips.length - 1].onRemove : undefined}
              loading={loading}
            />
          )}
        </main>
      </div>
    </section>
  );
};

export default BouquetCatalogPageView;

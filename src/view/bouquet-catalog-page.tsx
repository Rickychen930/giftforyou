/**
 * Bouquet Catalog Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 * Enhanced with Container & Section components for consistent layout
 */

import React, { Component, RefObject } from "react";
import "../styles/BouquetCatalogPage.css";

import type { Bouquet } from "../models/domain/bouquet";
import type { FilterChip } from "../components/catalog/CatalogActiveFilters";
import Section from "../components/layout/Section";
import Container from "../components/layout/Container";

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
import CatalogViewControls from "../components/catalog/CatalogViewControls";

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
  onItemsPerPageChange: (itemsPerPage: number) => void;

  onClearSearchQuery: () => void;
  onClearCollectionNameFilter: () => void;
  onSearchChange?: (query: string) => void;
  onScrollToResults: (resultsRef: RefObject<HTMLElement>) => void;
  onLoad?: () => void;

  loading?: boolean;
  error?: string | null;
}

/**
 * Bouquet Catalog Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class BouquetCatalogPageView extends Component<BouquetCatalogPageViewProps> {
  private resultsRef: RefObject<HTMLElement> = React.createRef<HTMLElement>();

  /**
   * Component lifecycle: notify controller when component is ready
   */
  componentDidMount(): void {
    const { onLoad } = this.props;
    if (onLoad) {
      onLoad();
    }
  }

  /**
   * Component lifecycle: scroll to results when page or filters change
   */
  componentDidUpdate(prevProps: Readonly<BouquetCatalogPageViewProps>): void {
    const { loading, bouquets, onScrollToResults, currentPage, selectedTypes, selectedSizes, priceRange, sortBy } = this.props;

    if (
      !loading &&
      bouquets.length > 0 &&
      (prevProps.currentPage !== currentPage ||
        prevProps.selectedTypes !== selectedTypes ||
        prevProps.selectedSizes !== selectedSizes ||
        prevProps.priceRange !== priceRange ||
        prevProps.sortBy !== sortBy ||
        prevProps.loading !== loading ||
        prevProps.bouquets.length !== bouquets.length)
    ) {
      onScrollToResults(this.resultsRef);
    }
  }

  /**
   * Render error state
   */
  private renderError(): React.ReactNode {
    return (
      <Section variant="default" padding="lg" className="catalog-page">
        <Container variant="default" padding="md">
          <CatalogHeader title="Katalog Bouquet" subtitle="Jelajahi bouquet dan koleksi terbaru kami." />
          <div className="catalog-page__error" role="alert">
            {this.props.error}
          </div>
        </Container>
      </Section>
    );
  }

  /**
   * Render main catalog content
   */
  private renderContent(): React.ReactNode {
    const {
      bouquets,
      total,
      allTypes,
      allSizes,
      allCollections,
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
      loading = false,
      onPriceChange,
      onToggleFilter,
      onClearFilter,
      onClearAll,
      onSortChange,
      onPageChange,
      onItemsPerPageChange,
      onClearSearchQuery,
      onSearchChange,
    } = this.props;

    const skeletonCount = Math.max(6, Math.min(itemsPerPage || 0, 12));

    return (
      <Section variant="gradient" padding="lg" className="catalog-page" aria-labelledby="catalog-title">
        <Container variant="default" padding="md">
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
        </Container>

        <Container variant="default" padding="md" className="catalog-page__layout-container">
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

            <main className="catalog-page__results" aria-label="Hasil bouquet" ref={this.resultsRef}>
              {loading ? (
                <CatalogSkeleton count={skeletonCount} showLoadingState />
              ) : bouquets.length > 0 ? (
                <>
                  <CatalogViewControls
                    itemsPerPage={itemsPerPage}
                    totalItems={total}
                    onItemsPerPageChange={onItemsPerPageChange}
                    disabled={loading}
                  />
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
        </Container>
      </Section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { error } = this.props;

    if (error) {
      return this.renderError();
    }

    return this.renderContent();
  }
}

export default BouquetCatalogPageView;

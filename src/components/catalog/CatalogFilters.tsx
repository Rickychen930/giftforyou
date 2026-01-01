/**
 * Catalog Filters Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/catalog/CatalogFilters.css";
import FilterPanel from "../FilterPanel";

export interface CatalogFiltersProps {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  allTypes: string[];
  allSizes: string[];
  allCollections: string[];
  sortBy: string;
  disabled?: boolean;
  onPriceChange: (range: [number, number]) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes" | "selectedCollections") => void;
  onSortChange: (value: string) => void;
  onFilterChange?: () => void;
}

interface CatalogFiltersState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Filters Component
 * Class-based component for catalog filters
 */
class CatalogFilters extends Component<CatalogFiltersProps, CatalogFiltersState> {
  private baseClass: string = "catalog-filters";
  private mobileFiltersRef: RefObject<HTMLDetailsElement>;

  constructor(props: CatalogFiltersProps) {
    super(props);
    this.mobileFiltersRef = React.createRef();
  }

  private closeMobileFiltersIfNeeded = (): void => {
    if (typeof window === "undefined") return;
    const detailsEl = this.mobileFiltersRef.current;
    if (!detailsEl) return;

    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      detailsEl.open = false;
      if (this.props.onFilterChange) {
        this.props.onFilterChange();
      }
    }
  };

  private handleToggleFilter = (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ): void => {
    this.props.onToggleFilter(key, value);
    this.closeMobileFiltersIfNeeded();
  };

  private handleClearFilter = (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections"
  ): void => {
    this.props.onClearFilter(key);
    this.closeMobileFiltersIfNeeded();
  };

  private handleSortChange = (value: string): void => {
    this.props.onSortChange(value);
    this.closeMobileFiltersIfNeeded();
  };

  render(): React.ReactNode {
    const {
      priceRange,
      selectedTypes,
      selectedSizes,
      selectedCollections,
      allTypes,
      allSizes,
      allCollections,
      sortBy,
      disabled = false,
      onPriceChange,
      onToggleFilter,
      onClearFilter,
      onSortChange,
    } = this.props;

    return (
      <div className={this.baseClass} aria-label="Filter">
        <details className={`${this.baseClass}__mobile`} ref={this.mobileFiltersRef}>
          <summary className={`${this.baseClass}__summary`}>Filter & Urutkan</summary>
          <div className={`${this.baseClass}__body`}>
            <FilterPanel
              embedded
              hideHeader
              priceRange={priceRange}
              selectedTypes={selectedTypes}
              selectedSizes={selectedSizes}
              selectedCollections={selectedCollections}
              allSizes={allSizes}
              allTypes={allTypes}
              allCollections={allCollections}
              sortBy={sortBy}
              disabled={disabled}
              onPriceChange={onPriceChange}
              onToggleFilter={this.handleToggleFilter}
              onClearFilter={this.handleClearFilter}
              onSortChange={this.handleSortChange}
            />
          </div>
        </details>

        <div className={`${this.baseClass}__desktop`}>
          <div className={`${this.baseClass}__panel`}>
            <FilterPanel
              embedded
              hideHeader
              variant="topbar"
              priceRange={priceRange}
              selectedTypes={selectedTypes}
              selectedSizes={selectedSizes}
              selectedCollections={selectedCollections}
              allSizes={allSizes}
              allTypes={allTypes}
              allCollections={allCollections}
              sortBy={sortBy}
              disabled={disabled}
              onPriceChange={onPriceChange}
              onToggleFilter={onToggleFilter}
              onClearFilter={onClearFilter}
              onSortChange={onSortChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CatalogFilters;

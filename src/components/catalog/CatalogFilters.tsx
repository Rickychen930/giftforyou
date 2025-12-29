import React, { useRef } from "react";
import "../../styles/catalog/CatalogFilters.css";
import FilterPanel from "../filter-panel-component";

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

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
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
  onFilterChange,
}) => {
  const mobileFiltersRef = useRef<HTMLDetailsElement>(null);

  const closeMobileFiltersIfNeeded = () => {
    if (typeof window === "undefined") return;
    const detailsEl = mobileFiltersRef.current;
    if (!detailsEl) return;

    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) {
      detailsEl.open = false;
      onFilterChange?.();
    }
  };

  const handleToggleFilter = (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => {
    onToggleFilter(key, value);
    closeMobileFiltersIfNeeded();
  };

  const handleClearFilter = (key: "selectedTypes" | "selectedSizes" | "selectedCollections") => {
    onClearFilter(key);
    closeMobileFiltersIfNeeded();
  };

  const handleSortChange = (value: string) => {
    onSortChange(value);
    closeMobileFiltersIfNeeded();
  };

  return (
    <div className="catalog-filters" aria-label="Filter">
      <details className="catalog-filters__mobile" ref={mobileFiltersRef}>
        <summary className="catalog-filters__summary">Filter & Urutkan</summary>
        <div className="catalog-filters__body">
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
            onToggleFilter={handleToggleFilter}
            onClearFilter={handleClearFilter}
            onSortChange={handleSortChange}
          />
        </div>
      </details>

      <div className="catalog-filters__desktop">
        <div className="catalog-filters__panel">
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
};

export default CatalogFilters;


/**
 * Catalog Infinite Grid Wrapper
 * Hybrid approach: Combines existing filter logic with React Query infinite scroll
 * Professional, luxury, elegant design for 500+ bouquets and 30+ collections
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { useMemo, useEffect } from "react";
import InfiniteBouquetGrid from "./infinite-bouquet-grid";
import type { BouquetQueryParams } from "../hooks/useBouquets";
import "../styles/CatalogInfiniteWrapper.css";

interface CatalogInfiniteGridWrapperProps {
  // Filter state from controller
  priceRange: [number, number];
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  collectionNameFilter: string;
  searchQuery: string;
  sortBy: string;
  
  // Loading state
  loading?: boolean;
  
  // Callbacks for filter changes (to sync with URL)
  onPriceChange?: (range: [number, number]) => void;
  onToggleFilter?: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearFilter?: (key: "selectedTypes" | "selectedSizes" | "selectedCollections") => void;
  onClearAll?: () => void;
  onSortChange?: (value: string) => void;
  onClearSearchQuery?: () => void;
  onClearCollectionNameFilter?: () => void;
  onSearchChange?: (query: string) => void;
}

const CatalogInfiniteGridWrapper: React.FC<CatalogInfiniteGridWrapperProps> = ({
  priceRange,
  selectedTypes,
  selectedSizes,
  selectedCollections,
  collectionNameFilter,
  searchQuery,
  sortBy,
  loading = false,
  onPriceChange,
  onToggleFilter,
  onClearFilter,
  onClearAll,
  onSortChange,
  onClearSearchQuery,
  onClearCollectionNameFilter,
  onSearchChange,
}) => {
  // Convert sortBy to API format
  const apiSortBy = useMemo(() => {
    switch (sortBy) {
      case "price-asc":
        return "price-asc";
      case "price-desc":
        return "price-desc";
      case "name-asc":
        return "name-asc";
      case "name-desc":
        return "name-desc";
      default:
        return undefined;
    }
  }, [sortBy]);

  // Build filters for InfiniteBouquetGrid
  // Validate all inputs to prevent invalid filter values
  const filters: Omit<BouquetQueryParams, "page"> = useMemo(() => {
    const DEFAULT_PRICE: [number, number] = [0, 1_000_000];
    
    // Validate priceRange
    const safePriceRange: [number, number] = Array.isArray(priceRange) && 
      priceRange.length === 2 &&
      typeof priceRange[0] === "number" && Number.isFinite(priceRange[0]) &&
      typeof priceRange[1] === "number" && Number.isFinite(priceRange[1])
      ? [Math.max(0, priceRange[0]), Math.max(priceRange[0], priceRange[1])]
      : DEFAULT_PRICE;
    
    // Validate arrays
    const safeSelectedCollections = Array.isArray(selectedCollections) 
      ? selectedCollections.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
      : [];
    const safeSelectedTypes = Array.isArray(selectedTypes)
      ? selectedTypes.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      : [];
    const safeSelectedSizes = Array.isArray(selectedSizes)
      ? selectedSizes.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      : [];
    
    // Validate strings
    const safeSearchQuery = typeof searchQuery === "string" ? searchQuery.trim() : "";
    const safeCollectionNameFilter = typeof collectionNameFilter === "string" ? collectionNameFilter.trim() : "";
    
    // Build filter object - only include filters that are actually set
    // When all filters are empty/undefined, return empty object {} which means "show all bouquets"
    // This ensures that when filters are cleared, all bouquets are displayed
    const filterObj: Omit<BouquetQueryParams, "page"> = {
      limit: 20, // Always include limit
    };
    
    // Only add filter properties if they have values
    // This ensures empty filters don't prevent showing all bouquets
    if (safeSearchQuery) {
      filterObj.search = safeSearchQuery;
    }
    
    if (safeCollectionNameFilter) {
      filterObj.collectionName = safeCollectionNameFilter;
    }
    
    if (safeSelectedCollections.length > 0) {
      filterObj.collections = safeSelectedCollections;
    }
    
    if (safeSelectedTypes.length > 0) {
      filterObj.types = safeSelectedTypes;
    }
    
    if (safeSelectedSizes.length > 0) {
      filterObj.sizes = safeSelectedSizes;
    }
    
    // Only add price filters if they differ from default (meaning user has set a price range)
    if (safePriceRange[0] !== DEFAULT_PRICE[0]) {
      filterObj.minPrice = safePriceRange[0];
    }
    
    if (safePriceRange[1] !== DEFAULT_PRICE[1]) {
      filterObj.maxPrice = safePriceRange[1];
    }
    
    // Only add sortBy if it's set
    if (apiSortBy) {
      filterObj.sortBy = apiSortBy;
    }
    
    return filterObj;
  }, [
    searchQuery,
    collectionNameFilter,
    selectedCollections,
    selectedTypes,
    selectedSizes,
    priceRange,
    apiSortBy,
  ]);

  // Filters are managed by parent controller via props
  // This component just passes them to InfiniteBouquetGrid
  // React Query automatically handles cache invalidation when queryKey changes

  // Extract price range values for dependency array
  const minPrice = priceRange[0];
  const maxPrice = priceRange[1];
  const collectionsLength = selectedCollections.length;
  const typesLength = selectedTypes.length;
  const sizesLength = selectedSizes.length;

  // Scroll to top and manage focus when filters change
  useEffect(() => {
    const resultsElement = document.querySelector(".catalogResults");
    if (resultsElement) {
      // Use requestAnimationFrame for smooth scroll
      requestAnimationFrame(() => {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        // Focus management for accessibility
        const firstResult = resultsElement.querySelector(".catalogGrid, .infinite-grid-wrapper");
        if (firstResult instanceof HTMLElement) {
          // Set focus to results container for screen readers
          firstResult.setAttribute("tabIndex", "-1");
          firstResult.focus();
          // Remove tabIndex after focus to prevent tab navigation issues
          setTimeout(() => {
            firstResult.removeAttribute("tabIndex");
          }, 100);
        }
      });
    }
  }, [
    searchQuery,
    collectionNameFilter,
    collectionsLength,
    typesLength,
    sizesLength,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Calculate container height dynamically for optimal viewport usage
  const containerHeight = useMemo(() => {
    if (typeof window === "undefined") return 800;
    try {
      // Account for header, filters, and padding
      const headerHeight = 250;
      const filtersHeight = 120;
      const padding = 80;
      const windowHeight = typeof window.innerHeight === "number" && Number.isFinite(window.innerHeight)
        ? window.innerHeight
        : 800;
      const calculated = windowHeight - headerHeight - filtersHeight - padding;
      // Ensure minimum height for good UX, max for very large screens
      const height = Math.max(600, Math.min(calculated, 1200));
      // Final validation
      return Number.isFinite(height) && height > 0 ? height : 800;
    } catch (error) {
      console.error("[CatalogInfiniteGridWrapper] Error calculating container height:", error);
      return 800;
    }
  }, []);

  return (
    <div className="catalogInfiniteWrapper">
      <InfiniteBouquetGrid
        filters={filters}
        useVirtualization={true}
        containerHeight={containerHeight}
      />
    </div>
  );
};

export default CatalogInfiniteGridWrapper;


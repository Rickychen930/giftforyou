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
  const filters: Omit<BouquetQueryParams, "page"> = useMemo(() => {
    const DEFAULT_PRICE: [number, number] = [0, 1_000_000];
    
    return {
      search: searchQuery.trim() || undefined,
      collectionName: collectionNameFilter.trim() || undefined,
      collections: selectedCollections.length > 0 ? selectedCollections : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      minPrice: priceRange[0] !== DEFAULT_PRICE[0] ? priceRange[0] : undefined,
      maxPrice: priceRange[1] !== DEFAULT_PRICE[1] ? priceRange[1] : undefined,
      sortBy: apiSortBy,
      limit: 20, // Optimal for infinite scroll
    };
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

  // Scroll to top when filters change
  useEffect(() => {
    const resultsElement = document.querySelector(".catalogResults");
    if (resultsElement) {
      // Use requestAnimationFrame for smooth scroll
      requestAnimationFrame(() => {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
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
    // Account for header, filters, and padding
    const headerHeight = 250;
    const filtersHeight = 120;
    const padding = 80;
    const calculated = window.innerHeight - headerHeight - filtersHeight - padding;
    // Ensure minimum height for good UX, max for very large screens
    return Math.max(600, Math.min(calculated, 1200));
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


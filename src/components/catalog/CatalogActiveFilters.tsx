/**
 * Catalog Active Filters Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/catalog/CatalogActiveFilters.css";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}

export interface CatalogActiveFiltersProps {
  chips: FilterChip[];
  loading?: boolean;
  variant?: "default" | "empty";
}

interface CatalogActiveFiltersState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Active Filters Component
 * Class-based component for displaying active filter chips
 */
class CatalogActiveFilters extends Component<CatalogActiveFiltersProps, CatalogActiveFiltersState> {
  private baseClass: string = "catalog-active-filters";

  render(): React.ReactNode {
    const { chips, loading = false, variant = "default" } = this.props;

    if (chips.length === 0) return null;

    return (
      <div
        className={`${this.baseClass} ${
          variant === "empty" ? `${this.baseClass}--empty` : ""
        }`}
        aria-label="Filter aktif"
      >
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`${this.baseClass}__chip`}
            onClick={c.onRemove}
            disabled={loading}
            aria-label={c.ariaLabel}
            title={c.ariaLabel}
          >
            <span className={`${this.baseClass}__chip-label`}>{c.label}</span>
            <span className={`${this.baseClass}__chip-x`} aria-hidden="true">
              ×
            </span>
          </button>
        ))}
      </div>
    );
  }
}

export default CatalogActiveFilters;

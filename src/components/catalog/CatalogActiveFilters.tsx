import React from "react";
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

const CatalogActiveFilters: React.FC<CatalogActiveFiltersProps> = ({
  chips,
  loading = false,
  variant = "default",
}) => {
  if (chips.length === 0) return null;

  return (
    <div
      className={`catalog-active-filters ${
        variant === "empty" ? "catalog-active-filters--empty" : ""
      }`}
      aria-label="Filter aktif"
    >
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          className="catalog-active-filters__chip"
          onClick={c.onRemove}
          disabled={loading}
          aria-label={c.ariaLabel}
          title={c.ariaLabel}
        >
          <span className="catalog-active-filters__chip-label">{c.label}</span>
          <span className="catalog-active-filters__chip-x" aria-hidden="true">
            ×
          </span>
        </button>
      ))}
    </div>
  );
};

export default CatalogActiveFilters;


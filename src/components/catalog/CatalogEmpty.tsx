/**
 * Catalog Empty Component (OOP)
 * Class-based component following SOLID principles
 * Uses unified EmptyState component
 */

import React, { Component } from "react";
import EmptyState from "../common/EmptyState";
import "../../styles/catalog/CatalogEmpty.css";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}

export interface CatalogEmptyProps {
  title?: string;
  description?: string;
  hasActiveFilters?: boolean;
  chips?: FilterChip[];
  onClearAll?: () => void;
  onRemoveLastFilter?: () => void;
  loading?: boolean;
}

interface CatalogEmptyState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Empty Component
 * Class-based component for empty catalog state
 */
class CatalogEmpty extends Component<CatalogEmptyProps, CatalogEmptyState> {
  private baseClass: string = "catalog-empty";

  private getDefaultDescription(): string {
    const { hasActiveFilters = false } = this.props;
    return hasActiveFilters
      ? "Tidak ada bouquet yang sesuai dengan filter Anda. Coba sesuaikan filter atau hapus beberapa filter untuk melihat lebih banyak hasil."
      : "Belum ada bouquet tersedia saat ini. Silakan kembali lagi nanti.";
  }

  private getDefaultIcon(): React.ReactNode {
    return (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>
    );
  }

  private renderFilterChips(): React.ReactNode {
    const { chips = [], loading = false } = this.props;
    if (chips.length === 0) return null;

    return (
      <div className={`${this.baseClass}__filters`} aria-label="Filter aktif">
        <p className={`${this.baseClass}__filters-hint`}>Filter aktif saat ini:</p>
        <div className={`${this.baseClass}__chips`}>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={`${this.baseClass}__chip`}
              onClick={chip.onRemove}
              disabled={loading}
              aria-label={chip.ariaLabel}
              title={chip.ariaLabel}
            >
              <span className={`${this.baseClass}__chip-label`}>{chip.label}</span>
              <span className={`${this.baseClass}__chip-x`} aria-hidden="true">
                ×
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  private renderActions(): React.ReactNode {
    const { onClearAll, onRemoveLastFilter, chips = [], loading = false } = this.props;
    if (!onClearAll && !onRemoveLastFilter) return null;

    return (
      <div className={`${this.baseClass}__actions`}>
        {onRemoveLastFilter && chips.length > 0 && (
          <button
            type="button"
            className={`${this.baseClass}__btn ${this.baseClass}__btn--secondary`}
            onClick={onRemoveLastFilter}
            disabled={loading}
          >
            Hapus filter terakhir
          </button>
        )}
        {onClearAll && (
          <button
            type="button"
            className={`${this.baseClass}__btn`}
            onClick={onClearAll}
            disabled={loading}
          >
            Atur ulang filter
          </button>
        )}
      </div>
    );
  }

  render(): React.ReactNode {
    const { title = "Tidak ada bouquet ditemukan", description } = this.props;

    return (
      <div className={this.baseClass} role="status" aria-live="polite">
        <EmptyState
          icon={this.getDefaultIcon()}
          title={title}
          description={description || this.getDefaultDescription()}
          className={`${this.baseClass}__empty-state`}
        />
        {this.renderFilterChips()}
        {this.renderActions()}
      </div>
    );
  }
}

export default CatalogEmpty;

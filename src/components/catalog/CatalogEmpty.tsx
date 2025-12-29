import React from "react";
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

const CatalogEmpty: React.FC<CatalogEmptyProps> = ({
  title = "Tidak ada bouquet ditemukan",
  description,
  hasActiveFilters = false,
  chips = [],
  onClearAll,
  onRemoveLastFilter,
  loading = false,
}) => {
  const defaultDescription = hasActiveFilters
    ? "Tidak ada bouquet yang sesuai dengan filter Anda. Coba sesuaikan filter atau hapus beberapa filter untuk melihat lebih banyak hasil."
    : "Belum ada bouquet tersedia saat ini. Silakan kembali lagi nanti.";

  return (
    <div className="catalog-empty" role="status" aria-live="polite">
      <div className="catalog-empty__icon" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        </svg>
      </div>
      <h3 className="catalog-empty__title">{title}</h3>
      <p className="catalog-empty__description">
        {description || defaultDescription}
      </p>

      {chips.length > 0 && (
        <div className="catalog-empty__filters" aria-label="Filter aktif">
          <p className="catalog-empty__filters-hint">
            Filter aktif saat ini:
          </p>
          <div className="catalog-empty__chips">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                className="catalog-empty__chip"
                onClick={c.onRemove}
                disabled={loading}
                aria-label={c.ariaLabel}
                title={c.ariaLabel}
              >
                <span className="catalog-empty__chip-label">{c.label}</span>
                <span className="catalog-empty__chip-x" aria-hidden="true">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(onClearAll || onRemoveLastFilter) && (
        <div className="catalog-empty__actions">
          {onRemoveLastFilter && chips.length > 0 && (
            <button
              type="button"
              className="catalog-empty__btn catalog-empty__btn--secondary"
              onClick={onRemoveLastFilter}
              disabled={loading}
            >
              Hapus filter terakhir
            </button>
          )}

          {onClearAll && (
            <button
              type="button"
              className="catalog-empty__btn"
              onClick={onClearAll}
              disabled={loading}
            >
              Atur ulang filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogEmpty;


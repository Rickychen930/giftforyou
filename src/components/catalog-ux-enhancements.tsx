/**
 * Catalog UX Enhancement Components
 * Priority features to improve user experience
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { useState, useEffect, useMemo } from "react";
import "../styles/CatalogUXEnhancements.css";

// ============================================================================
// 1. Quick Filter Chips - For commonly used filters
// ============================================================================

interface QuickFilterChipsProps {
  allTypes: string[];
  allSizes: string[];
  allCollections: string[];
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearAll: () => void;
}

export const QuickFilterChips: React.FC<QuickFilterChipsProps> = ({
  allTypes,
  allSizes,
  allCollections,
  selectedTypes,
  selectedSizes,
  selectedCollections,
  onToggleFilter,
  onClearAll,
}) => {
  // Get most popular/common filters (first 6 of each)
  const popularTypes = useMemo(() => allTypes.slice(0, 6), [allTypes]);
  const popularSizes = useMemo(() => allSizes.slice(0, 4), [allSizes]);
  const popularCollections = useMemo(() => allCollections.slice(0, 6), [allCollections]);

  const hasActiveFilters = useMemo(
    () => selectedTypes.length > 0 || selectedSizes.length > 0 || selectedCollections.length > 0,
    [selectedTypes.length, selectedSizes.length, selectedCollections.length]
  );

  if (popularTypes.length === 0 && popularSizes.length === 0 && popularCollections.length === 0) {
    return null;
  }

  return (
    <div className="quickFilterChips" role="group" aria-label="Filter cepat">
      <div className="quickFilterChips__header">
        <h3 className="quickFilterChips__title">Filter Cepat</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="quickFilterChips__clear"
            aria-label="Hapus semua filter"
          >
            Hapus Semua
          </button>
        )}
      </div>

      <div className="quickFilterChips__container">
        {popularCollections.length > 0 && (
          <div className="quickFilterChips__group">
            <span className="quickFilterChips__label">Koleksi:</span>
            <div className="quickFilterChips__chips">
              {popularCollections.map((collection) => {
                const isActive = selectedCollections.includes(collection);
                return (
                  <button
                    key={collection}
                    onClick={() => onToggleFilter("selectedCollections", collection)}
                    className={`quickFilterChips__chip ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    aria-label={`Filter koleksi ${collection}`}
                  >
                    {collection}
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {popularTypes.length > 0 && (
          <div className="quickFilterChips__group">
            <span className="quickFilterChips__label">Tipe:</span>
            <div className="quickFilterChips__chips">
              {popularTypes.map((type) => {
                const isActive = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleFilter("selectedTypes", type)}
                    className={`quickFilterChips__chip ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    aria-label={`Filter tipe ${type}`}
                  >
                    {type}
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {popularSizes.length > 0 && (
          <div className="quickFilterChips__group">
            <span className="quickFilterChips__label">Ukuran:</span>
            <div className="quickFilterChips__chips">
              {popularSizes.map((size) => {
                const isActive = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => onToggleFilter("selectedSizes", size)}
                    className={`quickFilterChips__chip ${isActive ? "is-active" : ""}`}
                    aria-pressed={isActive}
                    aria-label={`Filter ukuran ${size}`}
                  >
                    {size}
                    {isActive && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. Active Filter Count Badge
// ============================================================================

interface ActiveFilterBadgeProps {
  count: number;
  onClick: () => void;
}

export const ActiveFilterBadge: React.FC<ActiveFilterBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="activeFilterBadge"
      aria-label={`${count} filter aktif. Klik untuk melihat detail`}
      title={`${count} filter aktif`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 6h18M7 12h10M11 18h2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="activeFilterBadge__count">{count}</span>
      <span className="activeFilterBadge__label">Filter Aktif</span>
    </button>
  );
};

// ============================================================================
// 3. Back to Top Button
// ============================================================================

interface BackToTopProps {
  threshold?: number;
}

export const BackToTop: React.FC<BackToTopProps> = ({ threshold = 400 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="backToTop"
      style={{
        display: isVisible ? "flex" : "none",
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
      }}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

// ============================================================================
// 4. Enhanced Empty State with Suggestions
// ============================================================================

interface EnhancedEmptyStateProps {
  searchQuery?: string;
  hasActiveFilters: boolean;
  onClearSearch?: () => void;
  onClearAllFilters?: () => void;
  suggestions?: string[];
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  searchQuery,
  hasActiveFilters,
  onClearSearch,
  onClearAllFilters,
  suggestions = [],
}) => {
  return (
    <div className="enhancedEmptyState" role="status" aria-live="polite">
      <div className="enhancedEmptyState__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>
      </div>

      <h3 className="enhancedEmptyState__title">
        {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : "Tidak ada bouquet ditemukan"}
      </h3>

      <p className="enhancedEmptyState__message">
        {searchQuery
          ? "Coba gunakan kata kunci yang berbeda atau hapus beberapa filter."
          : hasActiveFilters
          ? "Coba sesuaikan filter Anda untuk melihat lebih banyak hasil."
          : "Silakan cek kembali nanti — bouquet baru akan ditambahkan secara berkala."}
      </p>

      <div className="enhancedEmptyState__actions">
        {searchQuery && onClearSearch && (
          <button onClick={onClearSearch} className="enhancedEmptyState__btn">
            Hapus Pencarian
          </button>
        )}
        {hasActiveFilters && onClearAllFilters && (
          <button onClick={onClearAllFilters} className="enhancedEmptyState__btn">
            Hapus Semua Filter
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="enhancedEmptyState__suggestions">
          <p className="enhancedEmptyState__suggestionsTitle">Mungkin Anda mencari:</p>
          <ul className="enhancedEmptyState__suggestionsList">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


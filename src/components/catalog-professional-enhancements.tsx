/**
 * Professional Catalog Enhancements
 * Additional features to make the catalog view more professional
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { useEffect, useState, useCallback } from "react";
import "../styles/CatalogProfessionalEnhancements.css";

// ============================================================================
// 1. Search Result Count Indicator
// ============================================================================

interface SearchResultCountProps {
  total: number;
  filtered: number;
  searchQuery?: string;
  hasActiveFilters: boolean;
  loading?: boolean;
}

export const SearchResultCount: React.FC<SearchResultCountProps> = ({
  total,
  filtered,
  searchQuery,
  hasActiveFilters,
  loading = false,
}) => {
  if (loading) return null;

  const isFiltered = filtered !== total || hasActiveFilters || Boolean(searchQuery);

  if (!isFiltered) {
    return (
      <div className="searchResultCount" role="status" aria-live="polite">
        <span className="searchResultCount__text">
          Menampilkan <strong>{total}</strong> bouquet
        </span>
      </div>
    );
  }

  return (
    <div className="searchResultCount" role="status" aria-live="polite">
      <span className="searchResultCount__text">
        Menampilkan <strong>{filtered}</strong> dari <strong>{total}</strong> bouquet
        {searchQuery && (
          <span className="searchResultCount__query">
            {" "}untuk "<strong>{searchQuery}</strong>"
          </span>
        )}
      </span>
    </div>
  );
};

// ============================================================================
// 2. Keyboard Shortcuts Helper
// ============================================================================

interface KeyboardShortcutsProps {
  onSearchFocus?: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSearchFocus,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          ".catalogSearchInput__input"
        );
        if (searchInput) {
          searchInput.focus();
          if (onSearchFocus) {
            onSearchFocus();
          }
        }
      }

      // Escape to clear search
      if (e.key === "Escape") {
        const searchInput = document.querySelector<HTMLInputElement>(
          ".catalogSearchInput__input"
        );
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchFocus]);

  return null;
};

// ============================================================================
// 3. Search Loading Indicator
// ============================================================================

interface SearchLoadingIndicatorProps {
  isSearching: boolean;
}

export const SearchLoadingIndicator: React.FC<SearchLoadingIndicatorProps> = ({
  isSearching,
}) => {
  if (!isSearching) return null;

  return (
    <div className="searchLoadingIndicator" aria-live="polite" aria-busy="true">
      <div className="searchLoadingIndicator__spinner">
        <div className="becSpinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
      </div>
      <span className="searchLoadingIndicator__text">Mencari...</span>
    </div>
  );
};

// ============================================================================
// 4. Recent Searches (Optional - can be enabled later)
// ============================================================================

const RECENT_SEARCHES_KEY = "catalog_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }

      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return { recentSearches, addRecentSearch, clearRecentSearches };
};

// ============================================================================
// 5. View Mode Toggle (Grid/List) - Future Enhancement
// ============================================================================

export type ViewMode = "grid" | "list";

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="viewModeToggle" role="group" aria-label="Tampilan">
      <button
        type="button"
        onClick={() => onModeChange("grid")}
        className={`viewModeToggle__btn ${currentMode === "grid" ? "is-active" : ""}`}
        aria-pressed={currentMode === "grid"}
        aria-label="Tampilan grid"
        title="Tampilan grid"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onModeChange("list")}
        className={`viewModeToggle__btn ${currentMode === "list" ? "is-active" : ""}`}
        aria-pressed={currentMode === "list"}
        aria-label="Tampilan list"
        title="Tampilan list"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};


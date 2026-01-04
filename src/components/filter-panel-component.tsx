import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/FilterComponentPanelComponent.css";
import { BOUQUET_SIZES } from "../constants/bouquet-constants";
import { formatBouquetType, formatBouquetSize, formatCollectionName, formatTag } from "../utils/text-formatter";

type Range = [number, number];

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  allSizes: string[];
  allTypes: string[];
  allCollections: string[];
  sortBy: string;

  /** When true, renders without the outer panel header/background so it can live inside another container. */
  embedded?: boolean;

  /** When true, hides the internal header (useful when a parent already provides a header, e.g. <summary>). */
  hideHeader?: boolean;

  /** Visual/layout variant. Use "topbar" for a horizontal top-of-page filter layout. */
  variant?: "sidebar" | "topbar";

  disabled?: boolean;

  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections"
  ) => void;
  onSortChange: (value: string) => void;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const FilterPanel: React.FC<FilterPanelProps> = ({
  priceRange,
  selectedTypes,
  selectedSizes,
  selectedCollections,
  allSizes,
  allTypes,
  allCollections,
  sortBy,
  embedded,
  hideHeader,
  variant = "sidebar",
  disabled,
  onPriceChange,
  onToggleFilter,
  onClearFilter,
  onSortChange,
}) => {
  // Validate price range
  const validPriceRange: Range = React.useMemo(() => {
    const min = Math.max(0, Math.min(priceRange[0], 1_000_000));
    const max = Math.min(1_000_000, Math.max(priceRange[1], 0));
    return min <= max ? [min, max] : [0, 1_000_000];
  }, [priceRange]);
  const isTopbar = variant === "topbar";
  
  // Ensure arrays are always valid
  const safeAllTypes = Array.isArray(allTypes) && allTypes.length > 0 ? allTypes : ["Orchid", "Mixed"];
  const safeAllSizes = Array.isArray(allSizes) && allSizes.length > 0 ? allSizes : [...BOUQUET_SIZES];
  const safeAllCollections = Array.isArray(allCollections) ? allCollections : [];
  const safeSelectedTypes = Array.isArray(selectedTypes) ? selectedTypes : [];
  const safeSelectedSizes = Array.isArray(selectedSizes) ? selectedSizes : [];
  const safeSelectedCollections = Array.isArray(selectedCollections) ? selectedCollections : [];
  
  const [openGroups, setOpenGroups] = React.useState<
    Record<"selectedTypes" | "selectedSizes" | "selectedCollections", boolean>
  >(() => {
    return {
      selectedTypes: isTopbar ? true : safeSelectedTypes.length > 0 || safeAllTypes.length <= 8,
      selectedSizes: isTopbar ? true : safeSelectedSizes.length > 0 || safeAllSizes.length <= 8,
      selectedCollections: isTopbar ? true : safeSelectedCollections.length > 0 || safeAllCollections.length <= 8,
    };
  });
  
  // Update openGroups when arrays change to ensure filters are visible
  React.useEffect(() => {
    if (isTopbar) return; // Topbar always shows filters
    
    setOpenGroups((prev) => ({
      selectedTypes: prev.selectedTypes || safeSelectedTypes.length > 0 || safeAllTypes.length <= 8,
      selectedSizes: prev.selectedSizes || safeSelectedSizes.length > 0 || safeAllSizes.length <= 8,
      selectedCollections: prev.selectedCollections || safeSelectedCollections.length > 0 || safeAllCollections.length <= 8,
    }));
  }, [isTopbar, safeAllTypes.length, safeAllSizes.length, safeAllCollections.length, safeSelectedTypes.length, safeSelectedSizes.length, safeSelectedCollections.length]);

  // Search state for filter options (memoized to prevent unnecessary re-renders)
  const [searchQueries, setSearchQueries] = React.useState<
    Record<"selectedTypes" | "selectedSizes" | "selectedCollections", string>
  >({
    selectedTypes: "",
    selectedSizes: "",
    selectedCollections: "",
  });

  // Debounced search queries for better performance
  const [debouncedSearchQueries, setDebouncedSearchQueries] = React.useState(searchQueries);

  // Debounce search queries - Increased to 300ms to prevent excessive re-renders
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQueries(searchQueries);
    }, 300); // 300ms debounce for better performance

    return () => clearTimeout(timer);
  }, [searchQueries]);

  // Memoized search handler
  const handleSearchChange = React.useCallback((
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => {
    setSearchQueries((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Calculate active filter count (excluding default sort)
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (selectedTypes.length > 0) count += selectedTypes.length;
    if (selectedSizes.length > 0) count += selectedSizes.length;
    if (selectedCollections.length > 0) count += selectedCollections.length;
    // Only count price range if it's not the default range
    const validMin = Math.max(0, Math.min(priceRange[0], 1_000_000));
    const validMax = Math.min(1_000_000, Math.max(priceRange[1], 0));
    if (validMin > 0 || validMax < 1_000_000) count += 1;
    // Only count sort if it's not empty (empty means "Rekomendasi" - default)
    if (sortBy && sortBy !== "") count += 1;
    return count;
  }, [selectedTypes.length, selectedSizes.length, selectedCollections.length, priceRange, sortBy]);

  // Clear all filters handler
  const handleClearAll = React.useCallback(() => {
    onClearFilter("selectedTypes");
    onClearFilter("selectedSizes");
    onClearFilter("selectedCollections");
    onPriceChange([0, 1_000_000]);
    onSortChange("");
    // Clear all search queries when clearing filters
    setSearchQueries({
      selectedTypes: "",
      selectedSizes: "",
      selectedCollections: "",
    });
  }, [onClearFilter, onPriceChange, onSortChange]);

  const toggleGroup = React.useCallback((
    k: "selectedTypes" | "selectedSizes" | "selectedCollections"
  ) => {
    if (disabled) return;
    setOpenGroups((prev) => {
      const wasOpen = prev[k];
      // Clear search when closing group
      if (wasOpen) {
        setSearchQueries((current) => ({ ...current, [k]: "" }));
      }
      return { ...prev, [k]: !wasOpen };
    });
  }, [disabled]);

  const handlePriceChange = React.useCallback((value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      // Validate price range: ensure min <= max and values are within bounds
      let min = Math.max(0, value[0]);
      let max = Math.min(1_000_000, value[1]);
      
      // Ensure min doesn't exceed max
      if (min > max) {
        [min, max] = [max, min];
      }
      
      // Round to nearest step (50,000) for cleaner values
      min = Math.round(min / 50_000) * 50_000;
      max = Math.round(max / 50_000) * 50_000;
      
      onPriceChange([min, max]);
    }
  }, [onPriceChange]);

  const sortOptions: FilterOption[] = [
    { label: "Rekomendasi", value: "" },
    { label: "Termurah", value: "price-asc" },
    { label: "Termahal", value: "price-desc" },
    { label: "Nama A–Z", value: "name-asc" },
    { label: "Nama Z–A", value: "name-desc" },
  ];

  const FilterGroup: React.FC<{
    title: string;
    options: string[];
    selected: string[];
    k: "selectedTypes" | "selectedSizes" | "selectedCollections";
  }> = ({ title, options, selected, k }) => {
    // Ensure selected is an array
    const safeSelected = Array.isArray(selected) ? selected : [];
    
    const isOpen = isTopbar ? true : openGroups[k];
    const panelId = `fp-panel-${k}`;
    const meta = safeSelected.length ? `${safeSelected.length} dipilih` : "Semua";
    const searchQuery = debouncedSearchQueries[k] ? debouncedSearchQueries[k].toLowerCase() : "";
    
    // Remove duplicates from options (case-insensitive) - move safeOptions inside useMemo
    const uniqueOptions = React.useMemo(() => {
      // Ensure options is an array inside useMemo to fix ESLint warning
      const safeOptions = Array.isArray(options) ? options : [];
      if (safeOptions.length === 0) return [];
      const seen = new Set<string>();
      return safeOptions.filter((opt) => {
        if (!opt || typeof opt !== "string") return false;
        const lower = opt.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      });
    }, [options]);
    
    // Memoize filtered options to avoid recalculating on every render
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return uniqueOptions;
      return uniqueOptions.filter((opt) => {
        if (!opt || typeof opt !== "string") return false;
        return opt.toLowerCase().includes(searchQuery);
      });
    }, [uniqueOptions, searchQuery]);
    
    // Show search if there are more than 6 options OR if there's an active search query
    const showSearch = uniqueOptions.length > 6 || (searchQuery && searchQuery.length > 0);
    
    // Clear search when filter is cleared
    const handleClearFilter = React.useCallback(() => {
      onClearFilter(k);
      setSearchQueries((prev) => ({ ...prev, [k]: "" }));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [k]);

    return (
      <section className="fpGroup" aria-label={`Filter ${title}`}>
        <div className="fpGroup__head">
          {isTopbar ? (
            <div className="fpGroup__toggle fpGroup__toggle--static" aria-hidden="true">
              <span className="fpGroup__title">{title}</span>
              {safeSelected.length > 0 && (
                <span className="fpGroup__badge" aria-label={`${safeSelected.length} dipilih`}>
                  {safeSelected.length}
                </span>
              )}
              <span className="fpGroup__meta">{meta}</span>
            </div>
          ) : (
            <button
              type="button"
              className="fpGroup__toggle"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleGroup(k)}
              disabled={Boolean(disabled)}
            >
              <span className="fpGroup__title">{title}</span>
              {safeSelected.length > 0 && (
                <span className="fpGroup__badge" aria-label={`${safeSelected.length} dipilih`}>
                  {safeSelected.length}
                </span>
              )}
              <span className="fpGroup__meta">{meta}</span>
              <span className="fpGroup__chev" aria-hidden="true" />
            </button>
          )}

        <button
          type="button"
          className="fpGroup__clear"
          onClick={handleClearFilter}
          disabled={Boolean(disabled) || safeSelected.length === 0}
          aria-label={`Hapus filter ${title}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Hapus</span>
        </button>
        </div>

        <div id={panelId} className="fpGroup__panel" hidden={!isOpen}>
          {showSearch && (
            <div className="fpGroup__search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fpGroup__searchIcon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="fpGroup__searchInput"
                placeholder={`Cari ${title.toLowerCase()}...`}
                value={searchQueries[k]}
                onChange={(e) => handleSearchChange(k, e.target.value)}
                onKeyDown={(e) => {
                  // Close panel on Escape (only for non-topbar)
                  if (e.key === "Escape" && !isTopbar) {
                    e.stopPropagation();
                    toggleGroup(k);
                    // Clear search and return focus to toggle button
                    handleSearchChange(k, "");
                    // Use setTimeout to ensure DOM is updated
                    setTimeout(() => {
                      const toggleBtn = document.querySelector(`[aria-controls="${panelId}"]`) as HTMLElement;
                      toggleBtn?.focus();
                    }, 0);
                    return;
                  }
                  // Arrow keys for navigation within options
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const options = Array.from(
                      document.querySelectorAll(`#${panelId} .fpOption`)
                    ) as HTMLElement[];
                    const currentIndex = options.findIndex((el) => el === document.activeElement);
                    if (currentIndex >= 0) {
                      const nextIndex = e.key === "ArrowDown" 
                        ? (currentIndex + 1) % options.length
                        : (currentIndex - 1 + options.length) % options.length;
                      options[nextIndex]?.focus();
                    } else if (options.length > 0) {
                      options[0]?.focus();
                    }
                    return;
                  }
                  // Home/End keys for first/last option
                  if (e.key === "Home" || e.key === "End") {
                    e.preventDefault();
                    const options = Array.from(
                      document.querySelectorAll(`#${panelId} .fpOption`)
                    ) as HTMLElement[];
                    if (options.length > 0) {
                      const targetIndex = e.key === "Home" ? 0 : options.length - 1;
                      options[targetIndex]?.focus();
                    }
                  }
                }}
                disabled={Boolean(disabled)}
                aria-label={`Cari ${title.toLowerCase()}`}
              />
              {searchQueries[k] && (
                <button
                  type="button"
                  className="fpGroup__searchClear"
                  onClick={() => handleSearchChange(k, "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSearchChange(k, "");
                    }
                  }}
                  aria-label="Hapus pencarian"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="fpOptions" role="list">
            <button
              type="button"
              className={`fpOption ${safeSelected.length === 0 ? "is-active" : ""}`}
              onClick={handleClearFilter}
              disabled={Boolean(disabled)}
              aria-pressed={safeSelected.length === 0}
            >
              <span className="fpOption__label">Semua</span>
            </button>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = safeSelected.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={`fpOption ${isSelected ? "is-active" : ""}`}
                    onClick={() => onToggleFilter(k, opt)}
                    disabled={Boolean(disabled)}
                    aria-pressed={isSelected}
                  >
                    <span className="fpOption__label">
                      {k === "selectedTypes" 
                        ? formatBouquetType(opt)
                        : k === "selectedSizes"
                        ? formatBouquetSize(opt)
                        : k === "selectedCollections"
                        ? formatCollectionName(opt)
                        : formatTag(opt)}
                    </span>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="fpOption__check">
                        <path d="M11.5 3.5L5 10L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="fpOptions__empty" role="status" aria-live="polite" aria-atomic="true">
                <span>
                  {searchQuery 
                    ? `Tidak ada hasil untuk "${debouncedSearchQueries[k]}"` 
                    : "Tidak ada opsi tersedia"}
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    className="fpOptions__emptyClear"
                    onClick={() => handleSearchChange(k, "")}
                    aria-label="Hapus pencarian"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const panelClassName = [
    "filterPanel",
    embedded ? "filterPanel--embedded" : "",
    isTopbar ? "filterPanel--topbar" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Screen reader announcement for filter changes
  const filterAnnouncement = React.useMemo(() => {
    if (activeFilterCount === 0) return "";
    return `${activeFilterCount} filter aktif`;
  }, [activeFilterCount]);

  return (
    <div className={panelClassName} aria-label="Panel filter">
      {/* Screen reader announcement region */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="filterPanel__srOnly"
      >
        {filterAnnouncement}
      </div>
      {!hideHeader && !embedded && (
        <header className="filterPanel__header">
          <div className="filterPanel__headerTop">
            <h3 className="filterPanel__title">Filter & Urutkan</h3>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="filterPanel__clearAll"
                onClick={handleClearAll}
                disabled={Boolean(disabled)}
                aria-label={`Hapus semua filter (${activeFilterCount} aktif)`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Hapus Semua</span>
                {activeFilterCount > 0 && (
                  <span className="filterPanel__clearAllCount" aria-hidden="true">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
          <p className="filterPanel__hint">
            Saring berdasarkan harga, tipe, ukuran, dan koleksi.
            {activeFilterCount > 0 && (
              <span className="filterPanel__hintActive">
                {" "}({activeFilterCount} filter aktif)
              </span>
            )}
          </p>
        </header>
      )}

      {!hideHeader && embedded && (
        <header className="filterPanel__header">
          <div className="filterPanel__headerTop">
            <h3 className="filterPanel__title">Filter & Urutkan</h3>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="filterPanel__clearAll filterPanel__clearAll--compact"
                onClick={handleClearAll}
                disabled={Boolean(disabled)}
                aria-label={`Hapus semua filter (${activeFilterCount} aktif)`}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Hapus Semua</span>
                {activeFilterCount > 0 && (
                  <span className="filterPanel__clearAllCount" aria-hidden="true">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </header>
      )}

      <div className="filterPanel__body">
        {/* Price */}
        <section className="fpGroup fpGroup--price" aria-label="Filter rentang harga">
          <div className="fpGroup__head">
            <h4 className="fpGroup__title">Harga</h4>
          </div>

            <div className="fpPrice">
            <div className="fpPrice__values" aria-label="Rentang harga terpilih">
              <div className="fpPrice__valueWrapper">
                <span className="fpPrice__label">Min</span>
                <span className="fpPrice__value" aria-live="polite">{formatRp(validPriceRange[0])}</span>
              </div>
              <div className="fpPrice__separator" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="fpPrice__valueWrapper">
                <span className="fpPrice__label">Max</span>
                <span className="fpPrice__value" aria-live="polite">{formatRp(validPriceRange[1])}</span>
              </div>
            </div>

            <div className="fpSlider">
              <Slider
                range
                min={0}
                max={1_000_000}
                step={50_000}
                value={validPriceRange}
                onChange={handlePriceChange}
                pushable={100_000}
                allowCross={false}
                disabled={Boolean(disabled)}
                trackStyle={[{ backgroundColor: "var(--fp-brand)" }]}
                railStyle={{ backgroundColor: "rgba(0,0,0,0.10)" }}
                handleStyle={[
                  {
                    borderColor: "var(--fp-border-active)",
                    backgroundColor: "#fff",
                    boxShadow: "var(--fp-focus-ring)",
                  },
                  {
                    borderColor: "var(--fp-border-active)",
                    backgroundColor: "#fff",
                    boxShadow: "var(--fp-focus-ring)",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Type */}
        <FilterGroup
          title="Tipe"
          options={safeAllTypes}
          selected={safeSelectedTypes}
          k="selectedTypes"
        />

        {/* Size */}
        <FilterGroup
          title="Ukuran"
          options={safeAllSizes}
          selected={safeSelectedSizes}
          k="selectedSizes"
        />

        {/* Collection */}
        {safeAllCollections.length > 0 ? (
          <FilterGroup
            title="Koleksi"
            options={safeAllCollections}
            selected={safeSelectedCollections}
            k="selectedCollections"
          />
        ) : null}

        {/* Sort */}
        <section className="fpGroup fpGroup--sort" aria-label="Opsi pengurutan">
          <div className="fpGroup__head">
            <h4 className="fpGroup__title">Urutkan</h4>
            {sortBy && (
              <button
                type="button"
                className="fpGroup__clear"
                onClick={() => onSortChange("")}
                disabled={Boolean(disabled)}
                aria-label="Reset pengurutan"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="fpChips">
            {sortOptions.map((opt) => {
              const isActive = sortBy === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`fpChip ${isActive ? "is-active" : ""}`}
                  onClick={() => onSortChange(opt.value)}
                  disabled={Boolean(disabled)}
                  aria-pressed={isActive}
                >
                  <span className="fpChip__label">{opt.label}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="fpChip__check">
                      <path d="M11.5 3.5L5 10L2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

// Memoize FilterPanel to prevent unnecessary re-renders
// Only re-render when props actually change
export default React.memo(FilterPanel, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders when arrays have same content
  const arraysEqual = (a: string[], b: string[]): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  const rangeEqual = (a: Range, b: Range): boolean => {
    return a[0] === b[0] && a[1] === b[1];
  };

  return (
    rangeEqual(prevProps.priceRange, nextProps.priceRange) &&
    arraysEqual(prevProps.selectedTypes, nextProps.selectedTypes) &&
    arraysEqual(prevProps.selectedSizes, nextProps.selectedSizes) &&
    arraysEqual(prevProps.selectedCollections, nextProps.selectedCollections) &&
    arraysEqual(prevProps.allTypes, nextProps.allTypes) &&
    arraysEqual(prevProps.allSizes, nextProps.allSizes) &&
    arraysEqual(prevProps.allCollections, nextProps.allCollections) &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.embedded === nextProps.embedded &&
    prevProps.hideHeader === nextProps.hideHeader &&
    prevProps.variant === nextProps.variant &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onPriceChange === nextProps.onPriceChange &&
    prevProps.onToggleFilter === nextProps.onToggleFilter &&
    prevProps.onClearFilter === nextProps.onClearFilter &&
    prevProps.onSortChange === nextProps.onSortChange
  );
});

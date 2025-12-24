import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/FilterComponentPanelComponent.css";
import { BOUQUET_SIZES } from "../constants/bouquet-constants";

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
  const isTopbar = variant === "topbar";
  const [openGroups, setOpenGroups] = React.useState<
    Record<"selectedTypes" | "selectedSizes" | "selectedCollections", boolean>
  >(() => {
    const types = allTypes.length ? allTypes : ["Orchid", "Mixed"];
    const sizes = allSizes.length ? allSizes : [...BOUQUET_SIZES];
    const collections = allCollections;

    return {
      selectedTypes: isTopbar ? true : selectedTypes.length > 0 || types.length <= 8,
      selectedSizes: isTopbar ? true : selectedSizes.length > 0 || sizes.length <= 8,
      selectedCollections: isTopbar ? true : selectedCollections.length > 0 || collections.length <= 8,
    };
  });

  const toggleGroup = (
    k: "selectedTypes" | "selectedSizes" | "selectedCollections"
  ) => {
    setOpenGroups((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2)
      onPriceChange([value[0], value[1]]);
  };

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
    const isOpen = isTopbar ? true : openGroups[k];
    const panelId = `fp-panel-${k}`;
    const meta = selected.length ? `${selected.length} dipilih` : "Semua";

    return (
      <section className="fpGroup" aria-label={`Filter ${title}`}>
        <div className="fpGroup__head">
          {isTopbar ? (
            <div className="fpGroup__toggle fpGroup__toggle--static" aria-hidden="true">
              <span className="fpGroup__title">{title}</span>
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
              <span className="fpGroup__meta">{meta}</span>
              <span className="fpGroup__chev" aria-hidden="true" />
            </button>
          )}

        <button
          type="button"
          className="fpGroup__clear"
          onClick={() => onClearFilter(k)}
          disabled={Boolean(disabled) || selected.length === 0}
        >
          Hapus
        </button>
        </div>

        <div id={panelId} className="fpGroup__panel" hidden={!isOpen}>
          <div className="fpOptions" role="list">
            <button
              type="button"
              className={`fpOption ${selected.length === 0 ? "is-active" : ""}`}
              onClick={() => onClearFilter(k)}
              disabled={Boolean(disabled)}
              aria-pressed={selected.length === 0}
            >
              <span className="fpOption__label">Semua</span>
            </button>

            {options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  className={`fpOption ${isSelected ? "is-active" : ""}`}
                  onClick={() => onToggleFilter(k, opt)}
                  disabled={Boolean(disabled)}
                  aria-pressed={isSelected}
                >
                  <span className="fpOption__label">{opt}</span>
                </button>
              );
            })}
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

  return (
    <div className={panelClassName} aria-label="Panel filter">
      {!hideHeader && !embedded && (
        <header className="filterPanel__header">
          <h3 className="filterPanel__title">Filter & Urutkan</h3>
          <p className="filterPanel__hint">
            Saring berdasarkan harga, tipe, ukuran, dan koleksi.
          </p>
        </header>
      )}

      {!hideHeader && embedded && (
        <header className="filterPanel__header">
          <h3 className="filterPanel__title">Filter & Urutkan</h3>
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
              <span className="fpPrice__value">{formatRp(priceRange[0])}</span>
              <span className="fpPrice__value">{formatRp(priceRange[1])}</span>
            </div>

            <div className="fpSlider">
              <Slider
                range
                min={0}
                max={1_000_000}
                step={50_000}
                value={priceRange}
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
          options={allTypes.length ? allTypes : ["Orchid", "Mixed"]}
          selected={selectedTypes}
          k="selectedTypes"
        />

        {/* Size */}
        <FilterGroup
          title="Ukuran"
          options={allSizes.length ? allSizes : [...BOUQUET_SIZES]}
          selected={selectedSizes}
          k="selectedSizes"
        />

        {/* Collection */}
        <FilterGroup
          title="Koleksi"
          options={allCollections}
          selected={selectedCollections}
          k="selectedCollections"
        />

        {/* Sort */}
        <section className="fpGroup fpGroup--sort" aria-label="Opsi pengurutan">
          <div className="fpGroup__head">
            <h4 className="fpGroup__title">Urutkan</h4>
          </div>

          <div className="fpChips">
            {sortOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`fpChip ${sortBy === opt.value ? "is-active" : ""}`}
                onClick={() => onSortChange(opt.value)}
                disabled={Boolean(disabled)}
              >
                <span className="fpChip__label">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FilterPanel;

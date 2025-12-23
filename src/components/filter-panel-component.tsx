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
  disabled,
  onPriceChange,
  onToggleFilter,
  onClearFilter,
  onSortChange,
}) => {
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
  }> = ({ title, options, selected, k }) => (
    <section className="fpGroup" aria-label={`Filter ${title}`}>
      <div className="fpGroup__head">
        <h4 className="fpGroup__title">{title}</h4>
        <button
          type="button"
          className="fpGroup__clear"
          onClick={() => onClearFilter(k)}
          disabled={Boolean(disabled) || selected.length === 0}
        >
          Hapus
        </button>
      </div>

      <div className="fpChips" role="list">
        <button
          type="button"
          className={`fpChip ${selected.length === 0 ? "is-active" : ""}`}
          onClick={() => onClearFilter(k)}
          disabled={Boolean(disabled)}
        >
          Semua
        </button>

        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            className={`fpChip ${selected.includes(opt) ? "is-active" : ""}`}
            onClick={() => onToggleFilter(k, opt)}
            disabled={Boolean(disabled)}
          >
            {opt}
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className="filterPanel" aria-label="Panel filter">
      <header className="filterPanel__header">
        <h3 className="filterPanel__title">Filter & Urutkan</h3>
        <p className="filterPanel__hint">Saring berdasarkan harga, tipe, ukuran, dan koleksi.</p>
      </header>

      <div className="filterPanel__body">
        {/* Price */}
        <section className="fpGroup" aria-label="Filter rentang harga">
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
        <section className="fpGroup" aria-label="Opsi pengurutan">
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
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default FilterPanel;

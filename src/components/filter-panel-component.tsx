import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/FilterComponentPanelComponent.css";

type Range = [number, number];

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  allSizes: string[];
  allTypes: string[];
  sortBy: string;

  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes") => void;
  onSortChange: (value: string) => void;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const FilterPanel: React.FC<FilterPanelProps> = ({
  priceRange,
  selectedTypes,
  selectedSizes,
  allSizes,
  allTypes,
  sortBy,
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
    { label: "Default", value: "" },
    { label: "Price ↑", value: "price-asc" },
    { label: "Price ↓", value: "price-desc" },
    { label: "Name A–Z", value: "name-asc" },
    { label: "Name Z–A", value: "name-desc" },
  ];

  const FilterGroup: React.FC<{
    title: string;
    options: string[];
    selected: string[];
    k: "selectedTypes" | "selectedSizes";
  }> = ({ title, options, selected, k }) => (
    <section className="fpGroup" aria-label={`${title} filter`}>
      <div className="fpGroup__head">
        <h4 className="fpGroup__title">{title}</h4>
        <button
          type="button"
          className="fpGroup__clear"
          onClick={() => onClearFilter(k)}
          disabled={selected.length === 0}
        >
          Clear
        </button>
      </div>

      <div className="fpChips" role="list">
        <button
          type="button"
          className={`fpChip ${selected.length === 0 ? "is-active" : ""}`}
          onClick={() => onClearFilter(k)}
        >
          All
        </button>

        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            className={`fpChip ${selected.includes(opt) ? "is-active" : ""}`}
            onClick={() => onToggleFilter(k, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className="filterPanel" aria-label="Filters panel">
      <header className="filterPanel__header">
        <h3 className="filterPanel__title">Filter & Sort</h3>
        <p className="filterPanel__hint">Refine by price, type, and size.</p>
      </header>

      {/* Price */}
      <section className="fpGroup" aria-label="Price range filter">
        <div className="fpGroup__head">
          <h4 className="fpGroup__title">Price</h4>
        </div>

        <div className="fpPrice">
          <div className="fpPrice__values" aria-label="Selected price range">
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
        title="Type"
        options={allTypes.length ? allTypes : ["Orchid", "Mixed"]}
        selected={selectedTypes}
        k="selectedTypes"
      />

      {/* Size */}
      <FilterGroup
        title="Size"
        options={allSizes.length ? allSizes : ["Small", "Medium", "Large"]}
        selected={selectedSizes}
        k="selectedSizes"
      />

      {/* Sort */}
      <section className="fpGroup" aria-label="Sort options">
        <div className="fpGroup__head">
          <h4 className="fpGroup__title">Sort</h4>
        </div>

        <div className="fpChips">
          {sortOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`fpChip ${sortBy === opt.value ? "is-active" : ""}`}
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FilterPanel;

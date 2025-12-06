// src/components/filter-panel-component.tsx
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
  sortBy: string;
  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes") => void;
  onSortChange: (value: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  priceRange,
  selectedTypes,
  selectedSizes,
  allSizes,
  sortBy,
  onPriceChange,
  onToggleFilter,
  onClearFilter,
  onSortChange,
}) => {
  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value) && value.length === 2) {
      onPriceChange([value[0], value[1]]);
    }
  };

  const renderFilterGroup = (
    label: string,
    options: string[],
    selected: string[],
    key: "selectedTypes" | "selectedSizes"
  ) => (
    <label>
      {label}:
      <div className="filter-group">
        {options.map((opt) => (
          <button
            key={opt}
            className={`filter-button ${
              selected.includes(opt) ? "active" : ""
            }`}
            onClick={() => onToggleFilter(key, opt)}
          >
            {opt}
          </button>
        ))}
        <button
          className={`filter-button ${selected.length === 0 ? "active" : ""}`}
          onClick={() => onClearFilter(key)}
        >
          All
        </button>
      </div>
    </label>
  );

  const sortOptions: FilterOption[] = [
    { label: "Default", value: "" },
    { label: "Price ↑", value: "price-asc" },
    { label: "Price ↓", value: "price-desc" },
    { label: "Name A–Z", value: "name-asc" },
    { label: "Name Z–A", value: "name-desc" },
  ];

  return (
    <div className="filter-panel">
      <h3>Filter Bouquets</h3>

      {/* Price Range */}
      <label>
        Price Range (Rp):
        <div className="price-slider">
          <div className="price-values">
            <span>Rp {priceRange[0].toLocaleString()}</span>
            <span>Rp {priceRange[1].toLocaleString()}</span>
          </div>
          <Slider
            range
            min={0}
            max={1000000}
            step={50000}
            value={priceRange}
            onChange={handlePriceChange}
            pushable={100000}
            allowCross={false}
            trackStyle={[{ backgroundColor: "#d48c9c" }]}
            handleStyle={[
              { borderColor: "#d48c9c", backgroundColor: "#fff" },
              { borderColor: "#d48c9c", backgroundColor: "#fff" },
            ]}
          />
        </div>
      </label>

      {/* Type Filter */}
      {renderFilterGroup(
        "Type",
        ["Orchid", "Mixed"],
        selectedTypes,
        "selectedTypes"
      )}

      {/* Size Filter */}
      {renderFilterGroup(
        "Size",
        allSizes.length ? allSizes : ["Small", "Medium", "Large"],
        selectedSizes,
        "selectedSizes"
      )}

      {/* Sort Options */}
      <label>
        Sort By:
        <div className="filter-group">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              className={`filter-button ${
                sortBy === opt.value ? "active" : ""
              }`}
              onClick={() => onSortChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </label>
    </div>
  );
};

export default FilterPanel;

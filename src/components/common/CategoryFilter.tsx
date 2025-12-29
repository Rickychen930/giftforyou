/**
 * Category Filter Component
 * Luxury and responsive category filter buttons
 */

import React from "react";
import "../../styles/CategoryFilter.css";

interface CategoryFilterProps<T extends string> {
  categories: readonly T[];
  selectedCategory: T;
  onCategoryChange: (category: T) => void;
  className?: string;
}

/**
 * Category Filter Component
 * Luxury styled category filter buttons
 */
function CategoryFilter<T extends string>({
  categories,
  selectedCategory,
  onCategoryChange,
  className = "",
}: CategoryFilterProps<T>) {
  return (
    <div className={`categoryFilter ${className}`}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`categoryFilter__button ${
            selectedCategory === category ? "categoryFilter__button--active" : ""
          }`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;


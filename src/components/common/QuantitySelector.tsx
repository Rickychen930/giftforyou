/**
 * Quantity Selector Component
 * Luxury and responsive quantity selector with increment/decrement buttons
 */

import React from "react";
import "../../styles/QuantitySelector.css";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Quantity Selector Component
 * Luxury styled quantity selector
 */
const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 999,
  onChange,
  disabled = false,
  className = "",
  size = "md",
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`quantitySelector quantitySelector--${size} ${className}`}>
      <button
        type="button"
        className="quantitySelector__button quantitySelector__button--decrement"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Kurangi jumlah"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="quantitySelector__value">{value}</span>
      <button
        type="button"
        className="quantitySelector__button quantitySelector__button--increment"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Tambah jumlah"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default QuantitySelector;


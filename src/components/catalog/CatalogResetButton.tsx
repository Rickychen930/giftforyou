/**
 * Catalog Reset Button Component
 * Luxury and responsive reset/clear filter button
 */

import React from "react";
import LuxuryButton from "../LuxuryButton";
import "../../styles/CatalogResetButton.css";

interface CatalogResetButtonProps {
  onClearAll: () => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
}

/**
 * Catalog Reset Button Component
 * Luxury styled reset button for clearing all filters
 */
const CatalogResetButton: React.FC<CatalogResetButtonProps> = ({
  onClearAll,
  disabled = false,
  label = "Reset Filter",
  ariaLabel = "Hapus semua filter dan reset pencarian",
}) => {
  return (
    <LuxuryButton
      variant="outline"
      size="sm"
      onClick={onClearAll}
      disabled={disabled}
      aria-label={ariaLabel}
      className="catalogResetBtn"
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      }
      iconPosition="left"
    >
      {label}
    </LuxuryButton>
  );
};

export default CatalogResetButton;


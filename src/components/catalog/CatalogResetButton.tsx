/**
 * Catalog Reset Button Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import LuxuryButton from "../buttons/LuxuryButton";
import "../../styles/CatalogResetButton.css";

interface CatalogResetButtonProps {
  onClearAll: () => void;
  disabled?: boolean;
  label?: string;
  ariaLabel?: string;
}

interface CatalogResetButtonState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Reset Button Component
 * Class-based component for reset button
 */
class CatalogResetButton extends Component<CatalogResetButtonProps, CatalogResetButtonState> {
  private baseClass: string = "catalogResetBtn";

  private handleClick = (): void => {
    this.props.onClearAll();
  };

  render(): React.ReactNode {
    const {
      disabled = false,
      label = "Reset Filter",
      ariaLabel = "Hapus semua filter dan reset pencarian",
    } = this.props;

    return (
      <LuxuryButton
        variant="outline"
        size="sm"
        onClick={this.handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={this.baseClass}
        icon={
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        iconPosition="left"
      >
        {label}
      </LuxuryButton>
    );
  }
}

export default CatalogResetButton;

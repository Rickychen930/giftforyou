/**
 * Catalog View Controls Component (OOP)
 * Class-based component for view controls (items per page, view mode)
 * Following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/catalog/CatalogViewControls.css";

export interface CatalogViewControlsProps {
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  disabled?: boolean;
}

interface CatalogViewControlsState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog View Controls Component
 * Allows users to control how many items are displayed per page
 */
class CatalogViewControls extends Component<CatalogViewControlsProps, CatalogViewControlsState> {
  private baseClass: string = "catalog-view-controls";

  private readonly itemsPerPageOptions = [12, 24, 36, 48, 60];

  private handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = Number.parseInt(e.target.value, 10);
    if (Number.isFinite(value) && value > 0) {
      this.props.onItemsPerPageChange(value);
    }
  };

  render(): React.ReactNode {
    const { itemsPerPage, totalItems, disabled = false } = this.props;

    return (
      <div className={this.baseClass} aria-label="Kontrol tampilan">
        <div className={`${this.baseClass}__group`}>
          <label htmlFor={`${this.baseClass}__items-select`} className={`${this.baseClass}__label`}>
            Tampilkan:
          </label>
          <select
            id={`${this.baseClass}__items-select`}
            className={`${this.baseClass}__select`}
            value={itemsPerPage}
            onChange={this.handleItemsPerPageChange}
            disabled={disabled}
            aria-label="Jumlah item per halaman"
          >
            {this.itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per halaman
              </option>
            ))}
          </select>
        </div>
        <div className={`${this.baseClass}__info`}>
          <span className={`${this.baseClass}__total`}>
            Total: <strong>{totalItems}</strong> bouquet
          </span>
        </div>
      </div>
    );
  }
}

export default CatalogViewControls;


/**
 * Product Header Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/bouquet-detail/ProductHeader.css";
import { formatIDR } from "../../utils/money";
import { formatBouquetName } from "../../utils/text-formatter";
import StatusBadge from "../common/StatusBadge";

interface ProductHeaderProps {
  name: string;
  price: number;
  status: "ready" | "preorder";
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

interface ProductHeaderState {
  // No state needed, but keeping for consistency
}

/**
 * Product Header Component
 * Class-based component for product header
 */
class ProductHeader extends Component<ProductHeaderProps, ProductHeaderState> {
  private baseClass: string = "product-header";

  private handleFavoriteToggle = (): void => {
    this.props.onFavoriteToggle();
  };

  render(): React.ReactNode {
    const { name, price, status, isFavorite } = this.props;

    return (
      <div className={this.baseClass}>
        <div className={`${this.baseClass}__top`}>
          <h1 className={`${this.baseClass}__title`} id="bouquet-title">
            {formatBouquetName(name)}
          </h1>
          <button
            type="button"
            className={`${this.baseClass}__favorite ${
              isFavorite ? `${this.baseClass}__favorite--active` : ""
            }`}
            onClick={this.handleFavoriteToggle}
            aria-label={isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={`${this.baseClass}__price-row`}>
          <div className={`${this.baseClass}__price`}>
            <span className={`${this.baseClass}__price-label`}>Harga</span>
            <span className={`${this.baseClass}__price-value`}>{formatIDR(price)}</span>
          </div>
          <StatusBadge
            type={status}
            size="md"
            className={`${this.baseClass}__status`}
          />
        </div>
      </div>
    );
  }
}

export default ProductHeader;

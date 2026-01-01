/**
 * Cart Item Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../../utils/money";
import { buildImageUrl } from "../../utils/image-utils";
import { calculateBulkDiscount } from "../../utils/bulk-discount";
import QuantitySelector from "./QuantitySelector";
import IconButton from "./IconButton";
import "../../styles/CartItemCard.css";

interface CartItemCardProps {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  quantity: number;
  image?: string;
  itemTotal: number;
  fallbackImage?: string;
  onQuantityChange: (newQuantity: number) => void;
  onSaveForLater: () => void;
  onRemove: () => void;
}

interface CartItemCardState {
  // No state needed, but keeping for consistency
}

/**
 * Cart Item Card Component
 * Class-based component for cart items
 */
class CartItemCard extends Component<CartItemCardProps, CartItemCardState> {
  private baseClass: string = "cartItemCard";

  private getImageUrl(): string {
    const { image, fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;
    return image ? buildImageUrl(image) : fallbackImage;
  }

  private getDiscount() {
    const { bouquetPrice, quantity } = this.props;
    return calculateBulkDiscount(bouquetPrice, quantity);
  }

  private hasDiscount(): boolean {
    return this.getDiscount().discountAmount > 0;
  }

  private renderSaveIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  private renderRemoveIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  render(): React.ReactNode {
    const {
      bouquetId,
      bouquetName,
      bouquetPrice,
      quantity,
      itemTotal,
      onQuantityChange,
      onSaveForLater,
      onRemove,
    } = this.props;

    const discount = this.getDiscount();
    const hasDiscount = this.hasDiscount();

    return (
      <div className={this.baseClass}>
        <Link to={`/bouquet/${bouquetId}`} className={`${this.baseClass}__image`}>
          <img src={this.getImageUrl()} alt={bouquetName} loading="lazy" />
        </Link>

        <div className={`${this.baseClass}__details`}>
          <Link to={`/bouquet/${bouquetId}`} className={`${this.baseClass}__name`}>
            {bouquetName}
          </Link>
          <div className={`${this.baseClass}__price`}>
            {formatIDR(bouquetPrice)} {hasDiscount && <span className={`${this.baseClass}__discount`}>per item</span>}
          </div>
          {hasDiscount && (
            <div className={`${this.baseClass}__bulkDiscount`}>
              Diskon {discount.discountPercentage}% untuk {quantity} item
            </div>
          )}
        </div>

        <div className={`${this.baseClass}__quantity`}>
          <QuantitySelector
            value={quantity}
            min={1}
            onChange={onQuantityChange}
            size="sm"
          />
        </div>

        <div className={`${this.baseClass}__total`}>
          <div className={`${this.baseClass}__totalLabel`}>Subtotal</div>
          <div className={`${this.baseClass}__totalValue`}>{formatIDR(itemTotal)}</div>
          {hasDiscount && (
            <div className={`${this.baseClass}__originalPrice`}>
              {formatIDR(bouquetPrice * quantity)}
            </div>
          )}
        </div>

        <div className={`${this.baseClass}__actions`}>
          <IconButton
            variant="secondary"
            size="md"
            onClick={onSaveForLater}
            icon={this.renderSaveIcon()}
            ariaLabel="Simpan untuk nanti"
            tooltip="Simpan untuk nanti"
          />
          <IconButton
            variant="danger"
            size="md"
            onClick={onRemove}
            icon={this.renderRemoveIcon()}
            ariaLabel="Hapus item"
            tooltip="Hapus item"
          />
        </div>
      </div>
    );
  }
}

export default CartItemCard;

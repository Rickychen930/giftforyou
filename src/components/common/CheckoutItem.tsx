/**
 * Checkout Item Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../../utils/money";
import { buildImageUrl } from "../../utils/image-utils";
import "../../styles/CheckoutItem.css";

interface CheckoutItemProps {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  quantity: number;
  image?: string;
  itemTotal: number;
  discountPercentage?: number;
  fallbackImage?: string;
}

interface CheckoutItemState {
  // No state needed, but keeping for consistency
}

/**
 * Checkout Item Component
 * Class-based component for checkout items
 */
class CheckoutItem extends Component<CheckoutItemProps, CheckoutItemState> {
  private baseClass: string = "checkoutItem";

  private getImageUrl(): string {
    const { image, fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;
    return image ? buildImageUrl(image) : fallbackImage;
  }

  private hasDiscount(): boolean {
    const { discountPercentage } = this.props;
    return discountPercentage !== undefined && discountPercentage > 0;
  }

  render(): React.ReactNode {
    const { bouquetId, bouquetName, bouquetPrice, quantity, itemTotal, discountPercentage } = this.props;

    return (
      <div className={this.baseClass}>
        <Link to={`/bouquet/${bouquetId}`} className={`${this.baseClass}__image`}>
          <img
            src={this.getImageUrl()}
            alt={bouquetName}
            loading="lazy"
          />
        </Link>
        <div className={`${this.baseClass}__details`}>
          <Link to={`/bouquet/${bouquetId}`} className={`${this.baseClass}__name`}>
            {bouquetName}
          </Link>
          <div className={`${this.baseClass}__meta`}>
            <span className={`${this.baseClass}__price`}>
              {formatIDR(bouquetPrice)} x {quantity}
            </span>
            {this.hasDiscount() && (
              <span className={`${this.baseClass}__discount`}>
                Diskon {discountPercentage}%
              </span>
            )}
          </div>
        </div>
        <div className={`${this.baseClass}__total`}>
          {formatIDR(itemTotal)}
        </div>
      </div>
    );
  }
}

export default CheckoutItem;

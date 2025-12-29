/**
 * Checkout Item Component
 * Luxury and responsive checkout item card
 */

import React from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../../utils/money";
import { buildImageUrl } from "../../utils/image-utils";
import { calculateBulkDiscount } from "../../utils/bulk-discount";
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

/**
 * Checkout Item Component
 * Luxury styled checkout item card
 */
const CheckoutItem: React.FC<CheckoutItemProps> = ({
  bouquetId,
  bouquetName,
  bouquetPrice,
  quantity,
  image,
  itemTotal,
  discountPercentage,
  fallbackImage = "/images/placeholder-bouquet.jpg",
}) => {
  const hasDiscount = discountPercentage !== undefined && discountPercentage > 0;
  const imageUrl = image ? buildImageUrl(image) : fallbackImage;

  return (
    <div className="checkoutItem">
      <Link to={`/bouquet/${bouquetId}`} className="checkoutItem__image">
        <img
          src={imageUrl}
          alt={bouquetName}
          loading="lazy"
        />
      </Link>
      <div className="checkoutItem__details">
        <Link to={`/bouquet/${bouquetId}`} className="checkoutItem__name">
          {bouquetName}
        </Link>
        <div className="checkoutItem__meta">
          <span className="checkoutItem__price">
            {formatIDR(bouquetPrice)} x {quantity}
          </span>
          {hasDiscount && (
            <span className="checkoutItem__discount">
              Diskon {discountPercentage}%
            </span>
          )}
        </div>
      </div>
      <div className="checkoutItem__total">
        {formatIDR(itemTotal)}
      </div>
    </div>
  );
};

export default CheckoutItem;


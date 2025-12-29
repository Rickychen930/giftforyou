/**
 * Cart Item Card Component
 * Luxury and responsive cart item card
 */

import React from "react";
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

/**
 * Cart Item Card Component
 * Luxury styled cart item card
 */
const CartItemCard: React.FC<CartItemCardProps> = ({
  bouquetId,
  bouquetName,
  bouquetPrice,
  quantity,
  image,
  itemTotal,
  fallbackImage = "/images/placeholder-bouquet.jpg",
  onQuantityChange,
  onSaveForLater,
  onRemove,
}) => {
  const discount = calculateBulkDiscount(bouquetPrice, quantity);
  const hasDiscount = discount.discountAmount > 0;
  const imageUrl = image ? buildImageUrl(image) : fallbackImage;

  return (
    <div className="cartItemCard">
      <Link to={`/bouquet/${bouquetId}`} className="cartItemCard__image">
        <img src={imageUrl} alt={bouquetName} loading="lazy" />
      </Link>

      <div className="cartItemCard__details">
        <Link to={`/bouquet/${bouquetId}`} className="cartItemCard__name">
          {bouquetName}
        </Link>
        <div className="cartItemCard__price">
          {formatIDR(bouquetPrice)} {hasDiscount && <span className="cartItemCard__discount">per item</span>}
        </div>
        {hasDiscount && (
          <div className="cartItemCard__bulkDiscount">
            Diskon {discount.discountPercentage}% untuk {quantity} item
          </div>
        )}
      </div>

      <div className="cartItemCard__quantity">
        <QuantitySelector
          value={quantity}
          min={1}
          onChange={onQuantityChange}
          size="sm"
        />
      </div>

      <div className="cartItemCard__total">
        <div className="cartItemCard__totalLabel">Subtotal</div>
        <div className="cartItemCard__totalValue">{formatIDR(itemTotal)}</div>
        {hasDiscount && (
          <div className="cartItemCard__originalPrice">
            {formatIDR(bouquetPrice * quantity)}
          </div>
        )}
      </div>

      <div className="cartItemCard__actions">
        <IconButton
          variant="secondary"
          size="md"
          onClick={onSaveForLater}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          ariaLabel="Simpan untuk nanti"
          tooltip="Simpan untuk nanti"
        />
        <IconButton
          variant="danger"
          size="md"
          onClick={onRemove}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          ariaLabel="Hapus item"
          tooltip="Hapus item"
        />
      </div>
    </div>
  );
};

export default CartItemCard;


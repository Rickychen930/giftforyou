/**
 * Favorite Card Component
 * Luxury and responsive favorite item card
 */

import React from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../../utils/money";
import { buildImageUrl } from "../../utils/image-utils";
import LuxuryButton from "../LuxuryButton";
import IconButton from "./IconButton";
import "../../styles/FavoriteCard.css";

interface FavoriteCardProps {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  bouquetImage?: string;
  addedAt: number;
  fallbackImage?: string;
  formatDate: (timestamp: number) => string;
  onQuickOrder: () => void;
  onAddToCart: () => void;
  onRemove: () => void;
}

/**
 * Favorite Card Component
 * Luxury styled favorite item card
 */
const FavoriteCard: React.FC<FavoriteCardProps> = ({
  bouquetId,
  bouquetName,
  bouquetPrice,
  bouquetImage,
  addedAt,
  fallbackImage = "/images/placeholder-bouquet.jpg",
  formatDate,
  onQuickOrder,
  onAddToCart,
  onRemove,
}) => {
  const imageUrl = bouquetImage ? buildImageUrl(bouquetImage) : fallbackImage;

  return (
    <div className="favoriteCard reveal-on-scroll">
      <Link to={`/bouquet/${bouquetId}`} className="favoriteCard__link">
        <div className="favoriteCard__imageWrapper">
          <img src={imageUrl} alt={bouquetName} className="favoriteCard__image" loading="lazy" />
          <div className="favoriteCard__overlay">
            <span className="favoriteCard__view">Lihat Detail</span>
          </div>
        </div>
      </Link>

      <div className="favoriteCard__content">
        <h3 className="favoriteCard__title">{bouquetName}</h3>
        <p className="favoriteCard__price">{formatIDR(bouquetPrice)}</p>
        <p className="favoriteCard__date">Ditambahkan {formatDate(addedAt)}</p>
      </div>

      <div className="favoriteCard__actions">
        <LuxuryButton
          variant="primary"
          onClick={onQuickOrder}
          className="favoriteCard__btn favoriteCard__btn--primary"
          size="sm"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
              <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          iconPosition="left"
        >
          Quick Order
        </LuxuryButton>
        <div className="favoriteCard__actionGroup">
          <IconButton
            variant="primary"
            size="md"
            onClick={onAddToCart}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            ariaLabel={`Tambahkan ${bouquetName} ke keranjang`}
            tooltip="Tambahkan ke keranjang"
          />
          <Link
            to={`/bouquet/${bouquetId}`}
            className="favoriteCard__btn favoriteCard__btn--view"
            aria-label={`Lihat detail ${bouquetName}`}
            title="Lihat detail"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <IconButton
            variant="danger"
            size="md"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            ariaLabel={`Hapus ${bouquetName} dari favorit`}
            tooltip="Hapus dari favorit"
          />
        </div>
      </div>
    </div>
  );
};

export default FavoriteCard;


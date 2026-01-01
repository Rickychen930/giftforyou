/**
 * Favorite Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
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

interface FavoriteCardState {
  // No state needed, but keeping for consistency
}

/**
 * Favorite Card Component
 * Class-based component for favorite items
 */
class FavoriteCard extends Component<FavoriteCardProps, FavoriteCardState> {
  private baseClass: string = "favoriteCard";

  private getImageUrl(): string {
    const { bouquetImage, fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;
    return bouquetImage ? buildImageUrl(bouquetImage) : fallbackImage;
  }

  private renderQuickOrderIcon(): React.ReactNode {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
        <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  private renderAddToCartIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  private renderViewIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  private renderRemoveIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  render(): React.ReactNode {
    const {
      bouquetId,
      bouquetName,
      bouquetPrice,
      addedAt,
      formatDate,
      onQuickOrder,
      onAddToCart,
      onRemove,
    } = this.props;

    return (
      <div className={`${this.baseClass} reveal-on-scroll`}>
        <Link to={`/bouquet/${bouquetId}`} className={`${this.baseClass}__link`}>
          <div className={`${this.baseClass}__imageWrapper`}>
            <img src={this.getImageUrl()} alt={bouquetName} className={`${this.baseClass}__image`} loading="lazy" />
            <div className={`${this.baseClass}__overlay`}>
              <span className={`${this.baseClass}__view`}>Lihat Detail</span>
            </div>
          </div>
        </Link>

        <div className={`${this.baseClass}__content`}>
          <h3 className={`${this.baseClass}__title`}>{bouquetName}</h3>
          <p className={`${this.baseClass}__price`}>{formatIDR(bouquetPrice)}</p>
          <p className={`${this.baseClass}__date`}>Ditambahkan {formatDate(addedAt)}</p>
        </div>

        <div className={`${this.baseClass}__actions`}>
          <LuxuryButton
            variant="primary"
            onClick={onQuickOrder}
            className={`${this.baseClass}__btn ${this.baseClass}__btn--primary`}
            size="sm"
            icon={this.renderQuickOrderIcon()}
            iconPosition="left"
          >
            Quick Order
          </LuxuryButton>
          <div className={`${this.baseClass}__actionGroup`}>
            <IconButton
              variant="primary"
              size="md"
              onClick={onAddToCart}
              icon={this.renderAddToCartIcon()}
              ariaLabel={`Tambahkan ${bouquetName} ke keranjang`}
              tooltip="Tambahkan ke keranjang"
            />
            <Link
              to={`/bouquet/${bouquetId}`}
              className={`${this.baseClass}__btn ${this.baseClass}__btn--view`}
              aria-label={`Lihat detail ${bouquetName}`}
              title="Lihat detail"
            >
              {this.renderViewIcon()}
            </Link>
            <IconButton
              variant="danger"
              size="md"
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              icon={this.renderRemoveIcon()}
              ariaLabel={`Hapus ${bouquetName} dari favorit`}
              tooltip="Hapus dari favorit"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default FavoriteCard;

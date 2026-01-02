/**
 * Bouquet Card Actions Component
 * Reusable quick actions for bouquet cards
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and fully responsive
 */

import React, { Component } from "react";
import "../../../styles/cards/bouquet/BouquetCardActions.css";

export interface BouquetCardActionsProps {
  isFavorited: boolean;
  showQuickActions: boolean;
  onFavoriteToggle: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onQuickOrder: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface BouquetCardActionsState {
  // No state needed, but keeping for consistency
}

/**
 * Bouquet Card Actions Component
 * Handles quick action buttons (favorite, cart, WhatsApp)
 * Follows Single Responsibility Principle: only handles actions rendering
 */
export class BouquetCardActions extends Component<BouquetCardActionsProps, BouquetCardActionsState> {
  private baseClass: string = "bouquet-card-actions";

  render(): React.ReactNode {
    const {
      isFavorited,
      showQuickActions,
      onFavoriteToggle,
      onAddToCart,
      onQuickOrder,
      onMouseEnter,
      onMouseLeave,
    } = this.props;

    return (
      <div
        className={`${this.baseClass} ${showQuickActions ? "is-visible" : ""}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <button
          type="button"
          className={`${this.baseClass}__action ${this.baseClass}__action--favorite ${isFavorited ? "is-active" : ""}`}
          onClick={onFavoriteToggle}
          aria-label={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
          title={isFavorited ? "Hapus dari favorit" : "Tambahkan ke favorit"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFavorited ? "currentColor" : "none"}
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
        <button
          type="button"
          className={`${this.baseClass}__action ${this.baseClass}__action--cart`}
          onClick={onAddToCart}
          aria-label="Tambahkan ke keranjang"
          title="Tambahkan ke keranjang"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v6M9 12h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${this.baseClass}__action ${this.baseClass}__action--order`}
          onClick={onQuickOrder}
          aria-label="Order cepat via WhatsApp"
          title="Order cepat via WhatsApp"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    );
  }
}

export default BouquetCardActions;


/**
 * Order History Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { formatIDR } from "../../utils/money";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import LuxuryButton from "../LuxuryButton";
import IconButton from "./IconButton";
import "../../styles/OrderHistoryCard.css";

interface OrderHistoryCardProps {
  bouquetName: string;
  bouquetPrice: number;
  quantity: number;
  deliveryDate: string;
  deliveryType: "delivery" | "pickup";
  address?: string;
  greetingCard?: string;
  totalPrice: number;
  formatDate: (dateString: string) => string;
  buildReorderMessage: () => string;
  onReorder: () => void;
  onQuickAddToCart?: () => void;
  hasBouquetId?: boolean;
}

interface OrderHistoryCardState {
  // No state needed, but keeping for consistency
}

/**
 * Order History Card Component
 * Class-based component for order history items
 */
class OrderHistoryCard extends Component<OrderHistoryCardProps, OrderHistoryCardState> {
  private baseClass: string = "orderHistoryCard";

  private getWhatsAppLink(): string {
    return buildWhatsAppLink(this.props.buildReorderMessage());
  }

  private renderReorderIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 3v5h5M21 21v-5h-5M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

  private renderWhatsAppIcon(): React.ReactNode {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
      </svg>
    );
  }

  render(): React.ReactNode {
    const {
      bouquetName,
      quantity,
      deliveryDate,
      deliveryType,
      address,
      greetingCard,
      totalPrice,
      formatDate,
      onReorder,
      onQuickAddToCart,
      hasBouquetId = false,
    } = this.props;

    return (
      <div className={`${this.baseClass} reveal-on-scroll`}>
        <div className={`${this.baseClass}__header`}>
          <div className={`${this.baseClass}__info`}>
            <h3 className={`${this.baseClass}__title`}>{bouquetName || "Bouquet"}</h3>
            <p className={`${this.baseClass}__date`}>{formatDate(deliveryDate)}</p>
          </div>
          <div className={`${this.baseClass}__price`}>{formatIDR(totalPrice)}</div>
        </div>

        <div className={`${this.baseClass}__details`}>
          <div className={`${this.baseClass}__detail`}>
            <span className={`${this.baseClass}__label`}>Jumlah:</span>
            <span className={`${this.baseClass}__value`}>{quantity} pcs</span>
          </div>
          <div className={`${this.baseClass}__detail`}>
            <span className={`${this.baseClass}__label`}>Tipe:</span>
            <span className={`${this.baseClass}__value`}>
              {deliveryType === "pickup" ? "Ambil di Toko" : "Diantar"}
            </span>
          </div>
          {deliveryType === "delivery" && address && (
            <div className={`${this.baseClass}__detail`}>
              <span className={`${this.baseClass}__label`}>Alamat:</span>
              <span className={`${this.baseClass}__value`}>{address}</span>
            </div>
          )}
          {greetingCard && (
            <div className={`${this.baseClass}__detail`}>
              <span className={`${this.baseClass}__label`}>Kartu Ucapan:</span>
              <span className={`${this.baseClass}__value`}>{greetingCard}</span>
            </div>
          )}
        </div>

        <div className={`${this.baseClass}__actions`}>
          <LuxuryButton
            variant="primary"
            onClick={onReorder}
            className={`${this.baseClass}__btn ${this.baseClass}__btn--primary`}
            size="sm"
            icon={this.renderReorderIcon()}
            iconPosition="left"
          >
            Pesan Ulang
          </LuxuryButton>
          <div className={`${this.baseClass}__actionGroup`}>
            {hasBouquetId && onQuickAddToCart && (
              <IconButton
                variant="primary"
                size="md"
                onClick={onQuickAddToCart}
                icon={this.renderAddToCartIcon()}
                ariaLabel="Tambahkan ke keranjang"
                tooltip="Tambahkan ke keranjang"
              />
            )}
            <a
              href={this.getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${this.baseClass}__btn ${this.baseClass}__btn--secondary`}
              aria-label="Pesan via WhatsApp"
            >
              {this.renderWhatsAppIcon()}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderHistoryCard;

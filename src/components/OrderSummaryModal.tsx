import React from "react";
import "../styles/OrderSummaryModal.css";
import { formatIDR } from "../utils/money";
import type { CartItem } from "../utils/cart";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import LuxuryButton from "./LuxuryButton";

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: CartItem[];
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  orderNotes: string;
  subtotal: number;
  deliveryPrice: number;
  total: number;
  isSubmitting?: boolean;
}

const OrderSummaryModal: React.FC<OrderSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  deliveryType,
  deliveryDate,
  deliveryTimeSlot,
  address,
  greetingCard,
  orderNotes,
  subtotal,
  deliveryPrice,
  total,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const getTimeSlotLabel = (slotId: string): string => {
    switch (slotId) {
      case "morning":
        return "Pagi (09:00-12:00)";
      case "afternoon":
        return "Siang (12:00-15:00)";
      case "evening":
        return "Sore (15:00-18:00)";
      default:
        return slotId;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="orderSummaryModal" onClick={onClose}>
      <div className="orderSummaryModal__overlay"></div>
      <div
        className="orderSummaryModal__content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="order-summary-title"
        aria-modal="true"
      >
        <div className="orderSummaryModal__header">
          <h2 id="order-summary-title" className="orderSummaryModal__title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Ringkasan Pesanan
          </h2>
          <button
            type="button"
            className="orderSummaryModal__close"
            onClick={onClose}
            aria-label="Tutup preview"
            disabled={isSubmitting}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="orderSummaryModal__body">
          {/* Items */}
          <div className="orderSummaryModal__section">
            <h3 className="orderSummaryModal__sectionTitle">Items</h3>
            <div className="orderSummaryModal__items">
              {items.map((item) => {
                const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
                const hasDiscount = discount.discountAmount > 0;

                return (
                  <div key={item.bouquetId} className="orderSummaryModal__item">
                    <div className="orderSummaryModal__itemInfo">
                      <span className="orderSummaryModal__itemName">{item.bouquetName}</span>
                      <span className="orderSummaryModal__itemDetails">
                        {formatIDR(item.bouquetPrice)} x {item.quantity}
                        {hasDiscount && (
                          <span className="orderSummaryModal__itemDiscount">
                            {" "}(Diskon {discount.discountPercentage}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="orderSummaryModal__itemTotal">
                      {formatIDR(discount.finalPrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="orderSummaryModal__section">
            <h3 className="orderSummaryModal__sectionTitle">Informasi Pengiriman</h3>
            <div className="orderSummaryModal__infoGrid">
              <div className="orderSummaryModal__infoItem">
                <span className="orderSummaryModal__infoLabel">Tipe</span>
                <span className="orderSummaryModal__infoValue">
                  {deliveryType === "delivery" ? "🚚 Diantar" : "🏪 Ambil di Toko"}
                </span>
              </div>
              <div className="orderSummaryModal__infoItem">
                <span className="orderSummaryModal__infoLabel">Tanggal</span>
                <span className="orderSummaryModal__infoValue">{formatDate(deliveryDate)}</span>
              </div>
              {deliveryTimeSlot && (
                <div className="orderSummaryModal__infoItem">
                  <span className="orderSummaryModal__infoLabel">Waktu</span>
                  <span className="orderSummaryModal__infoValue">{getTimeSlotLabel(deliveryTimeSlot)}</span>
                </div>
              )}
              {deliveryType === "delivery" && address && (
                <div className="orderSummaryModal__infoItem orderSummaryModal__infoItem--full">
                  <span className="orderSummaryModal__infoLabel">Alamat</span>
                  <span className="orderSummaryModal__infoValue">{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {(greetingCard || orderNotes) && (
            <div className="orderSummaryModal__section">
              <h3 className="orderSummaryModal__sectionTitle">Informasi Tambahan</h3>
              {greetingCard && (
                <div className="orderSummaryModal__infoItem">
                  <span className="orderSummaryModal__infoLabel">Kartu Ucapan</span>
                  <span className="orderSummaryModal__infoValue">{greetingCard}</span>
                </div>
              )}
              {orderNotes && (
                <div className="orderSummaryModal__infoItem">
                  <span className="orderSummaryModal__infoLabel">Catatan</span>
                  <span className="orderSummaryModal__infoValue">{orderNotes}</span>
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="orderSummaryModal__section orderSummaryModal__section--pricing">
            <div className="orderSummaryModal__priceRow">
              <span className="orderSummaryModal__priceLabel">Subtotal</span>
              <span className="orderSummaryModal__priceValue">{formatIDR(subtotal)}</span>
            </div>
            {deliveryType === "delivery" && deliveryPrice > 0 && (
              <div className="orderSummaryModal__priceRow">
                <span className="orderSummaryModal__priceLabel">Ongkir</span>
                <span className="orderSummaryModal__priceValue">{formatIDR(deliveryPrice)}</span>
              </div>
            )}
            <div className="orderSummaryModal__priceRow orderSummaryModal__priceRow--total">
              <span className="orderSummaryModal__priceLabel">Total</span>
              <span className="orderSummaryModal__priceValue">{formatIDR(total)}</span>
            </div>
          </div>
        </div>

        <div className="orderSummaryModal__footer">
          <LuxuryButton
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="orderSummaryModal__btn orderSummaryModal__btn--cancel"
          >
            Kembali
          </LuxuryButton>
          <LuxuryButton
            variant="primary"
            onClick={onConfirm}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="orderSummaryModal__btn orderSummaryModal__btn--confirm"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi & Lanjutkan"}
          </LuxuryButton>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryModal;


/**
 * Order Summary Modal Component (OOP)
 * Extends BaseModal following SOLID principles
 */

import React from "react";
import { BaseModal, BaseModalProps } from "../base/BaseModal";
import { formatIDR } from "../../utils/money";
import type { CartItem } from "../../utils/cart";
import { calculateBulkDiscount } from "../../utils/bulk-discount";
import LuxuryButton from "../LuxuryButton";
import "../../styles/OrderSummaryModal.css";

interface OrderSummaryModalProps extends BaseModalProps {
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

interface OrderSummaryModalState {
  isVisible: boolean;
  isExiting: boolean;
}

/**
 * Order Summary Modal Component
 * Class-based component extending BaseModal
 */
class OrderSummaryModal extends BaseModal<OrderSummaryModalProps, OrderSummaryModalState> {
  protected baseClass: string = "orderSummaryModal";


  private getTimeSlotLabel = (slotId: string): string => {
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

  private formatDate = (dateString: string): string => {
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

  protected renderBody(): React.ReactNode {
    const {
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
    } = this.props;

    // Calculate total quantity for bulk discount
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const averageUnitPrice = items.length > 0 
      ? items.reduce((sum, item) => sum + (item.bouquetPrice * item.quantity), 0) / totalQuantity
      : 0;
    const bulkDiscountResult = totalQuantity > 0 
      ? calculateBulkDiscount(averageUnitPrice, totalQuantity)
      : { discountAmount: 0 };
    const bulkDiscount = bulkDiscountResult.discountAmount;

    return (
      <div className={`${this.baseClass}__body`}>
        {/* Items */}
        <section className={`${this.baseClass}__section`}>
          <h3 className={`${this.baseClass}__sectionTitle`}>Item Pesanan</h3>
          <div className={`${this.baseClass}__items`}>
            {items.map((item) => (
              <div key={item.bouquetId} className={`${this.baseClass}__item`}>
                <div className={`${this.baseClass}__itemInfo`}>
                  <p className={`${this.baseClass}__itemName`}>{item.bouquetName}</p>
                  <p className={`${this.baseClass}__itemQuantity`}>Qty: {item.quantity}</p>
                </div>
                <p className={`${this.baseClass}__itemPrice`}>
                  {formatIDR(item.bouquetPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Info */}
        <section className={`${this.baseClass}__section`}>
          <h3 className={`${this.baseClass}__sectionTitle`}>
            {deliveryType === "delivery" ? "Informasi Pengiriman" : "Informasi Pickup"}
          </h3>
          <div className={`${this.baseClass}__info`}>
            <p>
              <strong>Tanggal:</strong> {this.formatDate(deliveryDate)}
            </p>
            {deliveryTimeSlot && (
              <p>
                <strong>Waktu:</strong> {this.getTimeSlotLabel(deliveryTimeSlot)}
              </p>
            )}
            {deliveryType === "delivery" && (
              <p>
                <strong>Alamat:</strong> {address}
              </p>
            )}
          </div>
        </section>

        {/* Greeting Card & Notes */}
        {(greetingCard || orderNotes) && (
          <section className={`${this.baseClass}__section`}>
            {greetingCard && (
              <div className={`${this.baseClass}__info`}>
                <p>
                  <strong>Kartu Ucapan:</strong> {greetingCard}
                </p>
              </div>
            )}
            {orderNotes && (
              <div className={`${this.baseClass}__info`}>
                <p>
                  <strong>Catatan:</strong> {orderNotes}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Summary */}
        <section className={`${this.baseClass}__section`}>
          <div className={`${this.baseClass}__summary`}>
            <div className={`${this.baseClass}__summaryRow`}>
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {bulkDiscount > 0 && (
              <div className={`${this.baseClass}__summaryRow ${this.baseClass}__summaryRow--discount`}>
                <span>Diskon</span>
                <span>-{formatIDR(bulkDiscount)}</span>
              </div>
            )}
            <div className={`${this.baseClass}__summaryRow`}>
              <span>Ongkir</span>
              <span>{formatIDR(deliveryPrice)}</span>
            </div>
            <div className={`${this.baseClass}__summaryRow ${this.baseClass}__summaryRow--total`}>
              <span>Total</span>
              <span>{formatIDR(total)}</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  protected renderFooter(): React.ReactNode {
    const { onConfirm, isSubmitting = false } = this.props;

    return (
      <div className={`${this.baseClass}__footer`}>
        <LuxuryButton
          variant="secondary"
          onClick={this.handleClose}
          disabled={isSubmitting}
        >
          Batal
        </LuxuryButton>
        <LuxuryButton
          variant="primary"
          onClick={onConfirm}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Konfirmasi Pesanan
        </LuxuryButton>
      </div>
    );
  }

  render(): React.ReactNode {
    if (!this.props.isOpen) return null;

    return (
      <div
        className={this.getOverlayClasses()}
        onClick={this.handleOverlayClick}
        onKeyDown={this.handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${this.baseClass}-title`}
      >
        <div
          className={this.getContentClasses()}
          onClick={(e) => e.stopPropagation()}
        >
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </div>
    );
  }
}

export default OrderSummaryModal;


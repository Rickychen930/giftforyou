/**
 * Cart Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/CartPage.css";
import { formatIDR } from "../utils/money";
import { buildImageUrl } from "../utils/image-utils";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import type { CartItem } from "../utils/cart";
import LuxuryButton from "../components/LuxuryButton";
import EmptyState from "../components/EmptyState";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface CartPageViewProps {
  items: CartItem[];
  isLoading: boolean;
  grandTotal: number;
  calculateItemTotal: (item: CartItem) => number;
  onRemove: (bouquetId: string) => void;
  onSaveForLater: (item: CartItem) => void;
  onQuantityChange: (bouquetId: string, newQuantity: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

/**
 * Cart Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const CartPageView: React.FC<CartPageViewProps> = ({
  items,
  isLoading,
  grandTotal,
  calculateItemTotal,
  onRemove,
  onSaveForLater,
  onQuantityChange,
  onClearCart,
  onCheckout,
}) => {
  if (isLoading) {
    return (
      <section className="cartPage">
        <div className="cartPage__container">
          <div className="cartPage__loading">Memuat keranjang...</div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="cartPage">
        <div className="cartPage__container">
          <h1 className="cartPage__title">Keranjang Belanja</h1>
          <EmptyState
            title="Keranjang Kosong"
            description="Mulai tambahkan bouquet favorit Anda ke keranjang"
            actionLabel="Jelajahi Koleksi"
            actionPath="/collection"
            icon={
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9zM9 4h6l1 2H8l1-2zm1 4v8h2V8h-2zm4 0v8h2V8h-2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.3"
                />
              </svg>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="cartPage">
      <div className="cartPage__container">
        <div className="cartPage__header">
          <h1 className="cartPage__title">Keranjang Belanja</h1>
          <button
            type="button"
            onClick={onClearCart}
            className="cartPage__clearBtn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kosongkan
          </button>
        </div>

        <div className="cartPage__content">
          <div className="cartPage__items">
            {items.map((item) => {
              const itemTotal = calculateItemTotal(item);
              const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
              const hasDiscount = discount.discountAmount > 0;

              return (
                <div key={item.bouquetId} className="cartItem">
                  <Link to={`/bouquet/${item.bouquetId}`} className="cartItem__image">
                    <img
                      src={item.image ? buildImageUrl(item.image) : FALLBACK_IMAGE}
                      alt={item.bouquetName}
                      loading="lazy"
                    />
                  </Link>

                  <div className="cartItem__details">
                    <Link to={`/bouquet/${item.bouquetId}`} className="cartItem__name">
                      {item.bouquetName}
                    </Link>
                    <div className="cartItem__price">
                      {formatIDR(item.bouquetPrice)} {hasDiscount && <span className="cartItem__discount">per item</span>}
                    </div>
                    {hasDiscount && (
                      <div className="cartItem__bulkDiscount">
                        Diskon {discount.discountPercentage}% untuk {item.quantity} item
                      </div>
                    )}
                  </div>

                  <div className="cartItem__quantity">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.bouquetId, item.quantity - 1)}
                      className="cartItem__qtyBtn"
                      aria-label="Kurangi jumlah"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="cartItem__qtyValue">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.bouquetId, item.quantity + 1)}
                      className="cartItem__qtyBtn"
                      aria-label="Tambah jumlah"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="cartItem__total">
                    <div className="cartItem__totalLabel">Subtotal</div>
                    <div className="cartItem__totalValue">{formatIDR(itemTotal)}</div>
                    {hasDiscount && (
                      <div className="cartItem__originalPrice">
                        {formatIDR(item.bouquetPrice * item.quantity)}
                      </div>
                    )}
                  </div>

                  <div className="cartItem__actions">
                    <button
                      type="button"
                      onClick={() => onSaveForLater(item)}
                      className="cartItem__saveForLater"
                      aria-label="Simpan untuk nanti"
                      title="Simpan untuk nanti"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.bouquetId)}
                      className="cartItem__remove"
                      aria-label="Hapus item"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cartPage__summary">
            <div className="cartSummary">
              <h2 className="cartSummary__title">Ringkasan Pesanan</h2>
              <div className="cartSummary__row">
                <span className="cartSummary__label">Total Item</span>
                <span className="cartSummary__value">{items.reduce((sum, item) => sum + item.quantity, 0)} item</span>
              </div>
              <div className="cartSummary__row cartSummary__row--total">
                <span className="cartSummary__label">Total Harga</span>
                <span className="cartSummary__value">{formatIDR(grandTotal)}</span>
              </div>
              <div className="cartSummary__note">
                * Belum termasuk ongkos kirim. Ongkir akan dihitung saat checkout.
              </div>
              <LuxuryButton
                variant="primary"
                onClick={onCheckout}
                disabled={items.length === 0}
                className="cartSummary__checkoutBtn cartSummary__checkoutBtn--fullWidth"
              >
                Lanjutkan ke Checkout
              </LuxuryButton>
              <Link to="/collection" className="cartSummary__continueLink">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 12H5M12 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Lanjutkan Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPageView;

/**
 * Cart Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/CartPage.css";
import { formatIDR } from "../utils/money";
import type { CartItem } from "../utils/cart";
import LuxuryButton from "../components/LuxuryButton";
import EmptyState from "../components/EmptyState";
import CartItemCard from "../components/common/CartItemCard";
import SummaryCard from "../components/common/SummaryCard";

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
          <LuxuryButton
            variant="outline"
            size="sm"
            onClick={onClearCart}
            className="cartPage__clearBtn"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            iconPosition="left"
          >
            Kosongkan
          </LuxuryButton>
        </div>

        <div className="cartPage__content">
          <div className="cartPage__items">
            {items.map((item) => {
              const itemTotal = calculateItemTotal(item);
              return (
                <CartItemCard
                  key={item.bouquetId}
                  bouquetId={item.bouquetId}
                  bouquetName={item.bouquetName}
                  bouquetPrice={item.bouquetPrice}
                  quantity={item.quantity}
                  image={item.image}
                  itemTotal={itemTotal}
                  fallbackImage={FALLBACK_IMAGE}
                  onQuantityChange={(newQuantity) => onQuantityChange(item.bouquetId, newQuantity)}
                  onSaveForLater={() => onSaveForLater(item)}
                  onRemove={() => onRemove(item.bouquetId)}
                />
              );
            })}
          </div>

          <div className="cartPage__summary">
            <div className="cartSummary">
              <SummaryCard
                title="Ringkasan Pesanan"
                items={[
                  {
                    label: "Total Item",
                    value: `${items.reduce((sum, item) => sum + item.quantity, 0)} item`,
                  },
                  {
                    label: "Total Harga",
                    value: formatIDR(grandTotal),
                    isTotal: true,
                  },
                ]}
              />
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

/**
 * Cart Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/CartPage.css";
import { formatIDR } from "../utils/money";
import type { CartItem } from "../utils/cart";
import LuxuryButton from "../components/buttons/LuxuryButton";
import EmptyState from "../components/common/EmptyState";
import CartItemCard from "../components/common/CartItemCard";
import SummaryCard from "../components/common/SummaryCard";
import { ShoppingCartIcon, DeleteIcon, ArrowLeftIcon } from "../components/icons";

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
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CartPageView extends Component<CartPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="cartPage">
        <div className="cartPage__container">
          <div className="cartPage__loading">Memuat keranjang...</div>
        </div>
      </section>
    );
  }

  /**
   * Render empty state
   */
  private renderEmpty(): React.ReactNode {
    return (
      <section className="cartPage">
        <div className="cartPage__container">
          <h1 className="cartPage__title">Keranjang Belanja</h1>
          <EmptyState
            title="Keranjang Kosong"
            description="Mulai tambahkan bouquet favorit Anda ke keranjang"
            actionLabel="Jelajahi Koleksi"
            actionPath="/collection"
            icon={<ShoppingCartIcon width={64} height={64} style={{ opacity: 0.3 }} />}
          />
        </div>
      </section>
    );
  }

  /**
   * Render cart content with items
   */
  private renderContent(): React.ReactNode {
    const {
      items,
      grandTotal,
      calculateItemTotal,
      onRemove,
      onSaveForLater,
      onQuantityChange,
      onClearCart,
      onCheckout,
    } = this.props;

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
              icon={<DeleteIcon width={16} height={16} />}
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
                      value: `${totalItems} item`,
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
                  <ArrowLeftIcon width={16} height={16} />
                  Lanjutkan Belanja
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { isLoading, items } = this.props;

    if (isLoading) {
      return this.renderLoading();
    }

    if (items.length === 0) {
      return this.renderEmpty();
    }

    return this.renderContent();
  }
}

export default CartPageView;

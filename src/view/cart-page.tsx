import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CartPage.css";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";
import {
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  type CartItem,
} from "../utils/cart";
import { buildImageUrl } from "../utils/image-utils";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { saveForLater } from "../utils/save-for-later";
import LuxuryButton from "../components/LuxuryButton";
import EmptyState from "../components/EmptyState";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isProcessing: boolean;
}

class CartPage extends Component<{}, CartState> {
  state: CartState = {
    items: [],
    isLoading: true,
    isProcessing: false,
  };

  componentDidMount(): void {
    this.loadCart();
    setSeo({
      title: "Keranjang Belanja",
      description: "Review dan lanjutkan pembelian bouquet favorit Anda",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Listen for cart updates
    window.addEventListener("cartUpdated", this.loadCart);
  }

  componentWillUnmount(): void {
    window.removeEventListener("cartUpdated", this.loadCart);
  }

  private loadCart = (): void => {
    const items = getCartItems();
    this.setState({ items, isLoading: false });
  };

  private handleRemove = (bouquetId: string): void => {
    removeFromCart(bouquetId);
    this.loadCart();
    toast.success("Item dihapus dari keranjang");
  };

  private handleSaveForLater = (item: CartItem): void => {
    saveForLater(
      item.bouquetId,
      item.bouquetName,
      item.bouquetPrice,
      item.quantity,
      item.image
    );
    removeFromCart(item.bouquetId);
    this.loadCart();
    toast.success("Item disimpan untuk nanti");
  };

  private handleQuantityChange = (bouquetId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      this.handleRemove(bouquetId);
      return;
    }
    updateCartItemQuantity(bouquetId, newQuantity);
    this.loadCart();
  };

  private handleClearCart = (): void => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      clearCart();
      this.loadCart();
      toast.info("Keranjang dikosongkan");
    }
  };

  private handleCheckout = (): void => {
    const { items } = this.state;
    if (items.length === 0) return;

    // Redirect to multi-item checkout page
    window.location.href = "/checkout";
  };

  private calculateItemTotal = (item: CartItem): number => {
    const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
    return discount.finalPrice;
  };

  private calculateGrandTotal = (): number => {
    const { items } = this.state;
    return items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
  };

  render(): React.ReactNode {
    const { items, isLoading, isProcessing } = this.state;
    const isAuthenticated = !!getAccessToken();

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

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

    const grandTotal = this.calculateGrandTotal();

    return (
      <section className="cartPage">
        <div className="cartPage__container">
          <div className="cartPage__header">
            <h1 className="cartPage__title">Keranjang Belanja</h1>
            <button
              type="button"
              onClick={this.handleClearCart}
              className="cartPage__clearBtn"
              disabled={isProcessing}
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
                const itemTotal = this.calculateItemTotal(item);
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
                        onClick={() => this.handleQuantityChange(item.bouquetId, item.quantity - 1)}
                        className="cartItem__qtyBtn"
                        disabled={isProcessing}
                        aria-label="Kurangi jumlah"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <span className="cartItem__qtyValue">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => this.handleQuantityChange(item.bouquetId, item.quantity + 1)}
                        className="cartItem__qtyBtn"
                        disabled={isProcessing}
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
                        onClick={() => this.handleSaveForLater(item)}
                        className="cartItem__saveForLater"
                        disabled={isProcessing}
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
                        onClick={() => this.handleRemove(item.bouquetId)}
                        className="cartItem__remove"
                        disabled={isProcessing}
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
                  onClick={this.handleCheckout}
                  disabled={isProcessing || items.length === 0}
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
  }
}

export default CartPage;


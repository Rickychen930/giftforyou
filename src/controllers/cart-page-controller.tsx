/**
 * Cart Page Controller
 * OOP-based controller for managing cart page state and operations
 */

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  type CartItem,
} from "../utils/cart";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { saveForLater } from "../utils/save-for-later";
import { setSeo } from "../utils/seo";
import {
  type CartPageState,
  INITIAL_CART_PAGE_STATE,
  DEFAULT_CART_PAGE_SEO,
} from "../models/cart-page-model";
import CartPageView from "../view/cart-page";

interface CartPageControllerProps {
  // Add any props if needed in the future
}

/**
 * Cart Page Controller Class
 * Manages all business logic, cart operations, and state for the cart page
 */
export class CartPageController extends Component<
  CartPageControllerProps,
  CartPageState
> {
  private cartUpdateListener: (() => void) | null = null;

  constructor(props: CartPageControllerProps) {
    super(props);
    this.state = { ...INITIAL_CART_PAGE_STATE };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_CART_PAGE_SEO);
  }

  /**
   * Load cart items
   */
  private loadCart = (): void => {
    const items = getCartItems();
    this.setState({ items, isLoading: false });
  };

  /**
   * Handle remove item from cart
   */
  handleRemove = (bouquetId: string): void => {
    removeFromCart(bouquetId);
    this.loadCart();
    toast.success("Item dihapus dari keranjang");
  };

  /**
   * Handle save item for later
   */
  handleSaveForLater = (item: CartItem): void => {
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

  /**
   * Handle quantity change
   */
  handleQuantityChange = (bouquetId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      this.handleRemove(bouquetId);
      return;
    }
    updateCartItemQuantity(bouquetId, newQuantity);
    this.loadCart();
  };

  /**
   * Handle clear cart
   */
  handleClearCart = (): void => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan keranjang?")) {
      clearCart();
      this.loadCart();
      toast.info("Keranjang dikosongkan");
    }
  };

  /**
   * Handle checkout
   */
  handleCheckout = (): void => {
    const { items } = this.state;
    if (items.length === 0) return;

    // Redirect to multi-item checkout page
    window.location.href = "/checkout";
  };

  /**
   * Calculate item total with discount
   */
  calculateItemTotal = (item: CartItem): number => {
    const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
    return discount.finalPrice;
  };

  /**
   * Calculate grand total
   */
  calculateGrandTotal = (): number => {
    const { items } = this.state;
    return items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
  };

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.initializeSeo();
    this.loadCart();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Listen for cart updates
    this.cartUpdateListener = this.loadCart;
    window.addEventListener("cartUpdated", this.cartUpdateListener);
  }

  /**
   * Component lifecycle: Unmount
   */
  componentWillUnmount(): void {
    if (this.cartUpdateListener) {
      window.removeEventListener("cartUpdated", this.cartUpdateListener);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const { items, isLoading } = this.state;
    const isAuthenticated = !!getAccessToken();

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    return (
      <CartPageView
        items={items}
        isLoading={isLoading}
        grandTotal={this.calculateGrandTotal()}
        calculateItemTotal={this.calculateItemTotal}
        onRemove={this.handleRemove}
        onSaveForLater={this.handleSaveForLater}
        onQuantityChange={this.handleQuantityChange}
        onClearCart={this.handleClearCart}
        onCheckout={this.handleCheckout}
      />
    );
  }
}

export default CartPageController;


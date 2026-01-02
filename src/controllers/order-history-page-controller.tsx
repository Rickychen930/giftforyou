/**
 * Order History Page Controller
 * OOP-based controller for managing order history page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { formatIDR } from "../utils/money";
import { STORE_PROFILE } from "../config/store-profile";
import { addToCart } from "../utils/cart";
import { toast } from "../utils/toast";
import {
  type OrderHistoryItem,
  type OrderHistoryPageState,
  INITIAL_ORDER_HISTORY_PAGE_STATE,
  DEFAULT_ORDER_HISTORY_PAGE_SEO,
} from "../models/order-history-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import OrderHistoryPageView from "../view/order-history-page";

interface OrderHistoryPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Order History Page Controller Class
 * Manages all business logic, order history operations, and state
 * Extends BaseController to avoid code duplication
 */
export class OrderHistoryPageController extends BaseController<
  OrderHistoryPageControllerProps,
  OrderHistoryPageState & BaseControllerState
> {
  constructor(props: OrderHistoryPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_ORDER_HISTORY_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_ORDER_HISTORY_PAGE_STATE,
    };
  }

  /**
   * Load order history from localStorage
   */
  private loadOrderHistory = (): void => {
    try {
      const saved = localStorage.getItem("previous_orders");
      if (saved) {
        const orders = JSON.parse(saved);
        if (Array.isArray(orders)) {
          // Sort by timestamp (newest first)
          const sorted = orders.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          this.setState({ orders: sorted, isLoading: false });
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load order history:", error);
    }
    this.setState({ isLoading: false });
  };

  /**
   * Format date from date string
   */
  formatDate = (dateString: string): string => {
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

  /**
   * Handle reorder
   */
  handleReorder = (order: OrderHistoryItem): void => {
    // Save order data to form storage for quick reorder
    const formData = {
      deliveryType: order.deliveryType,
      deliveryDate: order.deliveryDate,
      address: order.address || "",
      greetingCard: order.greetingCard || "",
      quantity: order.quantity,
    };
    localStorage.setItem("bouquet_order_form_data", JSON.stringify(formData));

    // Navigate to bouquet if ID is available
    if (order.bouquetId) {
      toast.info("Data pesanan dimuat, silakan lanjutkan checkout");
      setTimeout(() => {
        window.location.href = `/bouquet/${order.bouquetId}?reorder=true`;
      }, 500);
    } else {
      window.location.href = "/collection";
    }
  };

  /**
   * Handle quick add to cart
   */
  handleQuickAddToCart = (order: OrderHistoryItem): void => {
    if (!order.bouquetId || !order.bouquetName || order.bouquetPrice === undefined) {
      toast.error("Data pesanan tidak lengkap");
      return;
    }

    addToCart({
      bouquetId: order.bouquetId,
      bouquetName: order.bouquetName,
      bouquetPrice: order.bouquetPrice,
      image: "/images/placeholder-bouquet.jpg",
      quantity: order.quantity,
    });
    toast.success("Ditambahkan ke keranjang");
  };

  /**
   * Build reorder WhatsApp message
   */
  buildReorderMessage = (order: OrderHistoryItem): string => {
    const lines = [
      `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan lagi:`,
      ``,
      order.bouquetName ? `Nama: ${order.bouquetName}` : "",
      order.bouquetPrice ? `Harga: ${formatIDR(order.bouquetPrice)}` : "",
      `Jumlah: ${order.quantity}`,
      ``,
      `📦 Pengiriman: ${order.deliveryType === "pickup" ? "Ambil di toko" : "Diantar"}`,
      `📅 Tanggal: ${this.formatDate(order.deliveryDate)}`,
      order.deliveryType === "delivery" && order.address
        ? `📍 Alamat: ${order.address}`
        : "",
      order.greetingCard ? `💌 Kartu ucapan: ${order.greetingCard}` : "",
      ``,
      `(Pesanan ulang dari riwayat)`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.loadOrderHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const { orders, isLoading } = this.state;

    return (
      <OrderHistoryPageView
        orders={orders}
        isLoading={isLoading}
        formatDate={this.formatDate}
        buildReorderMessage={this.buildReorderMessage}
        onReorder={this.handleReorder}
        onQuickAddToCart={this.handleQuickAddToCart}
      />
    );
  }
}

export default OrderHistoryPageController;


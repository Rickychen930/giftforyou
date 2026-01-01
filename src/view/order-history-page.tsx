/**
 * Order History Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import "../styles/OrderHistoryPage.css";
import type { OrderHistoryItem } from "../models/order-history-page-model";
import EmptyState from "../components/common/EmptyState";
import OrderHistoryCard from "../components/common/OrderHistoryCard";
import BackLink from "../components/common/BackLink";

interface OrderHistoryPageViewProps {
  orders: OrderHistoryItem[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  buildReorderMessage: (order: OrderHistoryItem) => string;
  onReorder: (order: OrderHistoryItem) => void;
  onQuickAddToCart: (order: OrderHistoryItem) => void;
}

/**
 * Order History Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class OrderHistoryPageView extends Component<OrderHistoryPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="ohPage ohPage--loading">
        <div className="ohContainer">
          <div className="ohLoading">
            <div className="ohSpinner"></div>
            <p>Memuat riwayat pesanan...</p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Render empty state
   */
  private renderEmpty(): React.ReactNode {
    return (
      <section className="ohPage">
        <div className="ohContainer">
          <EmptyState
            title="Belum Ada Riwayat Pesanan"
            description="Pesanan Anda akan muncul di sini setelah Anda melakukan pemesanan."
            actionLabel="Jelajahi Katalog"
            actionPath="/collection"
            icon={
              <div style={{ fontSize: "4rem" }}>📋</div>
            }
            className="ohEmpty"
          />
        </div>
      </section>
    );
  }

  /**
   * Render content with orders
   */
  private renderContent(): React.ReactNode {
    const { orders, formatDate, buildReorderMessage, onReorder, onQuickAddToCart } = this.props;

    return (
      <section className="ohPage" aria-labelledby="oh-title">
        <div className="ohContainer">
          <div className="ohHeader">
            <h1 id="oh-title" className="ohHeader__title">Riwayat Pesanan</h1>
            <p className="ohHeader__subtitle">
              Lihat dan pesan ulang pesanan sebelumnya
            </p>
          </div>

          <div className="ohList">
            {orders.map((order, index) => {
              const totalPrice = (order.bouquetPrice || 0) * order.quantity;
              return (
                <OrderHistoryCard
                  key={index}
                  bouquetName={order.bouquetName || "Bouquet"}
                  bouquetPrice={order.bouquetPrice || 0}
                  quantity={order.quantity}
                  deliveryDate={order.deliveryDate}
                  deliveryType={order.deliveryType}
                  address={order.address}
                  greetingCard={order.greetingCard}
                  totalPrice={totalPrice}
                  formatDate={formatDate}
                  buildReorderMessage={() => buildReorderMessage(order)}
                  onReorder={() => onReorder(order)}
                  onQuickAddToCart={
                    order.bouquetId && order.bouquetName && order.bouquetPrice
                      ? () => onQuickAddToCart(order)
                      : undefined
                  }
                  hasBouquetId={!!(order.bouquetId && order.bouquetName && order.bouquetPrice)}
                />
              );
            })}
          </div>

          <div className="ohFooter">
            <BackLink to="/collection" className="ohFooter__link">
              ← Kembali ke Katalog
            </BackLink>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { isLoading, orders } = this.props;

    if (isLoading) {
      return this.renderLoading();
    }

    if (orders.length === 0) {
      return this.renderEmpty();
    }

    return this.renderContent();
  }
}

export default OrderHistoryPageView;

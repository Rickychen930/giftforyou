import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/OrderHistoryPage.css";
import { formatIDR } from "../utils/money";
import { STORE_PROFILE } from "../config/store-profile";
import { buildWhatsAppLink } from "../utils/whatsapp";

interface OrderHistoryItem {
  bouquetId?: string;
  bouquetName?: string;
  bouquetPrice?: number;
  quantity: number;
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  address?: string;
  greetingCard?: string;
  timestamp: number;
}

interface OrderHistoryState {
  orders: OrderHistoryItem[];
  isLoading: boolean;
}

class OrderHistoryPage extends Component<{}, OrderHistoryState> {
  state: OrderHistoryState = {
    orders: [],
    isLoading: true,
  };

  componentDidMount(): void {
    this.loadOrderHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

  private reorder = (order: OrderHistoryItem): void => {
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
      window.location.href = `/bouquet/${order.bouquetId}`;
    } else {
      window.location.href = "/collection";
    }
  };

  private buildReorderMessage = (order: OrderHistoryItem): string => {
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

  render(): React.ReactNode {
    const { orders, isLoading } = this.state;

    if (isLoading) {
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

    if (orders.length === 0) {
      return (
        <section className="ohPage">
          <div className="ohContainer">
            <div className="ohEmpty">
              <div className="ohEmpty__icon">📋</div>
              <h1 className="ohEmpty__title">Belum Ada Riwayat Pesanan</h1>
              <p className="ohEmpty__text">
                Pesanan Anda akan muncul di sini setelah Anda melakukan pemesanan.
              </p>
              <Link to="/collection" className="ohEmpty__link btn-luxury">
                Jelajahi Katalog
              </Link>
            </div>
          </div>
        </section>
      );
    }

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
              const waMessage = buildWhatsAppLink(this.buildReorderMessage(order));

              return (
                <div key={index} className="ohCard reveal-on-scroll">
                  <div className="ohCard__header">
                    <div className="ohCard__info">
                      <h3 className="ohCard__title">
                        {order.bouquetName || "Bouquet"}
                      </h3>
                      <p className="ohCard__date">
                        {this.formatDate(order.deliveryDate)}
                      </p>
                    </div>
                    <div className="ohCard__price">
                      {formatIDR(totalPrice)}
                    </div>
                  </div>

                  <div className="ohCard__details">
                    <div className="ohCard__detail">
                      <span className="ohCard__label">Jumlah:</span>
                      <span className="ohCard__value">{order.quantity} pcs</span>
                    </div>
                    <div className="ohCard__detail">
                      <span className="ohCard__label">Tipe:</span>
                      <span className="ohCard__value">
                        {order.deliveryType === "pickup" ? "Ambil di Toko" : "Diantar"}
                      </span>
                    </div>
                    {order.deliveryType === "delivery" && order.address && (
                      <div className="ohCard__detail">
                        <span className="ohCard__label">Alamat:</span>
                        <span className="ohCard__value">{order.address}</span>
                      </div>
                    )}
                    {order.greetingCard && (
                      <div className="ohCard__detail">
                        <span className="ohCard__label">Kartu Ucapan:</span>
                        <span className="ohCard__value">{order.greetingCard}</span>
                      </div>
                    )}
                  </div>

                  <div className="ohCard__actions">
                    <button
                      type="button"
                      onClick={() => this.reorder(order)}
                      className="ohCard__btn ohCard__btn--primary btn-luxury"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 3v5h5M21 21v-5h-5M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Pesan Ulang</span>
                    </button>
                    <a
                      href={waMessage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ohCard__btn ohCard__btn--secondary"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                      </svg>
                      <span>Via WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ohFooter">
            <Link to="/collection" className="ohFooter__link">
              ← Kembali ke Katalog
            </Link>
          </div>
        </div>
      </section>
    );
  }
}

export default OrderHistoryPage;


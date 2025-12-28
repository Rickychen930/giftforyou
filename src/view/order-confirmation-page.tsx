import React, { Component } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/OrderConfirmationPage.css";
import { STORE_PROFILE } from "../config/store-profile";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { formatIDR } from "../utils/money";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderConfirmationProps {
  bouquetName?: string;
  quantity?: number;
  items?: string; // JSON string of items array for multi-item orders
  deliveryType?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  address?: string;
  greetingCard?: string;
  orderNotes?: string;
  totalPrice?: number;
}

class OrderConfirmationPage extends Component<OrderConfirmationProps> {
  componentDidMount(): void {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  render(): React.ReactNode {
    const {
      bouquetName = "Bouquet Pilihan",
      quantity = 1,
      items: itemsJson,
      deliveryType = "delivery",
      deliveryDate = "",
      deliveryTimeSlot = "",
      address = "",
      greetingCard = "",
      orderNotes = "",
      totalPrice = 0,
    } = this.props;

    // Parse items if available (for multi-item orders from checkout)
    let orderItems: OrderItem[] = [];
    if (itemsJson) {
      try {
        orderItems = JSON.parse(decodeURIComponent(itemsJson));
      } catch {
        // If parsing fails, use single item format
        orderItems = [];
      }
    }

    const isMultiItem = orderItems.length > 0;

    // Helper to get time slot label
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

    const buildWhatsAppMessage = (): string => {
      if (isMultiItem) {
        const lines = [
          `Halo ${STORE_PROFILE.brand.displayName}, saya sudah mengisi form pemesanan:\n\n`,
          ...orderItems.map((item, index) => 
            `${index + 1}. ${item.name}\n   Harga: ${formatIDR(item.price)} x ${item.quantity} = ${formatIDR(item.price * item.quantity)}`
          ),
          ``,
          `🚚 Pengiriman: ${deliveryType === "delivery" ? "Diantar" : "Ambil di Toko"}\n` +
          (deliveryDate ? `📅 Tanggal: ${deliveryDate}\n` : "") +
          (deliveryTimeSlot ? `⏰ Waktu: ${getTimeSlotLabel(deliveryTimeSlot)}\n` : "") +
          (address ? `📍 Alamat: ${address}\n` : "") +
          (greetingCard ? `💌 Kartu Ucapan: ${greetingCard}\n` : "") +
          (orderNotes ? `📝 Catatan Pesanan: ${orderNotes}\n` : "") +
          (totalPrice > 0 ? `💰 Total: ${formatIDR(totalPrice)}` : ""),
        ];
        return lines.join("\n");
      } else {
        return (
          `Halo ${STORE_PROFILE.brand.displayName}, saya sudah mengisi form pemesanan:\n\n` +
          `✨ ${bouquetName}\n` +
          `📦 Jumlah: ${quantity}\n` +
          `🚚 Pengiriman: ${deliveryType === "delivery" ? "Diantar" : "Ambil di Toko"}\n` +
          (deliveryDate ? `📅 Tanggal: ${deliveryDate}\n` : "") +
          (deliveryTimeSlot ? `⏰ Waktu: ${getTimeSlotLabel(deliveryTimeSlot)}\n` : "") +
          (address ? `📍 Alamat: ${address}\n` : "") +
          (greetingCard ? `💌 Kartu Ucapan: ${greetingCard}\n` : "") +
          (orderNotes ? `📝 Catatan Pesanan: ${orderNotes}\n` : "") +
          (totalPrice > 0 ? `💰 Total: ${formatIDR(totalPrice)}` : "")
        );
      }
    };

    const whatsAppMessage = buildWhatsAppLink(buildWhatsAppMessage());

    return (
      <div className="orderConfirmationPage">
        <div className="orderConfirmationPage__container">
          {/* Success Animation */}
          <div className="orderConfirmationPage__success">
            <div className="orderConfirmationPage__successIcon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="successCircle"/>
                <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="successCheck"/>
              </svg>
            </div>
            <h1 className="orderConfirmationPage__title">
              Form Pemesanan Berhasil!
            </h1>
            <p className="orderConfirmationPage__subtitle">
              Terima kasih! Data pemesanan Anda telah tersimpan. Silakan lanjutkan ke WhatsApp untuk konfirmasi.
            </p>
          </div>

          {/* Order Summary */}
          <div className="orderConfirmationPage__summary">
            <h2 className="orderConfirmationPage__summaryTitle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ringkasan Pemesanan
            </h2>
            
            <div className="orderConfirmationPage__summaryContent">
              {isMultiItem ? (
                <>
                  <div className="orderConfirmationPage__summaryItem">
                    <span className="orderConfirmationPage__summaryLabel">Items</span>
                    <span className="orderConfirmationPage__summaryValue">
                      {orderItems.length} {orderItems.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  {orderItems.map((item, index) => (
                    <div key={index} className="orderConfirmationPage__summaryItem orderConfirmationPage__summaryItem--nested">
                      <span className="orderConfirmationPage__summaryLabel">
                        {index + 1}. {item.name}
                      </span>
                      <span className="orderConfirmationPage__summaryValue">
                        {item.quantity} x {formatIDR(item.price)} = {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="orderConfirmationPage__summaryItem">
                    <span className="orderConfirmationPage__summaryLabel">Bouquet</span>
                    <span className="orderConfirmationPage__summaryValue">{bouquetName}</span>
                  </div>
                  
                  <div className="orderConfirmationPage__summaryItem">
                    <span className="orderConfirmationPage__summaryLabel">Jumlah</span>
                    <span className="orderConfirmationPage__summaryValue">{quantity} pcs</span>
                  </div>
                </>
              )}
              
              <div className="orderConfirmationPage__summaryItem">
                <span className="orderConfirmationPage__summaryLabel">Tipe Pengiriman</span>
                <span className="orderConfirmationPage__summaryValue">
                  {deliveryType === "delivery" ? "🚚 Diantar" : "🏪 Ambil di Toko"}
                </span>
              </div>
              
              {deliveryDate && (
                <div className="orderConfirmationPage__summaryItem">
                  <span className="orderConfirmationPage__summaryLabel">Tanggal</span>
                  <span className="orderConfirmationPage__summaryValue">{deliveryDate}</span>
                </div>
              )}
              
              {deliveryTimeSlot && (
                <div className="orderConfirmationPage__summaryItem">
                  <span className="orderConfirmationPage__summaryLabel">Waktu</span>
                  <span className="orderConfirmationPage__summaryValue">{getTimeSlotLabel(deliveryTimeSlot)}</span>
                </div>
              )}
              
              {address && (
                <div className="orderConfirmationPage__summaryItem">
                  <span className="orderConfirmationPage__summaryLabel">Alamat</span>
                  <span className="orderConfirmationPage__summaryValue">{address}</span>
                </div>
              )}
              
              {greetingCard && (
                <div className="orderConfirmationPage__summaryItem">
                  <span className="orderConfirmationPage__summaryLabel">Kartu Ucapan</span>
                  <span className="orderConfirmationPage__summaryValue">{greetingCard}</span>
                </div>
              )}
              
              {orderNotes && (
                <div className="orderConfirmationPage__summaryItem">
                  <span className="orderConfirmationPage__summaryLabel">Catatan Pesanan</span>
                  <span className="orderConfirmationPage__summaryValue">{orderNotes}</span>
                </div>
              )}
              
              {totalPrice > 0 && (
                <div className="orderConfirmationPage__summaryItem orderConfirmationPage__summaryItem--total">
                  <span className="orderConfirmationPage__summaryLabel">Total</span>
                  <span className="orderConfirmationPage__summaryValue">{formatIDR(totalPrice)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="orderConfirmationPage__actions">
            <a
              href={whatsAppMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="orderConfirmationPage__button orderConfirmationPage__button--primary"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
              </svg>
              Lanjutkan ke WhatsApp
            </a>
            
            <Link
              to="/collection"
              className="orderConfirmationPage__button orderConfirmationPage__button--secondary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Lihat Koleksi Lain
            </Link>
          </div>

          {/* Help Section */}
          <div className="orderConfirmationPage__help">
            <h3 className="orderConfirmationPage__helpTitle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Butuh Bantuan?
            </h3>
            <p className="orderConfirmationPage__helpText">
              Jika ada pertanyaan atau ingin mengubah pesanan, silakan hubungi kami melalui WhatsApp. 
              Tim kami siap membantu Anda dengan senang hati.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

// Wrapper component untuk menggunakan useSearchParams
const OrderConfirmationPageWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  return (
    <OrderConfirmationPage
      bouquetName={searchParams.get("bouquetName") || undefined}
      quantity={parseInt(searchParams.get("quantity") || "1")}
      items={searchParams.get("items") || undefined}
      deliveryType={searchParams.get("deliveryType") || undefined}
      deliveryDate={searchParams.get("deliveryDate") || undefined}
      deliveryTimeSlot={searchParams.get("deliveryTimeSlot") || undefined}
      address={searchParams.get("address") || undefined}
      greetingCard={searchParams.get("greetingCard") || undefined}
      orderNotes={searchParams.get("orderNotes") || undefined}
      totalPrice={parseFloat(searchParams.get("totalPrice") || "0")}
    />
  );
};

export default OrderConfirmationPageWrapper;


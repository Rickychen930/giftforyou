/**
 * Order Confirmation Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/OrderConfirmationPage.css";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { formatIDR } from "../utils/money";
import type { OrderConfirmationData } from "../models/order-confirmation-page-model";
import { getTimeSlotLabel, buildOrderConfirmationWhatsAppMessage } from "../models/order-confirmation-page-model";
import SuccessIcon from "../components/common/SuccessIcon";
import SummaryCard from "../components/common/SummaryCard";
import WhatsAppButton from "../components/common/WhatsAppButton";
import HelpSection from "../components/common/HelpSection";
import LuxuryButton from "../components/buttons/LuxuryButton";

interface OrderConfirmationPageViewProps {
  orderData: OrderConfirmationData;
}

/**
 * Order Confirmation Page View Component
 * Pure presentation - receives all data via props
 */
const OrderConfirmationPageView: React.FC<OrderConfirmationPageViewProps> = ({
  orderData,
}) => {
  const {
    bouquetName = "Bouquet Pilihan",
    quantity = 1,
    items,
    deliveryType = "delivery",
    deliveryDate = "",
    deliveryTimeSlot = "",
    address = "",
    greetingCard = "",
    orderNotes = "",
    totalPrice = 0,
  } = orderData;

  const isMultiItem = items && items.length > 0;
  const whatsAppMessage = buildWhatsAppLink(buildOrderConfirmationWhatsAppMessage(orderData));

  return (
    <div className="orderConfirmationPage">
      <div className="orderConfirmationPage__container">
        {/* Success Animation */}
        <div className="orderConfirmationPage__success">
          <SuccessIcon size={80} />
          <h1 className="orderConfirmationPage__title">
            Form Pemesanan Berhasil!
          </h1>
          <p className="orderConfirmationPage__subtitle">
            Terima kasih! Data pemesanan Anda telah tersimpan. Silakan lanjutkan ke WhatsApp untuk konfirmasi.
          </p>
        </div>

        {/* Order Summary */}
        <SummaryCard
          title="Ringkasan Pemesanan"
          titleIcon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          items={[
            ...(isMultiItem
              ? [
                  {
                    label: "Items",
                    value: `${items.length} ${items.length === 1 ? "item" : "items"}`,
                  },
                  ...items.map((item, index) => ({
                    label: `${index + 1}. ${item.name}`,
                    value: `${item.quantity} x ${formatIDR(item.price)} = ${formatIDR(item.price * item.quantity)}`,
                    isNested: true,
                  })),
                ]
              : [
                  { label: "Bouquet", value: bouquetName },
                  { label: "Jumlah", value: `${quantity} pcs` },
                ]),
            {
              label: "Tipe Pengiriman",
              value: deliveryType === "delivery" ? "🚚 Diantar" : "🏪 Ambil di Toko",
            },
            ...(deliveryDate ? [{ label: "Tanggal", value: deliveryDate }] : []),
            ...(deliveryTimeSlot ? [{ label: "Waktu", value: getTimeSlotLabel(deliveryTimeSlot) }] : []),
            ...(address ? [{ label: "Alamat", value: address }] : []),
            ...(greetingCard ? [{ label: "Kartu Ucapan", value: greetingCard }] : []),
            ...(orderNotes ? [{ label: "Catatan Pesanan", value: orderNotes }] : []),
            ...(totalPrice > 0
              ? [{ label: "Total", value: formatIDR(totalPrice), isTotal: true }]
              : []),
          ]}
          className="orderConfirmationPage__summary"
        />

        {/* Action Buttons */}
        <div className="orderConfirmationPage__actions">
          <WhatsAppButton
            href={whatsAppMessage}
            variant="primary"
            size="md"
            className="orderConfirmationPage__button orderConfirmationPage__button--primary"
          >
            Lanjutkan ke WhatsApp
          </WhatsAppButton>
          
          <Link
            to="/collection"
            className="orderConfirmationPage__button orderConfirmationPage__button--secondary"
          >
            <LuxuryButton
              variant="secondary"
              size="md"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              iconPosition="left"
            >
              Lihat Koleksi Lain
            </LuxuryButton>
          </Link>
        </div>

        {/* Help Section */}
        <HelpSection
          title="Butuh Bantuan?"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
          className="orderConfirmationPage__help"
        >
          Jika ada pertanyaan atau ingin mengubah pesanan, silakan hubungi kami melalui WhatsApp. 
          Tim kami siap membantu Anda dengan senang hati.
        </HelpSection>
      </div>
    </div>
  );
};

export default OrderConfirmationPageView;

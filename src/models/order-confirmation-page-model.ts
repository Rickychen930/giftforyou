/**
 * Order Confirmation Page Model
 * Defines data structures and types for the order confirmation page
 */

import { formatIDR } from "../utils/money";

/**
 * Order Item
 */
export interface OrderConfirmationItem {
  name: string;
  price: number;
  quantity: number;
}

/**
 * Order Confirmation Data
 */
export interface OrderConfirmationData {
  bouquetName?: string;
  quantity?: number;
  items?: OrderConfirmationItem[];
  deliveryType?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  address?: string;
  greetingCard?: string;
  orderNotes?: string;
  totalPrice?: number;
}

/**
 * Time Slot Label Helper
 */
export const getTimeSlotLabel = (slotId: string): string => {
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

/**
 * Build WhatsApp message from order confirmation data
 */
export const buildOrderConfirmationWhatsAppMessage = (
  orderData: OrderConfirmationData
): string => {
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

  if (isMultiItem) {
    const lines = [
      `Halo GiftForYou.idn, saya sudah mengisi form pemesanan:\n\n`,
      ...items.map((item, index) => 
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
      `Halo GiftForYou.idn, saya sudah mengisi form pemesanan:\n\n` +
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


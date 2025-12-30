"use strict";
/**
 * Order Confirmation Page Model
 * Defines data structures and types for the order confirmation page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOrderConfirmationWhatsAppMessage = exports.getTimeSlotLabel = void 0;
const money_1 = require("../utils/money");
/**
 * Time Slot Label Helper
 */
const getTimeSlotLabel = (slotId) => {
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
exports.getTimeSlotLabel = getTimeSlotLabel;
/**
 * Build WhatsApp message from order confirmation data
 */
const buildOrderConfirmationWhatsAppMessage = (orderData) => {
    const { bouquetName = "Bouquet Pilihan", quantity = 1, items, deliveryType = "delivery", deliveryDate = "", deliveryTimeSlot = "", address = "", greetingCard = "", orderNotes = "", totalPrice = 0, } = orderData;
    const isMultiItem = items && items.length > 0;
    if (isMultiItem) {
        const lines = [
            `Halo GiftForYou.idn, saya sudah mengisi form pemesanan:\n\n`,
            ...items.map((item, index) => `${index + 1}. ${item.name}\n   Harga: ${(0, money_1.formatIDR)(item.price)} x ${item.quantity} = ${(0, money_1.formatIDR)(item.price * item.quantity)}`),
            ``,
            `🚚 Pengiriman: ${deliveryType === "delivery" ? "Diantar" : "Ambil di Toko"}\n` +
                (deliveryDate ? `📅 Tanggal: ${deliveryDate}\n` : "") +
                (deliveryTimeSlot ? `⏰ Waktu: ${(0, exports.getTimeSlotLabel)(deliveryTimeSlot)}\n` : "") +
                (address ? `📍 Alamat: ${address}\n` : "") +
                (greetingCard ? `💌 Kartu Ucapan: ${greetingCard}\n` : "") +
                (orderNotes ? `📝 Catatan Pesanan: ${orderNotes}\n` : "") +
                (totalPrice > 0 ? `💰 Total: ${(0, money_1.formatIDR)(totalPrice)}` : ""),
        ];
        return lines.join("\n");
    }
    else {
        return (`Halo GiftForYou.idn, saya sudah mengisi form pemesanan:\n\n` +
            `✨ ${bouquetName}\n` +
            `📦 Jumlah: ${quantity}\n` +
            `🚚 Pengiriman: ${deliveryType === "delivery" ? "Diantar" : "Ambil di Toko"}\n` +
            (deliveryDate ? `📅 Tanggal: ${deliveryDate}\n` : "") +
            (deliveryTimeSlot ? `⏰ Waktu: ${(0, exports.getTimeSlotLabel)(deliveryTimeSlot)}\n` : "") +
            (address ? `📍 Alamat: ${address}\n` : "") +
            (greetingCard ? `💌 Kartu Ucapan: ${greetingCard}\n` : "") +
            (orderNotes ? `📝 Catatan Pesanan: ${orderNotes}\n` : "") +
            (totalPrice > 0 ? `💰 Total: ${(0, money_1.formatIDR)(totalPrice)}` : ""));
    }
};
exports.buildOrderConfirmationWhatsAppMessage = buildOrderConfirmationWhatsAppMessage;
//# sourceMappingURL=order-confirmation-page-model.js.map
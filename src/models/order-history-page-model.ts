/**
 * Order History Page Model
 * Defines data structures and types for the order history page
 */

/**
 * Order History Item
 */
export interface OrderHistoryItem {
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

/**
 * Order History Page State
 */
export interface OrderHistoryPageState {
  orders: OrderHistoryItem[];
  isLoading: boolean;
}

/**
 * Initial Order History Page State
 */
export const INITIAL_ORDER_HISTORY_PAGE_STATE: OrderHistoryPageState = {
  orders: [],
  isLoading: true,
};

/**
 * Default SEO for Order History Page
 */
export const DEFAULT_ORDER_HISTORY_PAGE_SEO = {
  title: "Riwayat Pesanan | Giftforyou.idn - Florist Cirebon",
  description: "Lihat riwayat pesanan Anda di Giftforyou.idn. Pesan ulang dengan mudah atau tambahkan ke keranjang.",
  keywords: "riwayat pesanan, order history, pesanan saya, florist cirebon, toko bunga cirebon",
  path: "/customer/orders",
};


/**
 * Cart Page Model
 * Defines data structures and types for the cart page
 */

import type { CartItem } from "../utils/cart";

/**
 * Cart Page State
 */
export interface CartPageState {
  items: CartItem[];
  isLoading: boolean;
  isProcessing: boolean;
}

/**
 * Initial Cart Page State
 */
export const INITIAL_CART_PAGE_STATE: CartPageState = {
  items: [],
  isLoading: true,
  isProcessing: false,
};

/**
 * Cart Page SEO Data
 */
export interface CartPageSeoData {
  title: string;
  description: string;
  keywords?: string;
  path: string;
}

/**
 * Default SEO data for cart page
 */
export const DEFAULT_CART_PAGE_SEO: CartPageSeoData = {
  title: "Keranjang Belanja",
  description: "Review dan lanjutkan pembelian bouquet favorit Anda",
  path: "/cart",
};


/**
 * Checkout Page Model
 * Defines data structures and types for the checkout page
 */

import type { CartItem } from "../utils/cart";
import type { DeliveryPriceResult } from "../utils/delivery-calculator";

/**
 * Checkout Form State
 */
export interface CheckoutFormState {
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  orderNotes: string;
  deliveryLocation?: { lat: number; lng: number };
  deliveryPriceResult?: DeliveryPriceResult;
}

/**
 * Saved Address
 */
export interface SavedAddress {
  _id: string;
  fullAddress: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

/**
 * Checkout Page State
 */
export interface CheckoutPageState extends CheckoutFormState {
  items: CartItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  formErrors: Partial<Record<keyof CheckoutFormState, string>>;
  isFormValid: boolean;
  savedAddresses: SavedAddress[];
  loadingAddresses: boolean;
  showPreviewModal: boolean;
}

/**
 * Get default date (tomorrow)
 */
export const getDefaultDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

/**
 * Initial Checkout Form State
 */
export const INITIAL_CHECKOUT_FORM_STATE: CheckoutFormState = {
  deliveryType: "delivery",
  deliveryDate: getDefaultDate(),
  deliveryTimeSlot: undefined,
  address: "",
  greetingCard: "",
  orderNotes: "",
  deliveryLocation: undefined,
  deliveryPriceResult: undefined,
};

/**
 * Initial Checkout Page State
 */
export const INITIAL_CHECKOUT_PAGE_STATE: CheckoutPageState = {
  ...INITIAL_CHECKOUT_FORM_STATE,
  items: [],
  isLoading: true,
  isSubmitting: false,
  formErrors: {},
  isFormValid: false,
  savedAddresses: [],
  loadingAddresses: false,
  showPreviewModal: false,
};

/**
 * Checkout Page SEO Data
 */
export interface CheckoutPageSeoData {
  title: string;
  description: string;
  keywords?: string;
  path: string;
}

/**
 * Default SEO data for checkout page
 */
export const DEFAULT_CHECKOUT_PAGE_SEO: CheckoutPageSeoData = {
  title: "Checkout | Giftforyou.idn",
  description: "Lengkapi informasi pengiriman untuk menyelesaikan pesanan Anda",
  path: "/checkout",
};


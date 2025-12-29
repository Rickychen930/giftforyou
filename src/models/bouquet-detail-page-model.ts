/**
 * Bouquet Detail Page Model
 * Defines data structures and types for the bouquet detail page
 */

// Define OrderFormData locally to avoid JSX import issues
export interface OrderFormData {
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  quantity: number;
}

/**
 * Bouquet Detail Page State
 */
export interface BouquetDetailPageState {
  formData: OrderFormData;
  formErrors: Partial<Record<keyof OrderFormData, string>>;
  isFormValid: boolean;
  isFavorite: boolean;
  showOrderModal: boolean;
  formProgress: number;
}

/**
 * Initial Order Form Data
 */
export const INITIAL_ORDER_FORM_DATA: OrderFormData = {
  deliveryType: "delivery",
  deliveryDate: "",
  deliveryTimeSlot: undefined,
  address: "",
  greetingCard: "",
  quantity: 1,
};

/**
 * Initial Bouquet Detail Page State
 */
export const INITIAL_BOUQUET_DETAIL_PAGE_STATE: BouquetDetailPageState = {
  formData: INITIAL_ORDER_FORM_DATA,
  formErrors: {},
  isFormValid: false,
  isFavorite: false,
  showOrderModal: false,
  formProgress: 0,
};

/**
 * Get default date (tomorrow)
 */
export const getDefaultDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

/**
 * Form Storage Key
 */
export const FORM_STORAGE_KEY = "bouquet_order_form_data";

/**
 * Bouquet Detail Page SEO Data
 */
export interface BouquetDetailPageSeoData {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  ogImagePath?: string;
  structuredData?: {
    "@type": string;
    name: string;
    description: string;
    image?: string;
    offers: {
      "@type": string;
      price: number;
      priceCurrency: string;
      availability: string;
      url: string;
    };
    brand: {
      "@type": string;
      name: string;
    };
    category: string;
  };
}


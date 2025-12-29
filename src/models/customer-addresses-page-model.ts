/**
 * Customer Addresses Page Model
 * Defines data structures and types for the customer addresses page
 */

/**
 * Address
 */
export interface Address {
  _id?: string;
  label: string;
  address: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Address Form Data
 */
export interface AddressFormData {
  label: string;
  address: string;
  isDefault: boolean;
}

/**
 * Address Form Errors
 */
export interface AddressFormErrors {
  label?: string;
  address?: string;
  general?: string;
}

/**
 * Addresses Page State
 */
export interface AddressesPageState {
  addresses: Address[];
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showForm: boolean;
  editingId: string | null;
  formData: AddressFormData;
  errors: AddressFormErrors;
  showSuccess: boolean;
  successMessage: string;
  showConfetti: boolean;
}

/**
 * Initial Address Form Data
 */
export const INITIAL_ADDRESS_FORM_DATA: AddressFormData = {
  label: "",
  address: "",
  isDefault: false,
};

/**
 * Initial Addresses Page State
 */
export const INITIAL_ADDRESSES_PAGE_STATE: AddressesPageState = {
  addresses: [],
  isLoading: true,
  isSaving: false,
  isAuthenticated: false,
  showForm: false,
  editingId: null,
  formData: INITIAL_ADDRESS_FORM_DATA,
  errors: {},
  showSuccess: false,
  successMessage: "",
  showConfetti: false,
};

/**
 * Addresses Page SEO Data
 */
export interface AddressesPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for addresses page
 */
export const DEFAULT_ADDRESSES_PAGE_SEO: AddressesPageSeoData = {
  title: "Buku Alamat | Giftforyou.idn",
  description: "Kelola alamat pengiriman Anda.",
  path: "/customer/addresses",
};


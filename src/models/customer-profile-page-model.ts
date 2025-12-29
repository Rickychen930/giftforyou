/**
 * Customer Profile Page Model
 * Defines data structures and types for the customer profile page
 */

/**
 * User Profile
 */
export interface ProfileUser {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

/**
 * Profile Form Data
 */
export interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
}

/**
 * Profile Form Errors
 */
export interface ProfileFormErrors {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  general?: string;
}

/**
 * Profile Page State
 */
export interface ProfilePageState {
  user: ProfileUser | null;
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
  lastSaved: Date | null;
  showConfetti: boolean;
}

/**
 * Initial Profile Form Data
 */
export const INITIAL_PROFILE_FORM_DATA: ProfileFormData = {
  fullName: "",
  phoneNumber: "",
  address: "",
};

/**
 * Initial Profile Page State
 */
export const INITIAL_PROFILE_PAGE_STATE: ProfilePageState = {
  user: null,
  formData: INITIAL_PROFILE_FORM_DATA,
  errors: {},
  isLoading: true,
  isSaving: false,
  isAuthenticated: false,
  showSuccess: false,
  lastSaved: null,
  showConfetti: false,
};

/**
 * Profile Page SEO Data
 */
export interface ProfilePageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for profile page
 */
export const DEFAULT_PROFILE_PAGE_SEO: ProfilePageSeoData = {
  title: "Profil Saya | Giftforyou.idn",
  description: "Kelola informasi profil Anda.",
  path: "/customer/profile",
};


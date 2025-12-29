/**
 * Customer Register Page Model
 * Defines data structures and types for the customer register page
 */

/**
 * Register Form Data
 */
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  agreeToTerms: boolean;
}

/**
 * Register Form Errors
 */
export interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phoneNumber?: string;
  agreeToTerms?: string;
  general?: string;
}

/**
 * Register Page State
 */
export interface RegisterPageState {
  formData: RegisterFormData;
  errors: RegisterFormErrors;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showConfetti: boolean;
}

/**
 * Initial Register Form Data
 */
export const INITIAL_REGISTER_FORM_DATA: RegisterFormData = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  phoneNumber: "",
  agreeToTerms: false,
};

/**
 * Initial Register Page State
 */
export const INITIAL_REGISTER_PAGE_STATE: RegisterPageState = {
  formData: INITIAL_REGISTER_FORM_DATA,
  errors: {},
  isLoading: false,
  showPassword: false,
  showConfirmPassword: false,
  showConfetti: false,
};

/**
 * Register Page SEO Data
 */
export interface RegisterPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for register page
 */
export const DEFAULT_REGISTER_PAGE_SEO: RegisterPageSeoData = {
  title: "Daftar Akun | Giftforyou.idn",
  description: "Buat akun baru untuk akses penuh ke marketplace bouquet dan florist terbaik.",
  path: "/register",
};


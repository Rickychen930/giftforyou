/**
 * Customer Login Page Model
 * Defines data structures and types for the customer login page
 */

/**
 * Login Form Data
 */
export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Login Page State
 */
export interface LoginPageState {
  formData: LoginFormData;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  googleLoading: boolean;
}

/**
 * Initial Login Form Data
 */
export const INITIAL_LOGIN_FORM_DATA: LoginFormData = {
  username: "",
  password: "",
  rememberMe: false,
};

/**
 * Initial Login Page State
 */
export const INITIAL_LOGIN_PAGE_STATE: LoginPageState = {
  formData: INITIAL_LOGIN_FORM_DATA,
  error: "",
  isLoading: false,
  showPassword: false,
  googleLoading: false,
};

/**
 * Login Page SEO Data
 */
export interface LoginPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for login page
 */
export const DEFAULT_LOGIN_PAGE_SEO: LoginPageSeoData = {
  title: "Masuk ke Akun | Giftforyou.idn",
  description: "Masuk ke akun Anda untuk akses penuh ke marketplace bouquet dan florist.",
  path: "/customer/login",
};


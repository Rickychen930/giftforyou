/**
 * Customer Change Password Page Model
 * Defines data structures and types for the customer change password page
 */

/**
 * Change Password Form Data
 */
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change Password Form Errors
 */
export interface ChangePasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Password Visibility State
 */
export interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

/**
 * Change Password Page State
 */
export interface ChangePasswordPageState {
  formData: ChangePasswordFormData;
  errors: ChangePasswordFormErrors;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showPassword: PasswordVisibility;
  showSuccess: boolean;
  showConfetti: boolean;
}

/**
 * Initial Change Password Form Data
 */
export const INITIAL_CHANGE_PASSWORD_FORM_DATA: ChangePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * Initial Password Visibility
 */
export const INITIAL_PASSWORD_VISIBILITY: PasswordVisibility = {
  current: false,
  new: false,
  confirm: false,
};

/**
 * Initial Change Password Page State
 */
export const INITIAL_CHANGE_PASSWORD_PAGE_STATE: ChangePasswordPageState = {
  formData: INITIAL_CHANGE_PASSWORD_FORM_DATA,
  errors: {},
  isLoading: true,
  isSaving: false,
  isAuthenticated: false,
  showPassword: INITIAL_PASSWORD_VISIBILITY,
  showSuccess: false,
  showConfetti: false,
};

/**
 * Change Password Page SEO Data
 */
export interface ChangePasswordPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for change password page
 */
export const DEFAULT_CHANGE_PASSWORD_PAGE_SEO: ChangePasswordPageSeoData = {
  title: "Ubah Password | Giftforyou.idn",
  description: "Ubah password akun Anda.",
  path: "/customer/change-password",
};


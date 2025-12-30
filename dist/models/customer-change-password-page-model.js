"use strict";
/**
 * Customer Change Password Page Model
 * Defines data structures and types for the customer change password page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHANGE_PASSWORD_PAGE_SEO = exports.INITIAL_CHANGE_PASSWORD_PAGE_STATE = exports.INITIAL_PASSWORD_VISIBILITY = exports.INITIAL_CHANGE_PASSWORD_FORM_DATA = void 0;
/**
 * Initial Change Password Form Data
 */
exports.INITIAL_CHANGE_PASSWORD_FORM_DATA = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};
/**
 * Initial Password Visibility
 */
exports.INITIAL_PASSWORD_VISIBILITY = {
    current: false,
    new: false,
    confirm: false,
};
/**
 * Initial Change Password Page State
 */
exports.INITIAL_CHANGE_PASSWORD_PAGE_STATE = {
    formData: exports.INITIAL_CHANGE_PASSWORD_FORM_DATA,
    errors: {},
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showPassword: exports.INITIAL_PASSWORD_VISIBILITY,
    showSuccess: false,
    showConfetti: false,
};
/**
 * Default SEO data for change password page
 */
exports.DEFAULT_CHANGE_PASSWORD_PAGE_SEO = {
    title: "Ubah Password | Giftforyou.idn",
    description: "Ubah password akun Anda.",
    path: "/customer/change-password",
};
//# sourceMappingURL=customer-change-password-page-model.js.map
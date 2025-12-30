"use strict";
/**
 * Customer Register Page Model
 * Defines data structures and types for the customer register page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REGISTER_PAGE_SEO = exports.INITIAL_REGISTER_PAGE_STATE = exports.INITIAL_REGISTER_FORM_DATA = void 0;
/**
 * Initial Register Form Data
 */
exports.INITIAL_REGISTER_FORM_DATA = {
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
exports.INITIAL_REGISTER_PAGE_STATE = {
    formData: exports.INITIAL_REGISTER_FORM_DATA,
    errors: {},
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    showConfetti: false,
};
/**
 * Default SEO data for register page
 */
exports.DEFAULT_REGISTER_PAGE_SEO = {
    title: "Daftar Akun | Giftforyou.idn",
    description: "Buat akun baru untuk akses penuh ke marketplace bouquet dan florist terbaik.",
    path: "/register",
};
//# sourceMappingURL=customer-register-page-model.js.map
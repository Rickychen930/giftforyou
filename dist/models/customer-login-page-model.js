"use strict";
/**
 * Customer Login Page Model
 * Defines data structures and types for the customer login page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOGIN_PAGE_SEO = exports.INITIAL_LOGIN_PAGE_STATE = exports.INITIAL_LOGIN_FORM_DATA = void 0;
/**
 * Initial Login Form Data
 */
exports.INITIAL_LOGIN_FORM_DATA = {
    username: "",
    password: "",
    rememberMe: false,
};
/**
 * Initial Login Page State
 */
exports.INITIAL_LOGIN_PAGE_STATE = {
    formData: exports.INITIAL_LOGIN_FORM_DATA,
    error: "",
    isLoading: false,
    showPassword: false,
    googleLoading: false,
};
/**
 * Default SEO data for login page
 */
exports.DEFAULT_LOGIN_PAGE_SEO = {
    title: "Masuk ke Akun | Giftforyou.idn",
    description: "Masuk ke akun Anda untuk akses penuh ke marketplace bouquet dan florist.",
    path: "/customer/login",
};
//# sourceMappingURL=customer-login-page-model.js.map
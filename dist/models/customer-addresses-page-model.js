"use strict";
/**
 * Customer Addresses Page Model
 * Defines data structures and types for the customer addresses page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ADDRESSES_PAGE_SEO = exports.INITIAL_ADDRESSES_PAGE_STATE = exports.INITIAL_ADDRESS_FORM_DATA = void 0;
/**
 * Initial Address Form Data
 */
exports.INITIAL_ADDRESS_FORM_DATA = {
    label: "",
    address: "",
    isDefault: false,
};
/**
 * Initial Addresses Page State
 */
exports.INITIAL_ADDRESSES_PAGE_STATE = {
    addresses: [],
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showForm: false,
    editingId: null,
    formData: exports.INITIAL_ADDRESS_FORM_DATA,
    errors: {},
    showSuccess: false,
    successMessage: "",
    showConfetti: false,
};
/**
 * Default SEO data for addresses page
 */
exports.DEFAULT_ADDRESSES_PAGE_SEO = {
    title: "Buku Alamat | Giftforyou.idn",
    description: "Kelola alamat pengiriman Anda.",
    path: "/customer/addresses",
};
//# sourceMappingURL=customer-addresses-page-model.js.map
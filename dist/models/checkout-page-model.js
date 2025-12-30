"use strict";
/**
 * Checkout Page Model
 * Defines data structures and types for the checkout page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CHECKOUT_PAGE_SEO = exports.INITIAL_CHECKOUT_PAGE_STATE = exports.INITIAL_CHECKOUT_FORM_STATE = exports.getDefaultDate = void 0;
/**
 * Get default date (tomorrow)
 */
const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
};
exports.getDefaultDate = getDefaultDate;
/**
 * Initial Checkout Form State
 */
exports.INITIAL_CHECKOUT_FORM_STATE = {
    deliveryType: "delivery",
    deliveryDate: (0, exports.getDefaultDate)(),
    deliveryTimeSlot: undefined,
    address: "",
    greetingCard: "",
    orderNotes: "",
    deliveryLocation: undefined,
    deliveryPriceResult: undefined,
};
/**
 * Initial Checkout Page State
 */
exports.INITIAL_CHECKOUT_PAGE_STATE = {
    ...exports.INITIAL_CHECKOUT_FORM_STATE,
    items: [],
    isLoading: true,
    isSubmitting: false,
    formErrors: {},
    isFormValid: false,
    savedAddresses: [],
    loadingAddresses: false,
    showPreviewModal: false,
};
/**
 * Default SEO data for checkout page
 */
exports.DEFAULT_CHECKOUT_PAGE_SEO = {
    title: "Checkout | Giftforyou.idn",
    description: "Lengkapi informasi pengiriman untuk menyelesaikan pesanan Anda",
    path: "/checkout",
};
//# sourceMappingURL=checkout-page-model.js.map
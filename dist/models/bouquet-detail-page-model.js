"use strict";
/**
 * Bouquet Detail Page Model
 * Defines data structures and types for the bouquet detail page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM_STORAGE_KEY = exports.getDefaultDate = exports.INITIAL_BOUQUET_DETAIL_PAGE_STATE = exports.INITIAL_ORDER_FORM_DATA = void 0;
/**
 * Initial Order Form Data
 */
exports.INITIAL_ORDER_FORM_DATA = {
    deliveryType: "delivery",
    deliveryDate: "",
    deliveryTimeSlot: undefined,
    address: "",
    greetingCard: "",
    quantity: 1,
};
/**
 * Initial Bouquet Detail Page State
 */
exports.INITIAL_BOUQUET_DETAIL_PAGE_STATE = {
    formData: exports.INITIAL_ORDER_FORM_DATA,
    formErrors: {},
    isFormValid: false,
    isFavorite: false,
    showOrderModal: false,
    formProgress: 0,
};
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
 * Form Storage Key
 */
exports.FORM_STORAGE_KEY = "bouquet_order_form_data";
//# sourceMappingURL=bouquet-detail-page-model.js.map
"use strict";
/**
 * Customer Profile Page Model
 * Defines data structures and types for the customer profile page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROFILE_PAGE_SEO = exports.INITIAL_PROFILE_PAGE_STATE = exports.INITIAL_PROFILE_FORM_DATA = void 0;
/**
 * Initial Profile Form Data
 */
exports.INITIAL_PROFILE_FORM_DATA = {
    fullName: "",
    phoneNumber: "",
    address: "",
};
/**
 * Initial Profile Page State
 */
exports.INITIAL_PROFILE_PAGE_STATE = {
    user: null,
    formData: exports.INITIAL_PROFILE_FORM_DATA,
    errors: {},
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showSuccess: false,
    lastSaved: null,
    showConfetti: false,
};
/**
 * Default SEO data for profile page
 */
exports.DEFAULT_PROFILE_PAGE_SEO = {
    title: "Profil Saya | Giftforyou.idn",
    description: "Kelola informasi profil Anda.",
    path: "/customer/profile",
};
//# sourceMappingURL=customer-profile-page-model.js.map
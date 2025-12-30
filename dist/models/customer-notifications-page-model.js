"use strict";
/**
 * Customer Notifications Page Model
 * Defines data structures and types for the customer notifications page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NOTIFICATIONS_PAGE_SEO = exports.INITIAL_NOTIFICATIONS_PAGE_STATE = exports.INITIAL_NOTIFICATION_SETTINGS = void 0;
/**
 * Initial Notification Settings
 */
exports.INITIAL_NOTIFICATION_SETTINGS = {
    email: {
        orders: true,
        promotions: true,
        updates: true,
    },
    push: {
        orders: true,
        promotions: false,
        updates: true,
    },
    sms: {
        orders: true,
        promotions: false,
    },
};
/**
 * Initial Notifications Page State
 */
exports.INITIAL_NOTIFICATIONS_PAGE_STATE = {
    settings: exports.INITIAL_NOTIFICATION_SETTINGS,
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showSuccess: false,
};
/**
 * Default SEO data for notifications page
 */
exports.DEFAULT_NOTIFICATIONS_PAGE_SEO = {
    title: "Pengaturan Notifikasi | Giftforyou.idn",
    description: "Kelola preferensi notifikasi Anda.",
    path: "/customer/notifications",
};
//# sourceMappingURL=customer-notifications-page-model.js.map
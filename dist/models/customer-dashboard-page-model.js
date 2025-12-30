"use strict";
/**
 * Customer Dashboard Page Model
 * Defines data structures and types for the customer dashboard page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusBadge = exports.DEFAULT_DASHBOARD_PAGE_SEO = exports.INITIAL_DASHBOARD_PAGE_STATE = exports.INITIAL_DASHBOARD_STATS = void 0;
/**
 * Initial Dashboard Stats
 */
exports.INITIAL_DASHBOARD_STATS = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    favoritesCount: 0,
};
/**
 * Initial Dashboard Page State
 */
exports.INITIAL_DASHBOARD_PAGE_STATE = {
    user: null,
    stats: exports.INITIAL_DASHBOARD_STATS,
    recentOrders: [],
    isLoading: true,
    error: null,
    activeTab: "overview",
};
/**
 * Default SEO data for dashboard page
 */
exports.DEFAULT_DASHBOARD_PAGE_SEO = {
    title: "Dashboard | Giftforyou.idn",
    description: "Kelola akun, pesanan, dan favorit Anda di dashboard customer.",
    path: "/customer/dashboard",
};
/**
 * Get status badge info
 */
const getStatusBadge = (status) => {
    const statusMap = {
        bertanya: { text: "Bertanya", className: "status--info" },
        memesan: { text: "Memesan", className: "status--primary" },
        sedang_diproses: { text: "Diproses", className: "status--warning" },
        menunggu_driver: { text: "Menunggu Driver", className: "status--warning" },
        pengantaran: { text: "Pengantaran", className: "status--info" },
        terkirim: { text: "Terkirim", className: "status--success" },
    };
    return statusMap[status] || { text: status, className: "status--default" };
};
exports.getStatusBadge = getStatusBadge;
//# sourceMappingURL=customer-dashboard-page-model.js.map
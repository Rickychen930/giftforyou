"use strict";
/**
 * Contact Page Model
 * Defines data structures and types for the contact page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONTACT_PAGE_SEO = exports.INITIAL_CONTACT_PAGE_STATE = exports.INITIAL_CONTACT_FORM_DATA = void 0;
/**
 * Initial Contact Form Data
 */
exports.INITIAL_CONTACT_FORM_DATA = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};
/**
 * Initial Contact Page State
 */
exports.INITIAL_CONTACT_PAGE_STATE = {
    formData: exports.INITIAL_CONTACT_FORM_DATA,
    status: "idle",
    errorMessage: "",
};
/**
 * Default SEO data for contact page
 */
exports.DEFAULT_CONTACT_PAGE_SEO = {
    title: "Kontak Kami - Hubungi Giftforyou.idn | Florist Cirebon",
    description: "Hubungi Giftforyou.idn untuk pemesanan bouquet, gift box, dan stand acrylic. Kami siap membantu Anda dengan berbagai kebutuhan hadiah dan dekorasi. Lokasi: Cirebon, Jawa Barat.",
    keywords: "kontak giftforyou, hubungi florist cirebon, alamat toko bunga cirebon, telepon florist cirebon",
    path: "/contact",
};
//# sourceMappingURL=contact-page-model.js.map
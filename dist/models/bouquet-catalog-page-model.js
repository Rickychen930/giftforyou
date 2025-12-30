"use strict";
/**
 * Bouquet Catalog Page Model
 * Defines state interfaces and initial values for the Bouquet Catalog Page
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BOUQUET_CATALOG_PAGE_SEO = exports.INITIAL_BOUQUET_CATALOG_PAGE_STATE = exports.DEFAULT_PRICE_RANGE = void 0;
/**
 * Default price range
 */
exports.DEFAULT_PRICE_RANGE = [0, 1000000];
/**
 * Initial state for Bouquet Catalog Page
 */
exports.INITIAL_BOUQUET_CATALOG_PAGE_STATE = {
    bouquets: [],
    priceRange: exports.DEFAULT_PRICE_RANGE,
    selectedTypes: [],
    selectedSizes: [],
    selectedCollections: [],
    sortBy: "",
    currentPage: 1,
    itemsPerPage: 9,
    collectionNameFilter: "",
    searchQuery: "",
    loading: true,
    error: null,
};
/**
 * Default SEO data for Bouquet Catalog Page
 */
exports.DEFAULT_BOUQUET_CATALOG_PAGE_SEO = {
    title: "Katalog Bouquet Cirebon | Giftforyou.idn - Florist Terbaik di Jawa Barat",
    description: "Katalog lengkap bouquet di Cirebon, Jawa Barat. Tersedia berbagai pilihan bouquet bunga segar, gift box, stand acrylic, dan artificial bouquet. Filter berdasarkan tipe, ukuran, dan harga. Pesan mudah via WhatsApp dengan pengiriman cepat ke seluruh Cirebon.",
    keywords: "katalog bouquet cirebon, bouquet cirebon murah, gift box cirebon, stand acrylic cirebon, florist cirebon online, toko bunga cirebon, artificial bouquet cirebon, hadiah cirebon, kado cirebon, florist jawa barat",
    path: "/collection",
};
//# sourceMappingURL=bouquet-catalog-page-model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatIDR = void 0;
const formatIDR = (price) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
};
exports.formatIDR = formatIDR;
//# sourceMappingURL=money.js.map
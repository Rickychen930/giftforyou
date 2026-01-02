"use strict";
// src/models/orders-model.ts
// Business logic model for orders section
// Contains utilities, validation, calculations, and data transformations
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrdersToCSV = exports.buildOrderSummary = exports.buildWaMessage = exports.applyDeliveryQuick = exports.applyDeliveryPreset = exports.applyPaymentPreset = exports.filterAndSortOrders = exports.nextOrderStatus = exports.calculateOrderStats = exports.isOrderOverdue = exports.calculateOrderRemaining = exports.calculateOrderTotal = exports.calculateDerivedNumbers = exports.toWaPhone = exports.normalizePhone = exports.parseAmount = exports.formatIDR = exports.formatShortDateTime = exports.formatDateTime = exports.toDateTimeLocalFromDate = exports.toDateTimeLocalValue = exports.safeDate = void 0;
// ==================== Date Utilities ====================
function safeDate(v) {
    if (!v)
        return null;
    const t = Date.parse(v);
    if (!Number.isFinite(t))
        return null;
    return new Date(t);
}
exports.safeDate = safeDate;
function toDateTimeLocalValue(v) {
    const d = safeDate(v);
    if (!d)
        return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
exports.toDateTimeLocalValue = toDateTimeLocalValue;
function toDateTimeLocalFromDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
exports.toDateTimeLocalFromDate = toDateTimeLocalFromDate;
function formatDateTime(v) {
    if (!v)
        return "—";
    const t = Date.parse(v);
    if (!Number.isFinite(t))
        return "—";
    return new Date(t).toLocaleString("id-ID");
}
exports.formatDateTime = formatDateTime;
function formatShortDateTime(v) {
    if (!v)
        return "—";
    const t = Date.parse(v);
    if (!Number.isFinite(t))
        return "—";
    try {
        return new Date(t).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    catch {
        return formatDateTime(v);
    }
}
exports.formatShortDateTime = formatShortDateTime;
// ==================== Money Utilities ====================
function formatIDR(n) {
    const num = typeof n === "number"
        ? n
        : typeof n === "string"
            ? Number(n)
            : NaN;
    if (!Number.isFinite(num))
        return "—";
    try {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(num);
    }
    catch {
        return `Rp ${Math.round(num)}`;
    }
}
exports.formatIDR = formatIDR;
function parseAmount(v) {
    const cleaned = (v ?? "").toString().replace(/[^0-9]/g, "").trim();
    if (!cleaned)
        return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}
exports.parseAmount = parseAmount;
// ==================== Phone Utilities ====================
function normalizePhone(v) {
    return v.replace(/\s+/g, " ").trim();
}
exports.normalizePhone = normalizePhone;
function toWaPhone(raw) {
    const digits = (raw ?? "").toString().replace(/\D+/g, "");
    if (!digits)
        return null;
    if (digits.startsWith("62"))
        return digits;
    if (digits.startsWith("0"))
        return `62${digits.slice(1)}`;
    return digits;
}
exports.toWaPhone = toWaPhone;
// ==================== Order Calculations ====================
function calculateDerivedNumbers(bouquetPrice, downPaymentAmount, additionalPayment, deliveryPrice) {
    const dp = parseAmount(downPaymentAmount);
    const addPay = parseAmount(additionalPayment);
    const delivery = parseAmount(deliveryPrice);
    const total = Math.max(0, Math.round(bouquetPrice) + Math.round(delivery));
    const paid = Math.max(0, dp + addPay);
    const remaining = Math.max(0, total - paid);
    const derivedPaymentStatus = total <= 0
        ? "sudah_bayar"
        : paid <= 0
            ? "belum_bayar"
            : paid >= total
                ? "sudah_bayar"
                : "dp";
    return { dp, addPay, delivery, total, paid, remaining, derivedPaymentStatus };
}
exports.calculateDerivedNumbers = calculateDerivedNumbers;
function calculateOrderTotal(order) {
    const legacyBouquetPrice = typeof order.bouquetPrice === "number" ? order.bouquetPrice : 0;
    const legacyDelivery = typeof order.deliveryPrice === "number" ? order.deliveryPrice : 0;
    return typeof order.totalAmount === "number"
        ? order.totalAmount
        : Math.max(0, Math.round(legacyBouquetPrice) + Math.round(legacyDelivery));
}
exports.calculateOrderTotal = calculateOrderTotal;
function calculateOrderRemaining(order) {
    const total = calculateOrderTotal(order);
    const dp = typeof order.downPaymentAmount === "number" ? order.downPaymentAmount : 0;
    const add = typeof order.additionalPayment === "number" ? order.additionalPayment : 0;
    return Math.max(0, total - dp - add);
}
exports.calculateOrderRemaining = calculateOrderRemaining;
function isOrderOverdue(order) {
    const d = safeDate(order.deliveryAt);
    const os = order.orderStatus ?? "bertanya";
    return Boolean(d && os !== "terkirim" && d.getTime() < Date.now());
}
exports.isOrderOverdue = isOrderOverdue;
// ==================== Order Statistics ====================
function calculateOrderStats(orders) {
    const total = orders.length;
    const byStatus = {
        bertanya: 0,
        memesan: 0,
        sedang_diproses: 0,
        menunggu_driver: 0,
        pengantaran: 0,
        terkirim: 0,
    };
    const byPayment = {
        belum_bayar: 0,
        dp: 0,
        sudah_bayar: 0,
    };
    orders.forEach((o) => {
        const status = (o.orderStatus ?? "bertanya");
        byStatus[status] = (byStatus[status] ?? 0) + 1;
        const payment = (o.paymentStatus ?? "belum_bayar");
        byPayment[payment] = (byPayment[payment] ?? 0) + 1;
    });
    const overdue = orders.filter(isOrderOverdue).length;
    const totalRevenue = orders.reduce((sum, o) => {
        return sum + calculateOrderTotal(o);
    }, 0);
    const paidRevenue = orders.reduce((sum, o) => {
        const dp = typeof o.downPaymentAmount === "number" ? o.downPaymentAmount : 0;
        const add = typeof o.additionalPayment === "number" ? o.additionalPayment : 0;
        return sum + dp + add;
    }, 0);
    return {
        total,
        byStatus,
        byPayment,
        overdue,
        totalRevenue,
        paidRevenue,
        pendingRevenue: totalRevenue - paidRevenue,
    };
}
exports.calculateOrderStats = calculateOrderStats;
// ==================== Order Status Flow ====================
function nextOrderStatus(cur) {
    const status = (cur ?? "bertanya");
    const flow = [
        "bertanya",
        "memesan",
        "sedang_diproses",
        "menunggu_driver",
        "pengantaran",
        "terkirim",
    ];
    const idx = flow.indexOf(status);
    return flow[Math.min(Math.max(idx + 1, 0), flow.length - 1)];
}
exports.nextOrderStatus = nextOrderStatus;
// ==================== Filter and Sort ====================
function filterAndSortOrders(orders, query, filterOrderStatus, filterPaymentStatus, sortBy, sortDirection) {
    let result = [...orders];
    // Apply search filter
    const q = query.trim().toLowerCase();
    if (q) {
        result = result.filter((o) => {
            const buyer = (o.buyerName ?? "").toString().toLowerCase();
            const phone = (o.phoneNumber ?? "").toString().toLowerCase();
            const bouquet = (o.bouquetName ?? "").toString().toLowerCase();
            return buyer.includes(q) || phone.includes(q) || bouquet.includes(q);
        });
    }
    // Apply status filters
    if (filterOrderStatus !== "all") {
        result = result.filter((o) => (o.orderStatus ?? "bertanya") === filterOrderStatus);
    }
    if (filterPaymentStatus !== "all") {
        result = result.filter((o) => (o.paymentStatus ?? "belum_bayar") === filterPaymentStatus);
    }
    // Apply sorting
    result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "date":
                const dateA = safeDate(a.createdAt)?.getTime() ?? 0;
                const dateB = safeDate(b.createdAt)?.getTime() ?? 0;
                comparison = dateA - dateB;
                break;
            case "name":
                comparison = (a.buyerName ?? "").localeCompare(b.buyerName ?? "");
                break;
            case "amount": {
                const totalA = calculateOrderTotal(a);
                const totalB = calculateOrderTotal(b);
                comparison = totalA - totalB;
                break;
            }
            case "status":
                const statusA = (a.orderStatus ?? "bertanya").replace(/_/g, " ");
                const statusB = (b.orderStatus ?? "bertanya").replace(/_/g, " ");
                comparison = statusA.localeCompare(statusB);
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });
    return result;
}
exports.filterAndSortOrders = filterAndSortOrders;
// ==================== Payment Presets ====================
function applyPaymentPreset(preset, total, currentDp, currentAdd, currentPaid) {
    if (preset === "belum_bayar") {
        return { downPaymentAmount: "0", additionalPayment: "0" };
    }
    if (total <= 0) {
        return { downPaymentAmount: currentDp, additionalPayment: currentAdd };
    }
    if (preset === "sudah_bayar") {
        const remaining = total - currentPaid;
        const nextAdd = parseAmount(currentAdd) + remaining;
        return {
            downPaymentAmount: currentDp,
            additionalPayment: String(Math.max(0, Math.round(nextAdd))),
        };
    }
    // preset === "dp"
    if (currentPaid <= 0) {
        const rawHalf = Math.round(total * 0.5);
        const dp = total >= 10000
            ? Math.round(rawHalf / 1000) * 1000
            : Math.max(1, Math.floor(total / 2));
        const safeDp = Math.min(Math.max(0, dp), Math.max(0, total - 1));
        return { downPaymentAmount: String(safeDp), additionalPayment: "0" };
    }
    return { downPaymentAmount: currentDp, additionalPayment: currentAdd };
}
exports.applyPaymentPreset = applyPaymentPreset;
// ==================== Delivery Presets ====================
function applyDeliveryPreset(preset) {
    const now = new Date();
    let target;
    switch (preset) {
        case "today":
            target = new Date(now);
            target.setHours(14, 0, 0, 0); // 2 PM today
            if (target.getTime() < now.getTime()) {
                target.setHours(now.getHours() + 2, 0, 0, 0); // 2 hours from now if past 2 PM
            }
            break;
        case "tomorrow":
            target = new Date(now);
            target.setDate(target.getDate() + 1);
            target.setHours(10, 0, 0, 0); // 10 AM tomorrow
            break;
        case "nextWeek":
            target = new Date(now);
            target.setDate(target.getDate() + 7);
            target.setHours(10, 0, 0, 0); // 10 AM next week
            break;
    }
    return toDateTimeLocalFromDate(target);
}
exports.applyDeliveryPreset = applyDeliveryPreset;
function applyDeliveryQuick(hoursFromNow) {
    const now = new Date();
    const next = new Date(now.getTime() + Math.max(0, hoursFromNow) * 60 * 60 * 1000);
    return toDateTimeLocalFromDate(next);
}
exports.applyDeliveryQuick = applyDeliveryQuick;
// ==================== WhatsApp Message ====================
function buildWaMessage(buyerName, bouquetName, deliveryAt, total, paid, remaining) {
    const deliverLabel = deliveryAt
        ? new Date(deliveryAt).toLocaleString("id-ID")
        : "—";
    const lines = [
        `Halo ${buyerName || ""},`,
        `Terima kasih sudah order di Giftforyou.idn.`,
        `Bouquet: ${bouquetName || "—"}`,
        `Jadwal deliver: ${deliverLabel}`,
        `Total: ${formatIDR(total)}`,
        `Sudah dibayar: ${formatIDR(paid)}`,
        `Sisa bayar: ${formatIDR(remaining)}`,
    ];
    return lines.join("\n");
}
exports.buildWaMessage = buildWaMessage;
function buildOrderSummary(buyerName, phoneNumber, address, bouquetName, deliveryAt, orderStatus, paymentStatus, paymentMethod, total, paid, remaining, dp, addPay, delivery) {
    const deliverLabel = deliveryAt
        ? new Date(deliveryAt).toLocaleString("id-ID")
        : "—";
    const lines = [
        "[ORDER SUMMARY]",
        `Pembeli: ${buyerName || "—"}`,
        `No HP: ${phoneNumber || "—"}`,
        `Alamat: ${address || "—"}`,
        `Bouquet: ${bouquetName || "—"}`,
        `Deliver: ${deliverLabel}`,
        `Status: ${(orderStatus ?? "bertanya").replace(/_/g, " ")}`,
        `Pembayaran: ${paymentStatus.replace(/_/g, " ")}`,
        `Metode: ${(paymentMethod || "—").replace(/_/g, " ")}`,
        `Total: ${formatIDR(total)}`,
        `Sudah dibayar: ${formatIDR(paid)}`,
        `Sisa bayar: ${formatIDR(remaining)}`,
        `DP: ${formatIDR(dp)} • Tambahan: ${formatIDR(addPay)} • Delivery: ${formatIDR(delivery)}`,
    ];
    return lines.join("\n");
}
exports.buildOrderSummary = buildOrderSummary;
// ==================== Export CSV ====================
function exportOrdersToCSV(orders) {
    const csv = [
        ["ID", "Nama", "Telepon", "Bouquet", "Status", "Payment", "Total", "Tanggal"],
        ...orders.map((o) => [
            o._id || "",
            o.buyerName,
            o.phoneNumber,
            o.bouquetName,
            o.orderStatus || "",
            o.paymentStatus || "",
            calculateOrderTotal(o).toString(),
            formatDateTime(o.createdAt),
        ]),
    ]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
    return csv;
}
exports.exportOrdersToCSV = exportOrdersToCSV;
//# sourceMappingURL=orders-model.js.map
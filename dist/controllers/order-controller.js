"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getOrders = exports.updateOrder = exports.createOrder = void 0;
const order_model_1 = require("../models/order-model");
const bouquet_model_1 = require("../models/bouquet-model");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalize = (v, maxLen) => {
    if (typeof v !== "string")
        return "";
    return v.trim().slice(0, maxLen);
};
const parseNonNegativeNumber = (v) => {
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    if (!Number.isFinite(n))
        return 0;
    return Math.max(0, Math.round(n));
};
const isOrderStatus = (v) => v === "bertanya" ||
    v === "memesan" ||
    v === "sedang_diproses" ||
    v === "menunggu_driver" ||
    v === "pengantaran" ||
    v === "terkirim";
const isPaymentMethod = (v) => v === "" ||
    v === "cash" ||
    v === "transfer_bank" ||
    v === "ewallet" ||
    v === "qris" ||
    v === "lainnya";
const derivePaymentStatus = (totalAmount, downPaymentAmount, additionalPayment) => {
    const total = Math.max(0, Math.round(totalAmount));
    const paid = Math.max(0, Math.round(downPaymentAmount)) + Math.max(0, Math.round(additionalPayment));
    if (total <= 0)
        return "sudah_bayar";
    if (paid <= 0)
        return "belum_bayar";
    if (paid >= total)
        return "sudah_bayar";
    return "dp";
};
const resolveBouquetSnapshot = async (bouquetId, fallbackName, fallbackPrice) => {
    try {
        const b = await bouquet_model_1.BouquetModel.findById(bouquetId)
            .select({ name: 1, price: 1 })
            .lean()
            .exec();
        if (b && typeof b.name === "string") {
            return {
                bouquetName: b.name.trim().slice(0, 200),
                bouquetPrice: parseNonNegativeNumber(b.price),
            };
        }
    }
    catch {
        // ignore lookup failures; fall back to request payload
    }
    return {
        bouquetName: fallbackName,
        bouquetPrice: fallbackPrice,
    };
};
async function createOrder(req, res) {
    try {
        const buyerName = normalize(req.body?.buyerName, 120);
        const phoneNumber = normalize(req.body?.phoneNumber, 40);
        const address = normalize(req.body?.address, 500);
        const bouquetId = normalize(req.body?.bouquetId, 64);
        const bouquetNameRaw = normalize(req.body?.bouquetName, 200);
        const bouquetPriceFromBody = parseNonNegativeNumber(req.body?.bouquetPrice);
        const { bouquetName, bouquetPrice } = await resolveBouquetSnapshot(bouquetId, bouquetNameRaw, bouquetPriceFromBody);
        const orderStatusRaw = normalize(req.body?.orderStatus, 32);
        const paymentMethodRaw = normalize(req.body?.paymentMethod, 32);
        const orderStatus = isOrderStatus(orderStatusRaw)
            ? orderStatusRaw
            : "bertanya";
        const paymentMethod = isPaymentMethod(paymentMethodRaw)
            ? paymentMethodRaw
            : "";
        const downPaymentAmount = parseNonNegativeNumber(req.body?.downPaymentAmount);
        const additionalPayment = parseNonNegativeNumber(req.body?.additionalPayment);
        const deliveryPrice = parseNonNegativeNumber(req.body?.deliveryPrice);
        const totalAmount = parseNonNegativeNumber(bouquetPrice + deliveryPrice);
        const paymentStatus = derivePaymentStatus(totalAmount, downPaymentAmount, additionalPayment);
        const deliveryAtRaw = normalize(req.body?.deliveryAt, 40);
        const deliveryAt = deliveryAtRaw ? new Date(deliveryAtRaw) : undefined;
        if (!buyerName || !phoneNumber || !address || !bouquetId || !bouquetName) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        if (deliveryAtRaw && !Number.isFinite(deliveryAt?.getTime())) {
            res.status(400).json({ message: "Invalid deliveryAt" });
            return;
        }
        const created = await order_model_1.OrderModel.create({
            buyerName,
            phoneNumber,
            address,
            bouquetId,
            bouquetName,
            bouquetPrice,
            orderStatus,
            paymentStatus,
            paymentMethod,
            downPaymentAmount,
            additionalPayment,
            deliveryPrice,
            totalAmount,
            deliveryAt,
            activity: [
                {
                    at: new Date(),
                    kind: "created",
                    message: `Order dibuat • status: ${orderStatus.replace(/_/g, " ")} • bayar: ${paymentStatus.replace(/_/g, " ")}`,
                },
            ],
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error("createOrder failed:", err);
        res.status(500).json({ message: "Failed to create order" });
    }
}
exports.createOrder = createOrder;
async function updateOrder(req, res) {
    try {
        const id = normalize(req.params?.id, 64);
        if (!id) {
            res.status(400).json({ message: "Missing id" });
            return;
        }
        const existing = await order_model_1.OrderModel.findById(id).lean().exec();
        if (!existing) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const patch = {};
        const buyerName = normalize(req.body?.buyerName, 120);
        const phoneNumber = normalize(req.body?.phoneNumber, 40);
        const address = normalize(req.body?.address, 500);
        const bouquetId = normalize(req.body?.bouquetId, 64);
        const bouquetName = normalize(req.body?.bouquetName, 200);
        if (buyerName)
            patch.buyerName = buyerName;
        if (phoneNumber)
            patch.phoneNumber = phoneNumber;
        if (address)
            patch.address = address;
        if (bouquetId)
            patch.bouquetId = bouquetId;
        if (bouquetName)
            patch.bouquetName = bouquetName;
        const orderStatusRaw = normalize(req.body?.orderStatus, 32);
        if (orderStatusRaw && isOrderStatus(orderStatusRaw))
            patch.orderStatus = orderStatusRaw;
        const paymentMethodRaw = normalize(req.body?.paymentMethod, 32);
        if (paymentMethodRaw && isPaymentMethod(paymentMethodRaw))
            patch.paymentMethod = paymentMethodRaw;
        if (req.body?.downPaymentAmount !== undefined) {
            patch.downPaymentAmount = parseNonNegativeNumber(req.body.downPaymentAmount);
        }
        if (req.body?.additionalPayment !== undefined) {
            patch.additionalPayment = parseNonNegativeNumber(req.body.additionalPayment);
        }
        if (req.body?.deliveryPrice !== undefined) {
            patch.deliveryPrice = parseNonNegativeNumber(req.body.deliveryPrice);
        }
        if (req.body?.bouquetPrice !== undefined) {
            patch.bouquetPrice = parseNonNegativeNumber(req.body.bouquetPrice);
        }
        const deliveryAtRaw = normalize(req.body?.deliveryAt, 40);
        if (deliveryAtRaw) {
            const d = new Date(deliveryAtRaw);
            if (!Number.isFinite(d.getTime())) {
                res.status(400).json({ message: "Invalid deliveryAt" });
                return;
            }
            patch.deliveryAt = d;
        }
        const nextBouquetId = (patch.bouquetId ?? existing.bouquetId);
        let nextBouquetName = (patch.bouquetName ?? existing.bouquetName ?? "");
        let nextBouquetPrice = parseNonNegativeNumber(patch.bouquetPrice !== undefined ? patch.bouquetPrice : existing.bouquetPrice);
        if (nextBouquetId && patch.bouquetId) {
            const fallbackName = nextBouquetName;
            const fallbackPrice = nextBouquetPrice;
            const snap = await resolveBouquetSnapshot(nextBouquetId, fallbackName, fallbackPrice);
            nextBouquetName = snap.bouquetName;
            nextBouquetPrice = snap.bouquetPrice;
            patch.bouquetName = snap.bouquetName;
            patch.bouquetPrice = snap.bouquetPrice;
        }
        const nextDownPayment = parseNonNegativeNumber(patch.downPaymentAmount !== undefined
            ? patch.downPaymentAmount
            : existing.downPaymentAmount);
        const nextAdditional = parseNonNegativeNumber(patch.additionalPayment !== undefined
            ? patch.additionalPayment
            : existing.additionalPayment);
        const nextDelivery = parseNonNegativeNumber(patch.deliveryPrice !== undefined ? patch.deliveryPrice : existing.deliveryPrice);
        const nextTotalAmount = parseNonNegativeNumber(nextBouquetPrice + nextDelivery);
        patch.totalAmount = nextTotalAmount;
        patch.paymentStatus = derivePaymentStatus(nextTotalAmount, nextDownPayment, nextAdditional);
        const nextOrderStatus = (patch.orderStatus ?? existing.orderStatus);
        const nextPaymentStatus = patch.paymentStatus;
        const nextPaymentMethod = (patch.paymentMethod ?? existing.paymentMethod ?? "");
        const prevOrderStatus = (existing.orderStatus ?? "bertanya");
        const prevPaymentStatus = (existing.paymentStatus ?? "belum_bayar");
        const prevPaymentMethod = (existing.paymentMethod ?? "");
        const prevDeliveryAt = existing.deliveryAt ? new Date(existing.deliveryAt) : null;
        const nextDeliveryAt = patch.deliveryAt ? new Date(patch.deliveryAt) : prevDeliveryAt;
        const activity = Array.isArray(existing.activity) ? existing.activity.slice(0) : [];
        const push = (kind, message) => {
            activity.push({ at: new Date(), kind, message });
        };
        if (prevOrderStatus !== nextOrderStatus) {
            push("status", `Status order: ${prevOrderStatus.replace(/_/g, " ")} → ${nextOrderStatus.replace(/_/g, " ")}`);
        }
        if (prevPaymentStatus !== nextPaymentStatus) {
            push("payment", `Status bayar: ${prevPaymentStatus.replace(/_/g, " ")} → ${nextPaymentStatus.replace(/_/g, " ")}`);
        }
        if (prevPaymentMethod !== nextPaymentMethod) {
            push("payment", `Metode bayar: ${(prevPaymentMethod || "—").replace(/_/g, " ")} → ${(nextPaymentMethod || "—").replace(/_/g, " ")}`);
        }
        if (patch.deliveryAt) {
            const prevT = prevDeliveryAt?.getTime() ?? 0;
            const nextT = nextDeliveryAt?.getTime() ?? 0;
            if (prevT !== nextT) {
                push("delivery", "Waktu deliver diperbarui");
            }
        }
        if (patch.bouquetId) {
            push("bouquet", "Bouquet diperbarui");
        }
        if (patch.downPaymentAmount !== undefined ||
            patch.additionalPayment !== undefined ||
            patch.deliveryPrice !== undefined) {
            push("payment", "Nominal pembayaran/ongkir diperbarui");
        }
        if (!activity.length) {
            push("edit", "Order diperbarui");
        }
        patch.activity = activity.slice(-50);
        const updated = await order_model_1.OrderModel.findByIdAndUpdate(id, { $set: patch }, { new: true, runValidators: true })
            .lean()
            .exec();
        if (!updated) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json(updated);
    }
    catch (err) {
        console.error("updateOrder failed:", err);
        res.status(500).json({ message: "Failed to update order" });
    }
}
exports.updateOrder = updateOrder;
async function getOrders(req, res) {
    try {
        const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "100";
        const limitParsed = Number.parseInt(limitRaw, 10);
        const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 500) : 100;
        const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const q = qRaw.slice(0, 120);
        const filter = {};
        if (q) {
            const re = new RegExp(escapeRegex(q), "i");
            filter.$or = [{ buyerName: re }, { phoneNumber: re }];
        }
        const orders = await order_model_1.OrderModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        res.status(200).json(orders);
    }
    catch (err) {
        console.error("getOrders failed:", err);
        res.status(500).json({ message: "Failed to get orders" });
    }
}
exports.getOrders = getOrders;
async function deleteOrder(req, res) {
    try {
        const id = normalize(req.params?.id, 64);
        if (!id) {
            res.status(400).json({ message: "Missing id" });
            return;
        }
        const deleted = await order_model_1.OrderModel.findByIdAndDelete(id).lean().exec();
        if (!deleted) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error("deleteOrder failed:", err);
        res.status(500).json({ message: "Failed to delete order" });
    }
}
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=order-controller.js.map
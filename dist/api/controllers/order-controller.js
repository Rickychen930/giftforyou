"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getOrders = exports.updateOrder = exports.createOrder = void 0;
const order_model_1 = require("../../models/order-model");
const bouquet_model_1 = require("../../models/bouquet-model");
const customer_model_1 = require("../../models/customer-model");
const validation_1 = require("../../utils/validation");
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
                bouquetPrice: (0, validation_1.parseNonNegativeInt)(b.price),
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
        const customerId = (0, validation_1.normalizeString)(req.body?.customerId, "", 64);
        let buyerName = (0, validation_1.normalizeString)(req.body?.buyerName, "", 120);
        let phoneNumber = (0, validation_1.normalizeString)(req.body?.phoneNumber, "", 40);
        let address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
        if (customerId) {
            const customer = await customer_model_1.CustomerModel.findById(customerId).lean().exec();
            if (!customer) {
                res.status(400).json({ message: "Invalid customerId" });
                return;
            }
            buyerName = (0, validation_1.normalizeString)(customer.buyerName, "", 120);
            phoneNumber = (0, validation_1.normalizeString)(customer.phoneNumber, "", 40);
            address = (0, validation_1.normalizeString)(customer.address, "", 500);
        }
        const bouquetId = (0, validation_1.normalizeString)(req.body?.bouquetId, "", 64);
        const bouquetNameRaw = (0, validation_1.normalizeString)(req.body?.bouquetName, "", 200);
        const bouquetPriceFromBody = (0, validation_1.parseNonNegativeInt)(req.body?.bouquetPrice);
        const { bouquetName, bouquetPrice } = await resolveBouquetSnapshot(bouquetId, bouquetNameRaw, bouquetPriceFromBody);
        const orderStatusRaw = (0, validation_1.normalizeString)(req.body?.orderStatus, "", 32);
        const paymentMethodRaw = (0, validation_1.normalizeString)(req.body?.paymentMethod, "", 32);
        const orderStatus = isOrderStatus(orderStatusRaw)
            ? orderStatusRaw
            : "bertanya";
        const paymentMethod = isPaymentMethod(paymentMethodRaw)
            ? paymentMethodRaw
            : "";
        const downPaymentAmount = (0, validation_1.parseNonNegativeInt)(req.body?.downPaymentAmount);
        const additionalPayment = (0, validation_1.parseNonNegativeInt)(req.body?.additionalPayment);
        const deliveryPrice = (0, validation_1.parseNonNegativeInt)(req.body?.deliveryPrice);
        const totalAmount = (0, validation_1.parseNonNegativeInt)(bouquetPrice + deliveryPrice);
        const paymentStatus = derivePaymentStatus(totalAmount, downPaymentAmount, additionalPayment);
        const deliveryAtRaw = (0, validation_1.normalizeString)(req.body?.deliveryAt, "", 40);
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
            ...(customerId ? { customerId } : {}),
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
        const id = (0, validation_1.normalizeString)(req.params?.id, "", 64);
        if (!id) {
            res.status(400).json({ message: "Missing id" });
            return;
        }
        const existing = await order_model_1.OrderModel.findById(id).lean().exec();
        if (!existing) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        const existingCustomerId = typeof existing.customerId === "string" ? existing.customerId.trim() : "";
        const setPatch = {};
        const unsetPatch = {};
        const customerId = (0, validation_1.normalizeString)(req.body?.customerId, "", 64);
        const customerIdProvided = req.body?.customerId !== undefined;
        let willHaveCustomerId = Boolean(existingCustomerId);
        if (customerIdProvided) {
            willHaveCustomerId = Boolean(customerId);
            if (!customerId) {
                unsetPatch.customerId = 1;
            }
            else {
                const customer = await customer_model_1.CustomerModel.findById(customerId).lean().exec();
                if (!customer) {
                    res.status(400).json({ message: "Invalid customerId" });
                    return;
                }
                setPatch.customerId = customerId;
                setPatch.buyerName = (0, validation_1.normalizeString)(customer.buyerName, "", 120);
                setPatch.phoneNumber = (0, validation_1.normalizeString)(customer.phoneNumber, "", 40);
                setPatch.address = (0, validation_1.normalizeString)(customer.address, "", 500);
            }
        }
        const buyerName = (0, validation_1.normalizeString)(req.body?.buyerName, "", 120);
        const phoneNumber = (0, validation_1.normalizeString)(req.body?.phoneNumber, "", 40);
        const address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
        const bouquetId = (0, validation_1.normalizeString)(req.body?.bouquetId, "", 64);
        const bouquetName = (0, validation_1.normalizeString)(req.body?.bouquetName, "", 200);
        // Keep buyer snapshot consistent with the linked customer.
        // To manually edit buyer fields, first unlink customerId (send customerId: "").
        if (!willHaveCustomerId) {
            if (buyerName)
                setPatch.buyerName = buyerName;
            if (phoneNumber)
                setPatch.phoneNumber = phoneNumber;
            if (address)
                setPatch.address = address;
        }
        if (bouquetId)
            setPatch.bouquetId = bouquetId;
        if (bouquetName)
            setPatch.bouquetName = bouquetName;
        const orderStatusRaw = (0, validation_1.normalizeString)(req.body?.orderStatus, "", 32);
        if (orderStatusRaw && isOrderStatus(orderStatusRaw))
            setPatch.orderStatus = orderStatusRaw;
        if (req.body?.paymentMethod !== undefined) {
            if (typeof req.body.paymentMethod !== "string") {
                res.status(400).json({ message: "Invalid paymentMethod" });
                return;
            }
            const paymentMethodRaw = (0, validation_1.normalizeString)(req.body.paymentMethod, "", 32);
            if (!isPaymentMethod(paymentMethodRaw)) {
                res.status(400).json({ message: "Invalid paymentMethod" });
                return;
            }
            setPatch.paymentMethod = paymentMethodRaw;
        }
        if (req.body?.downPaymentAmount !== undefined) {
            setPatch.downPaymentAmount = (0, validation_1.parseNonNegativeInt)(req.body.downPaymentAmount);
        }
        if (req.body?.additionalPayment !== undefined) {
            setPatch.additionalPayment = (0, validation_1.parseNonNegativeInt)(req.body.additionalPayment);
        }
        if (req.body?.deliveryPrice !== undefined) {
            setPatch.deliveryPrice = (0, validation_1.parseNonNegativeInt)(req.body.deliveryPrice);
        }
        if (req.body?.bouquetPrice !== undefined) {
            setPatch.bouquetPrice = (0, validation_1.parseNonNegativeInt)(req.body.bouquetPrice);
        }
        const hasDeliveryAt = req.body?.deliveryAt !== undefined;
        if (hasDeliveryAt) {
            if (typeof req.body.deliveryAt !== "string") {
                res.status(400).json({ message: "Invalid deliveryAt" });
                return;
            }
            const deliveryAtRaw = (0, validation_1.normalizeString)(req.body.deliveryAt, "", 40);
            if (!deliveryAtRaw) {
                unsetPatch.deliveryAt = 1;
            }
            else {
                const d = new Date(deliveryAtRaw);
                if (!Number.isFinite(d.getTime())) {
                    res.status(400).json({ message: "Invalid deliveryAt" });
                    return;
                }
                setPatch.deliveryAt = d;
            }
        }
        const nextBouquetId = (setPatch.bouquetId ?? existing.bouquetId);
        let nextBouquetName = (setPatch.bouquetName ?? existing.bouquetName ?? "");
        let nextBouquetPrice = (0, validation_1.parseNonNegativeInt)(setPatch.bouquetPrice !== undefined ? setPatch.bouquetPrice : existing.bouquetPrice);
        if (nextBouquetId && setPatch.bouquetId) {
            const fallbackName = nextBouquetName;
            const fallbackPrice = nextBouquetPrice;
            const snap = await resolveBouquetSnapshot(nextBouquetId, fallbackName, fallbackPrice);
            nextBouquetName = snap.bouquetName;
            nextBouquetPrice = snap.bouquetPrice;
            setPatch.bouquetName = snap.bouquetName;
            setPatch.bouquetPrice = snap.bouquetPrice;
        }
        const nextDownPayment = (0, validation_1.parseNonNegativeInt)(setPatch.downPaymentAmount !== undefined
            ? setPatch.downPaymentAmount
            : existing.downPaymentAmount);
        const nextAdditional = (0, validation_1.parseNonNegativeInt)(setPatch.additionalPayment !== undefined
            ? setPatch.additionalPayment
            : existing.additionalPayment);
        const nextDelivery = (0, validation_1.parseNonNegativeInt)(setPatch.deliveryPrice !== undefined ? setPatch.deliveryPrice : existing.deliveryPrice);
        const nextTotalAmount = (0, validation_1.parseNonNegativeInt)(nextBouquetPrice + nextDelivery);
        setPatch.totalAmount = nextTotalAmount;
        setPatch.paymentStatus = derivePaymentStatus(nextTotalAmount, nextDownPayment, nextAdditional);
        const nextOrderStatus = (setPatch.orderStatus ?? existing.orderStatus);
        const nextPaymentStatus = setPatch.paymentStatus;
        const nextPaymentMethod = (setPatch.paymentMethod ?? existing.paymentMethod ?? "");
        const prevOrderStatus = (existing.orderStatus ?? "bertanya");
        const prevPaymentStatus = (existing.paymentStatus ?? "belum_bayar");
        const prevPaymentMethod = (existing.paymentMethod ?? "");
        const prevDeliveryAt = existing.deliveryAt ? new Date(existing.deliveryAt) : null;
        const nextDeliveryAt = unsetPatch.deliveryAt
            ? null
            : setPatch.deliveryAt
                ? new Date(setPatch.deliveryAt)
                : prevDeliveryAt;
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
        if (hasDeliveryAt) {
            const prevT = prevDeliveryAt?.getTime() ?? 0;
            const nextT = nextDeliveryAt?.getTime() ?? 0;
            if (prevT !== nextT) {
                push("delivery", nextDeliveryAt ? "Waktu deliver diperbarui" : "Waktu deliver dihapus");
            }
        }
        if (setPatch.bouquetId) {
            push("bouquet", "Bouquet diperbarui");
        }
        if (setPatch.downPaymentAmount !== undefined ||
            setPatch.additionalPayment !== undefined ||
            setPatch.deliveryPrice !== undefined) {
            push("payment", "Nominal pembayaran/ongkir diperbarui");
        }
        if (!activity.length) {
            push("edit", "Order diperbarui");
        }
        setPatch.activity = activity.slice(-50);
        const updateOps = {};
        if (Object.keys(setPatch).length > 0)
            updateOps.$set = setPatch;
        if (Object.keys(unsetPatch).length > 0)
            updateOps.$unset = unsetPatch;
        const updated = await order_model_1.OrderModel.findByIdAndUpdate(id, updateOps, { new: true, runValidators: true })
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
        if (process.env.NODE_ENV === "development") {
            console.log(`[getOrders] Request: ${req.method} ${req.path}`, { query: req.query });
        }
        const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "100";
        const limitParsed = Number.parseInt(limitRaw, 10);
        // Allow up to 1000 for dashboard needs
        const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 1000) : 100;
        const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const q = qRaw.slice(0, 120);
        const filter = {};
        // If user is authenticated, check if they're a customer
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (userId && userRole === "customer") {
            // Customer can only see their own orders
            // Find customer by userId
            const customer = await customer_model_1.CustomerModel.findOne({ userId }).lean().exec();
            if (customer && customer._id) {
                filter.customerId = String(customer._id);
            }
            else {
                // If no customer profile exists, return empty array
                res.status(200).json([]);
                return;
            }
        }
        else if (userId && userRole === "admin") {
            // Admin can see all orders, optionally filter by search query
            if (q) {
                const re = new RegExp((0, validation_1.escapeRegex)(q), "i");
                filter.$or = [{ buyerName: re }, { phoneNumber: re }];
            }
        }
        else {
            // Unauthenticated or unknown role - return empty
            res.status(200).json([]);
            return;
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
        const id = (0, validation_1.normalizeString)(req.params?.id, "", 64);
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
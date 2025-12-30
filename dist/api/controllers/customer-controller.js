"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.createCustomer = createCustomer;
exports.getCustomerById = getCustomerById;
const customer_model_1 = require("../../models/customer-model");
const validation_1 = require("../../utils/validation");
async function getCustomers(req, res) {
    try {
        if (process.env.NODE_ENV === "development") {
            console.log(`[getCustomers] Request: ${req.method} ${req.path}`, { query: req.query });
        }
        const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "200";
        const limitParsed = Number.parseInt(limitRaw, 10);
        const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 500) : 200;
        const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
        const q = qRaw.slice(0, 120);
        const filter = {};
        if (q) {
            const re = new RegExp((0, validation_1.escapeRegex)(q), "i");
            filter.$or = [{ buyerName: re }, { phoneNumber: re }];
        }
        const customers = await customer_model_1.CustomerModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        if (process.env.NODE_ENV === "development") {
            console.log(`[getCustomers] Found ${customers.length} customers`);
        }
        res.status(200).json(customers);
    }
    catch (err) {
        console.error("getCustomers failed:", err);
        res.status(500).json({ message: "Failed to get customers", error: err instanceof Error ? err.message : "Unknown error" });
    }
}
async function createCustomer(req, res) {
    try {
        const buyerName = (0, validation_1.normalizeString)(req.body?.buyerName, "", 120);
        const phoneNumber = (0, validation_1.normalizeString)(req.body?.phoneNumber, "", 40);
        const address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
        if (process.env.NODE_ENV === "development") {
            console.log("[createCustomer] Request body:", { buyerName, phoneNumber, address: address?.substring(0, 50) + "..." });
        }
        if (!buyerName || !phoneNumber || !address) {
            const missing = [];
            if (!buyerName)
                missing.push("buyerName");
            if (!phoneNumber)
                missing.push("phoneNumber");
            if (!address)
                missing.push("address");
            res.status(400).json({ message: "Missing required fields", missing });
            return;
        }
        const existing = await customer_model_1.CustomerModel.findOne({ phoneNumber }).lean().exec();
        if (existing?._id) {
            if (process.env.NODE_ENV === "development") {
                console.log(`[createCustomer] Updating existing customer: ${existing._id}`);
            }
            const updated = await customer_model_1.CustomerModel.findByIdAndUpdate(existing._id, { $set: { buyerName, address } }, { new: true, runValidators: true })
                .lean()
                .exec();
            res.status(200).json(updated ?? existing);
            return;
        }
        if (process.env.NODE_ENV === "development") {
            console.log("[createCustomer] Creating new customer");
        }
        const created = await customer_model_1.CustomerModel.create({ buyerName, phoneNumber, address });
        res.status(201).json(created);
    }
    catch (err) {
        console.error("createCustomer failed:", err);
        if (err instanceof Error && err.message.includes("E11000")) {
            // Duplicate key error (MongoDB unique constraint)
            res.status(409).json({ message: "Customer with this phone number already exists" });
            return;
        }
        res.status(500).json({ message: "Failed to create customer", error: err instanceof Error ? err.message : "Unknown error" });
    }
}
async function getCustomerById(req, res) {
    try {
        const id = (0, validation_1.normalizeString)(req.params?.id, "", 64);
        if (!id) {
            res.status(400).json({ message: "Missing id" });
            return;
        }
        const customer = await customer_model_1.CustomerModel.findById(id).lean().exec();
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json(customer);
    }
    catch (err) {
        console.error("getCustomerById failed:", err);
        res.status(500).json({ message: "Failed to get customer" });
    }
}
//# sourceMappingURL=customer-controller.js.map
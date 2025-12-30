"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerProfile = getCustomerProfile;
exports.updateCustomerProfile = updateCustomerProfile;
const user_model_1 = require("../../models/user-model");
const customer_model_1 = require("../../models/customer-model");
const validation_1 = require("../../utils/validation");
/**
 * Get customer profile
 * GET /api/customer/profile
 */
async function getCustomerProfile(req, res) {
    try {
        // Get user from token (set by auth middleware)
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = await user_model_1.UserModel.findById(userId)
            .select({ username: 1, email: 1, role: 1 })
            .lean()
            .exec();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Get customer data by userId first, then fallback to email/phoneNumber
        let customer = await customer_model_1.CustomerModel.findOne({ userId }).lean().exec();
        if (!customer) {
            // Fallback: try to find by email/phoneNumber for backward compatibility
            customer = await customer_model_1.CustomerModel.findOne({ phoneNumber: user.email })
                .lean()
                .exec();
            // If found by phoneNumber, update to link userId
            if (customer) {
                await customer_model_1.CustomerModel.findByIdAndUpdate(customer._id, { userId }).exec();
            }
        }
        res.json({
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: customer?.buyerName || "",
            phoneNumber: customer?.phoneNumber || "",
            address: customer?.address || "",
        });
    }
    catch (err) {
        console.error("getCustomerProfile failed:", err);
        res.status(500).json({ error: "Failed to get profile" });
    }
}
/**
 * Update customer profile
 * PATCH /api/customer/profile
 */
async function updateCustomerProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const fullName = (0, validation_1.normalizeString)(req.body?.fullName, "", 120);
        const phoneNumber = (0, validation_1.normalizeString)(req.body?.phoneNumber, "", 40);
        const address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
        // Update or create customer record
        if (phoneNumber) {
            // Try to find by userId first
            let customer = await customer_model_1.CustomerModel.findOne({ userId }).exec();
            if (!customer) {
                // Fallback: try by phoneNumber
                customer = await customer_model_1.CustomerModel.findOne({ phoneNumber }).exec();
            }
            if (customer) {
                // Update existing
                if (fullName)
                    customer.buyerName = fullName;
                if (address)
                    customer.address = address;
                if (!customer.userId)
                    customer.userId = userId;
                await customer.save();
            }
            else {
                // Create new
                customer = await customer_model_1.CustomerModel.create({
                    buyerName: fullName || "",
                    phoneNumber,
                    address: address || "",
                    userId,
                });
            }
            res.json({
                message: "Profile updated successfully",
                profile: {
                    fullName: customer.buyerName,
                    phoneNumber: customer.phoneNumber,
                    address: customer.address,
                },
            });
        }
        else {
            res.status(400).json({ error: "Phone number is required" });
        }
    }
    catch (err) {
        console.error("updateCustomerProfile failed:", err);
        res.status(500).json({ error: "Failed to update profile" });
    }
}
//# sourceMappingURL=customer-profile-controller.js.map
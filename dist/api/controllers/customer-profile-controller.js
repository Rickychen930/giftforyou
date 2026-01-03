"use strict";
/**
 * Customer Profile Controller
 * Backend API controller for managing customer profiles
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerProfile = exports.getCustomerProfile = void 0;
const user_model_1 = require("../../models/user-model");
const customer_model_1 = require("../../models/customer-model");
const validation_1 = require("../../utils/validation");
const BaseApiController_1 = require("./base/BaseApiController");
/**
 * Customer Profile Controller Class
 * Manages all customer profile-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const customerProfileController = new (class extends BaseApiController_1.BaseApiController {
    /**
     * Get customer profile
     * GET /api/customer/profile
     */
    async getCustomerProfile(req, res) {
        try {
            // Get user from token (set by auth middleware)
            const userId = req.user?.id;
            if (!userId) {
                this.sendForbidden(res, "Unauthorized");
                return;
            }
            const user = await user_model_1.UserModel.findById(userId)
                .select({ username: 1, email: 1, role: 1 })
                .lean()
                .exec();
            if (!user) {
                this.sendNotFound(res, "User not found");
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
            this.sendSuccess(res, {
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: customer?.buyerName || "",
                phoneNumber: customer?.phoneNumber || "",
                address: customer?.address || "",
            }, "Profile retrieved successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to get profile"), 500);
        }
    }
    /**
     * Update customer profile
     * PATCH /api/customer/profile
     */
    async updateCustomerProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                this.sendForbidden(res, "Unauthorized");
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
                this.sendSuccess(res, {
                    profile: {
                        fullName: customer.buyerName,
                        phoneNumber: customer.phoneNumber,
                        address: customer.address,
                    },
                }, "Profile updated successfully");
            }
            else {
                this.sendBadRequest(res, "Phone number is required");
            }
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to update profile"), 500);
        }
    }
})();
// Export functions for backward compatibility
exports.getCustomerProfile = customerProfileController.getCustomerProfile.bind(customerProfileController);
exports.updateCustomerProfile = customerProfileController.updateCustomerProfile.bind(customerProfileController);
//# sourceMappingURL=customer-profile-controller.js.map
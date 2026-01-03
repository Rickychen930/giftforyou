"use strict";
/**
 * Customer Addresses Controller
 * Backend API controller for managing customer addresses
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteCustomerAddress = exports.updateCustomerAddress = exports.createCustomerAddress = exports.getCustomerAddresses = void 0;
const customer_model_1 = require("../../models/customer-model");
const validation_1 = require("../../utils/validation");
const BaseApiController_1 = require("./base/BaseApiController");
/**
 * Customer Addresses Controller Class
 * Manages all customer address-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const customerAddressesController = new (class extends BaseApiController_1.BaseApiController {
    /**
     * Get customer addresses
     * GET /api/customer/addresses
     */
    async getCustomerAddresses(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                this.sendForbidden(res, "Unauthorized");
                return;
            }
            // Find customer by userId
            const customer = await customer_model_1.CustomerModel.findOne({ userId }).lean().exec();
            if (!customer) {
                this.sendSuccess(res, { addresses: [] }, "Addresses retrieved successfully");
                return;
            }
            // Return addresses array or empty array
            const addresses = customer.addresses || [];
            this.sendSuccess(res, { addresses }, "Addresses retrieved successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to get addresses"), 500);
        }
    }
    /**
     * Create customer address
     * POST /api/customer/addresses
     */
    async createCustomerAddress(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                this.sendForbidden(res, "Unauthorized");
                return;
            }
            const label = (0, validation_1.normalizeString)(req.body?.label, "", 50);
            const address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
            const isDefault = Boolean(req.body?.isDefault);
            if (!label || !address) {
                this.sendBadRequest(res, "Label and address are required");
                return;
            }
            // Find or create customer
            let customer = await customer_model_1.CustomerModel.findOne({ userId }).exec();
            if (!customer) {
                // Create new customer record
                customer = await customer_model_1.CustomerModel.create({
                    buyerName: "",
                    phoneNumber: "",
                    address: "",
                    addresses: [],
                    userId,
                });
            }
            // If setting as default, unset other defaults
            if (isDefault && customer.addresses) {
                customer.addresses.forEach((addr) => {
                    addr.isDefault = false;
                });
            }
            // Add new address
            const newAddress = {
                label,
                address,
                isDefault: isDefault || (customer.addresses?.length === 0),
            };
            if (!customer.addresses) {
                customer.addresses = [];
            }
            customer.addresses.push(newAddress);
            // Update main address if this is default
            if (isDefault) {
                customer.address = address;
            }
            await customer.save();
            this.sendSuccess(res, { address: newAddress }, "Address created successfully", 201);
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to create address"), 500);
        }
    }
    /**
     * Update customer address
     * PATCH /api/customer/addresses/:id
     */
    async updateCustomerAddress(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params?.id;
            if (!userId || !addressId) {
                this.sendBadRequest(res, "Missing required parameters");
                return;
            }
            const customer = await customer_model_1.CustomerModel.findOne({ userId }).exec();
            if (!customer || !customer.addresses) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            const addressIndex = customer.addresses.findIndex((addr) => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            const label = (0, validation_1.normalizeString)(req.body?.label, "", 50);
            const address = (0, validation_1.normalizeString)(req.body?.address, "", 500);
            const isDefault = Boolean(req.body?.isDefault);
            if (label)
                customer.addresses[addressIndex].label = label;
            if (address)
                customer.addresses[addressIndex].address = address;
            // If setting as default, unset other defaults
            if (isDefault) {
                customer.addresses.forEach((addr, idx) => {
                    if (idx !== addressIndex) {
                        addr.isDefault = false;
                    }
                });
                customer.addresses[addressIndex].isDefault = true;
                customer.address = address;
            }
            await customer.save();
            this.sendSuccess(res, { address: customer.addresses[addressIndex] }, "Address updated successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to update address"), 500);
        }
    }
    /**
     * Delete customer address
     * DELETE /api/customer/addresses/:id
     */
    async deleteCustomerAddress(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params?.id;
            if (!userId || !addressId) {
                this.sendBadRequest(res, "Missing required parameters");
                return;
            }
            const customer = await customer_model_1.CustomerModel.findOne({ userId }).exec();
            if (!customer || !customer.addresses) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            const addressIndex = customer.addresses.findIndex((addr) => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            const wasDefault = customer.addresses[addressIndex].isDefault;
            customer.addresses.splice(addressIndex, 1);
            // If deleted address was default, set first address as default
            if (wasDefault && customer.addresses.length > 0) {
                customer.addresses[0].isDefault = true;
                customer.address = customer.addresses[0].address;
            }
            else if (customer.addresses.length === 0) {
                customer.address = "";
            }
            await customer.save();
            this.sendSuccess(res, {}, "Address deleted successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to delete address"), 500);
        }
    }
    /**
     * Set default address
     * PATCH /api/customer/addresses/:id/set-default
     */
    async setDefaultAddress(req, res) {
        try {
            const userId = req.user?.id;
            const addressId = req.params?.id;
            if (!userId || !addressId) {
                this.sendBadRequest(res, "Missing required parameters");
                return;
            }
            const customer = await customer_model_1.CustomerModel.findOne({ userId }).exec();
            if (!customer || !customer.addresses) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            const addressIndex = customer.addresses.findIndex((addr) => addr._id?.toString() === addressId);
            if (addressIndex === -1) {
                this.sendNotFound(res, "Address not found");
                return;
            }
            // Unset all defaults
            customer.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
            // Set this address as default
            customer.addresses[addressIndex].isDefault = true;
            customer.address = customer.addresses[addressIndex].address;
            await customer.save();
            this.sendSuccess(res, { address: customer.addresses[addressIndex] }, "Default address updated successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to set default address"), 500);
        }
    }
})();
// Export functions for backward compatibility
exports.getCustomerAddresses = customerAddressesController.getCustomerAddresses.bind(customerAddressesController);
exports.createCustomerAddress = customerAddressesController.createCustomerAddress.bind(customerAddressesController);
exports.updateCustomerAddress = customerAddressesController.updateCustomerAddress.bind(customerAddressesController);
exports.deleteCustomerAddress = customerAddressesController.deleteCustomerAddress.bind(customerAddressesController);
exports.setDefaultAddress = customerAddressesController.setDefaultAddress.bind(customerAddressesController);
//# sourceMappingURL=customer-addresses-controller.js.map
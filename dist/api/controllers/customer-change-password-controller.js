"use strict";
/**
 * Customer Change Password Controller
 * Backend API controller for managing customer password changes
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCustomerPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../../models/user-model");
const input_validation_1 = require("../middleware/input-validation");
const BaseApiController_1 = require("./base/BaseApiController");
/**
 * Customer Change Password Controller Class
 * Manages customer password change API endpoint
 * Extends BaseApiController to avoid code duplication
 */
const customerChangePasswordController = new (class extends BaseApiController_1.BaseApiController {
    /**
     * Change customer password
     * POST /api/customer/change-password
     */
    async changeCustomerPassword(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                this.sendForbidden(res, "Unauthorized");
                return;
            }
            const currentPassword = (0, input_validation_1.sanitizeString)(req.body?.currentPassword);
            const newPassword = (0, input_validation_1.sanitizeString)(req.body?.newPassword);
            if (!currentPassword || !newPassword) {
                this.sendBadRequest(res, "Current password and new password are required");
                return;
            }
            if (newPassword.length < 8) {
                this.sendBadRequest(res, "New password must be at least 8 characters");
                return;
            }
            // Find user
            const user = await user_model_1.UserModel.findById(userId).exec();
            if (!user) {
                this.sendNotFound(res, "User not found");
                return;
            }
            // Verify current password
            const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!valid) {
                this.sendForbidden(res, "Current password is incorrect");
                return;
            }
            // Check if new password is same as current
            const samePassword = await bcryptjs_1.default.compare(newPassword, user.password);
            if (samePassword) {
                this.sendBadRequest(res, "New password must be different from current password");
                return;
            }
            // Hash new password
            const hashed = await bcryptjs_1.default.hash(newPassword, 12);
            // Update password
            user.password = hashed;
            await user.save();
            this.sendSuccess(res, {}, "Password changed successfully");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to change password"), 500);
        }
    }
})();
// Export function for backward compatibility
exports.changeCustomerPassword = customerChangePasswordController.changeCustomerPassword.bind(customerChangePasswordController);
//# sourceMappingURL=customer-change-password-controller.js.map
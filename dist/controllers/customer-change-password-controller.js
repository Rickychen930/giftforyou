"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeCustomerPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user-model");
const input_validation_1 = require("../middleware/input-validation");
/**
 * Change customer password
 * POST /api/customer/change-password
 */
async function changeCustomerPassword(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const currentPassword = (0, input_validation_1.sanitizeString)(req.body?.currentPassword);
        const newPassword = (0, input_validation_1.sanitizeString)(req.body?.newPassword);
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: "Current password and new password are required" });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({ error: "New password must be at least 8 characters" });
            return;
        }
        // Find user
        const user = await user_model_1.UserModel.findById(userId).exec();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Verify current password
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid) {
            res.status(401).json({ error: "Current password is incorrect" });
            return;
        }
        // Check if new password is same as current
        const samePassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (samePassword) {
            res.status(400).json({ error: "New password must be different from current password" });
            return;
        }
        // Hash new password
        const hashed = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password
        user.password = hashed;
        await user.save();
        res.json({ message: "Password changed successfully" });
    }
    catch (err) {
        console.error("changeCustomerPassword failed:", err);
        res.status(500).json({ error: "Failed to change password" });
    }
}
exports.changeCustomerPassword = changeCustomerPassword;
//# sourceMappingURL=customer-change-password-controller.js.map
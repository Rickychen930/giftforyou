/**
 * Customer Change Password Controller
 * Backend API controller for managing customer password changes
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/user-model";
import { sanitizeString } from "../middleware/input-validation";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Customer Change Password Controller Class
 * Manages customer password change API endpoint
 * Extends BaseApiController to avoid code duplication
 */
const customerChangePasswordController = new (class extends BaseApiController {
  /**
   * Change customer password
   * POST /api/customer/change-password
   */
  async changeCustomerPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        this.sendForbidden(res, "Unauthorized");
        return;
      }

      const currentPassword = sanitizeString(req.body?.currentPassword);
      const newPassword = sanitizeString(req.body?.newPassword);

      if (!currentPassword || !newPassword) {
        this.sendBadRequest(res, "Current password and new password are required");
        return;
      }

      if (newPassword.length < 8) {
        this.sendBadRequest(res, "New password must be at least 8 characters");
        return;
      }

      // Find user
      const user = await UserModel.findById(userId).exec();
      if (!user) {
        this.sendNotFound(res, "User not found");
        return;
      }

      // Verify current password
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        this.sendForbidden(res, "Current password is incorrect");
        return;
      }

      // Check if new password is same as current
      const samePassword = await bcrypt.compare(newPassword, user.password);
      if (samePassword) {
        this.sendBadRequest(res, "New password must be different from current password");
        return;
      }

      // Hash new password
      const hashed = await bcrypt.hash(newPassword, 12);

      // Update password
      user.password = hashed;
      await user.save();

      this.sendSuccess(res, {}, "Password changed successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to change password"), 500);
    }
  }
})();

// Export function for backward compatibility
export const changeCustomerPassword = customerChangePasswordController.changeCustomerPassword.bind(customerChangePasswordController);


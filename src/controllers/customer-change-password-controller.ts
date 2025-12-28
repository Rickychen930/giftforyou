import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user-model";
import { sanitizeString } from "../middleware/input-validation";

/**
 * Change customer password
 * POST /api/customer/change-password
 */
export async function changeCustomerPassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const currentPassword = sanitizeString(req.body?.currentPassword);
    const newPassword = sanitizeString(req.body?.newPassword);

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Current password and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    // Find user
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    // Check if new password is same as current
    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      res.status(400).json({ error: "New password must be different from current password" });
      return;
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update password
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changeCustomerPassword failed:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
}


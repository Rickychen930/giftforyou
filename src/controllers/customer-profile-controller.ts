import type { Request, Response } from "express";
import { UserModel } from "../models/user-model";
import { CustomerModel } from "../models/customer-model";
import { normalizeString } from "../utils/validation";

/**
 * Get customer profile
 * GET /api/customer/profile
 */
export async function getCustomerProfile(req: Request, res: Response): Promise<void> {
  try {
    // Get user from token (set by auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await UserModel.findById(userId)
      .select({ username: 1, email: 1, role: 1 })
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get customer data by userId first, then fallback to email/phoneNumber
    let customer = await CustomerModel.findOne({ userId }).lean().exec();
    
    if (!customer) {
      // Fallback: try to find by email/phoneNumber for backward compatibility
      customer = await CustomerModel.findOne({ phoneNumber: user.email })
        .lean()
        .exec();
      
      // If found by phoneNumber, update to link userId
      if (customer) {
        await CustomerModel.findByIdAndUpdate(customer._id, { userId }).exec();
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
  } catch (err) {
    console.error("getCustomerProfile failed:", err);
    res.status(500).json({ error: "Failed to get profile" });
  }
}

/**
 * Update customer profile
 * PATCH /api/customer/profile
 */
export async function updateCustomerProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const fullName = normalizeString(req.body?.fullName, "", 120);
    const phoneNumber = normalizeString(req.body?.phoneNumber, "", 40);
    const address = normalizeString(req.body?.address, "", 500);

    // Update or create customer record
    if (phoneNumber) {
      // Try to find by userId first
      let customer = await CustomerModel.findOne({ userId }).exec();
      
      if (!customer) {
        // Fallback: try by phoneNumber
        customer = await CustomerModel.findOne({ phoneNumber }).exec();
      }
      
      if (customer) {
        // Update existing
        if (fullName) customer.buyerName = fullName;
        if (address) customer.address = address;
        if (!customer.userId) customer.userId = userId;
        await customer.save();
      } else {
        // Create new
        customer = await CustomerModel.create({
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
    } else {
      res.status(400).json({ error: "Phone number is required" });
    }
  } catch (err) {
    console.error("updateCustomerProfile failed:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
}


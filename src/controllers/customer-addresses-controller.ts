import type { Request, Response } from "express";
import { CustomerModel, IAddress } from "../models/customer-model";
import { normalizeString } from "../utils/validation";

/**
 * Get customer addresses
 * GET /api/customer/addresses
 */
export async function getCustomerAddresses(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Find customer by userId
    const customer = await CustomerModel.findOne({ userId }).lean().exec();

    if (!customer) {
      res.json({ addresses: [] });
      return;
    }

    // Return addresses array or empty array
    const addresses = customer.addresses || [];
    res.json({ addresses });
  } catch (err) {
    console.error("getCustomerAddresses failed:", err);
    res.status(500).json({ error: "Failed to get addresses" });
  }
}

/**
 * Create customer address
 * POST /api/customer/addresses
 */
export async function createCustomerAddress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const label = normalizeString(req.body?.label, "", 50);
    const address = normalizeString(req.body?.address, "", 500);
    const isDefault = Boolean(req.body?.isDefault);

    if (!label || !address) {
      res.status(400).json({ error: "Label and address are required" });
      return;
    }

    // Find or create customer
    let customer = await CustomerModel.findOne({ userId }).exec();

    if (!customer) {
      // Create new customer record
      customer = await CustomerModel.create({
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
    const newAddress: IAddress = {
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

    res.status(201).json({
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (err) {
    console.error("createCustomerAddress failed:", err);
    res.status(500).json({ error: "Failed to create address" });
  }
}

/**
 * Update customer address
 * PATCH /api/customer/addresses/:id
 */
export async function updateCustomerAddress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const addressId = req.params?.id;

    if (!userId || !addressId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const customer = await CustomerModel.findOne({ userId }).exec();
    if (!customer || !customer.addresses) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const addressIndex = customer.addresses.findIndex(
      (addr) => (addr as any)._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const label = normalizeString(req.body?.label, "", 50);
    const address = normalizeString(req.body?.address, "", 500);
    const isDefault = Boolean(req.body?.isDefault);

    if (label) customer.addresses[addressIndex].label = label;
    if (address) customer.addresses[addressIndex].address = address;

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

    res.json({
      message: "Address updated successfully",
      address: customer.addresses[addressIndex],
    });
  } catch (err) {
    console.error("updateCustomerAddress failed:", err);
    res.status(500).json({ error: "Failed to update address" });
  }
}

/**
 * Delete customer address
 * DELETE /api/customer/addresses/:id
 */
export async function deleteCustomerAddress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const addressId = req.params?.id;

    if (!userId || !addressId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const customer = await CustomerModel.findOne({ userId }).exec();
    if (!customer || !customer.addresses) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const addressIndex = customer.addresses.findIndex(
      (addr) => (addr as any)._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const wasDefault = customer.addresses[addressIndex].isDefault;
    customer.addresses.splice(addressIndex, 1);

    // If deleted address was default, set first address as default
    if (wasDefault && customer.addresses.length > 0) {
      customer.addresses[0].isDefault = true;
      customer.address = customer.addresses[0].address;
    } else if (customer.addresses.length === 0) {
      customer.address = "";
    }

    await customer.save();

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("deleteCustomerAddress failed:", err);
    res.status(500).json({ error: "Failed to delete address" });
  }
}

/**
 * Set default address
 * PATCH /api/customer/addresses/:id/set-default
 */
export async function setDefaultAddress(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const addressId = req.params?.id;

    if (!userId || !addressId) {
      res.status(400).json({ error: "Missing required parameters" });
      return;
    }

    const customer = await CustomerModel.findOne({ userId }).exec();
    if (!customer || !customer.addresses) {
      res.status(404).json({ error: "Address not found" });
      return;
    }

    const addressIndex = customer.addresses.findIndex(
      (addr) => (addr as any)._id?.toString() === addressId
    );

    if (addressIndex === -1) {
      res.status(404).json({ error: "Address not found" });
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

    res.json({
      message: "Default address updated successfully",
      address: customer.addresses[addressIndex],
    });
  } catch (err) {
    console.error("setDefaultAddress failed:", err);
    res.status(500).json({ error: "Failed to set default address" });
  }
}


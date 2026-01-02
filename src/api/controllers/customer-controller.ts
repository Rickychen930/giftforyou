/**
 * Customer Controller
 * Backend API controller for managing customers
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";
import { CustomerModel } from "../../models/customer-model";
import { escapeRegex, normalizeString } from "../../utils/validation";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Customer Controller Class
 * Manages all customer-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const customerController = new (class extends BaseApiController {
  async getCustomers(req: Request, res: Response): Promise<void> {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log(`[getCustomers] Request: ${req.method} ${req.path}`, { query: req.query });
    }

    const limitRaw = typeof req.query.limit === "string" ? req.query.limit : "200";
    const limitParsed = Number.parseInt(limitRaw, 10);
    const limit = Number.isFinite(limitParsed) ? Math.min(Math.max(limitParsed, 1), 500) : 200;

    const qRaw = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const q = qRaw.slice(0, 120);

    const filter: any = {};
    if (q) {
      const re = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ buyerName: re }, { phoneNumber: re }];
    }

    const customers = await CustomerModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    if (process.env.NODE_ENV === "development") {
      console.log(`[getCustomers] Found ${customers.length} customers`);
    }

    this.sendSuccess(res, customers, "Customers retrieved successfully");
  } catch (err) {
    this.sendError(res, err instanceof Error ? err : new Error("Failed to get customers"), 500);
  }
}

  async createCustomer(req: Request, res: Response): Promise<void> {
  try {
    const buyerName = normalizeString(req.body?.buyerName, "", 120);
    const phoneNumber = normalizeString(req.body?.phoneNumber, "", 40);
    const address = normalizeString(req.body?.address, "", 500);

    if (process.env.NODE_ENV === "development") {
      console.log("[createCustomer] Request body:", { buyerName, phoneNumber, address: address?.substring(0, 50) + "..." });
    }

    if (!buyerName || !phoneNumber || !address) {
      const missing = [];
      if (!buyerName) missing.push("buyerName");
      if (!phoneNumber) missing.push("phoneNumber");
      if (!address) missing.push("address");
      this.sendBadRequest(res, `Missing required fields: ${missing.join(", ")}`);
      return;
    }

    const existing = await CustomerModel.findOne({ phoneNumber }).lean().exec();
    if (existing?._id) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[createCustomer] Updating existing customer: ${existing._id}`);
      }
      const updated = await CustomerModel.findByIdAndUpdate(
        existing._id,
        { $set: { buyerName, address } },
        { new: true, runValidators: true }
      )
        .lean()
        .exec();

      this.sendSuccess(res, updated ?? existing, "Customer updated successfully");
      return;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[createCustomer] Creating new customer");
    }
    const created = await CustomerModel.create({ buyerName, phoneNumber, address });
    this.sendSuccess(res, created, "Customer created successfully", 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes("E11000")) {
      // Duplicate key error (MongoDB unique constraint)
      const errorMessage = this.formatUserFriendlyError("Customer with this phone number already exists");
      this.sendError(res, new Error(errorMessage), 409);
      return;
    }
    this.sendError(res, err instanceof Error ? err : new Error("Failed to create customer"), 500);
  }
}

  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const id = normalizeString(req.params?.id, "", 64);
      if (!id) {
        this.sendBadRequest(res, "Missing id");
        return;
      }

      const customer = await CustomerModel.findById(id).lean().exec();
      if (!customer) {
        this.sendNotFound(res, "Customer not found");
        return;
      }

      this.sendSuccess(res, customer, "Customer retrieved successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to get customer"), 500);
    }
  }
})();

// Export functions for backward compatibility
export const getCustomers = customerController.getCustomers.bind(customerController);
export const createCustomer = customerController.createCustomer.bind(customerController);
export const getCustomerById = customerController.getCustomerById.bind(customerController);

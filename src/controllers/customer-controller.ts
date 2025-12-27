import type { Request, Response } from "express";
import { CustomerModel } from "../models/customer-model";
import { escapeRegex, normalizeString } from "../utils/validation";

export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
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

    res.status(200).json(customers);
  } catch (err) {
    console.error("getCustomers failed:", err);
    res.status(500).json({ message: "Failed to get customers" });
  }
}

export async function createCustomer(req: Request, res: Response): Promise<void> {
  try {
    const buyerName = normalizeString(req.body?.buyerName, "", 120);
    const phoneNumber = normalizeString(req.body?.phoneNumber, "", 40);
    const address = normalizeString(req.body?.address, "", 500);

    if (!buyerName || !phoneNumber || !address) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existing = await CustomerModel.findOne({ phoneNumber }).lean().exec();
    if (existing?._id) {
      const updated = await CustomerModel.findByIdAndUpdate(
        existing._id,
        { $set: { buyerName, address } },
        { new: true, runValidators: true }
      )
        .lean()
        .exec();

      res.status(200).json(updated ?? existing);
      return;
    }

    const created = await CustomerModel.create({ buyerName, phoneNumber, address });
    res.status(201).json(created);
  } catch (err) {
    console.error("createCustomer failed:", err);
    res.status(500).json({ message: "Failed to create customer" });
  }
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  try {
    const id = normalizeString(req.params?.id, "", 64);
    if (!id) {
      res.status(400).json({ message: "Missing id" });
      return;
    }

    const customer = await CustomerModel.findById(id).lean().exec();
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(200).json(customer);
  } catch (err) {
    console.error("getCustomerById failed:", err);
    res.status(500).json({ message: "Failed to get customer" });
  }
}

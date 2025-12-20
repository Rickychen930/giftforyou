import type { Request, Response } from "express";

import { BouquetModel } from "../models/bouquet-model";
import { CollectionModel } from "../models/collection-model";

type BouquetStatus = "ready" | "preorder";

const isValidStatus = (status: unknown): status is BouquetStatus =>
  status === "ready" || status === "preorder";

const normalizeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const parsePrice = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const validateBouquetInput = (
  name: string,
  price: number,
  status: BouquetStatus
) => {
  if (!name || name.length < 2) return "Name must be at least 2 characters.";
  if (!Number.isFinite(price) || price <= 0)
    return "Price must be greater than 0.";
  if (!isValidStatus(status)) return "Invalid status.";
  return null;
};

/**
 * Sync bouquet id with collections:
 * - Remove from old collection if changed
 * - Add to new collection (create if not exists)
 */
const syncBouquetCollection = async (
  bouquetId: string,
  oldCollectionName?: string,
  newCollectionName?: string
) => {
  const oldName = normalizeString(oldCollectionName);
  const newName = normalizeString(newCollectionName);

  // remove from old collection if different
  if (oldName && oldName !== newName) {
    await CollectionModel.updateOne(
      { name: oldName },
      { $pull: { bouquets: bouquetId } }
    ).exec();
  }

  // add to new collection
  if (newName) {
    await CollectionModel.findOneAndUpdate(
      { name: newName },
      { $addToSet: { bouquets: bouquetId } },
      { upsert: true, new: true }
    ).exec();
  }
};

// ✅ Create bouquet
export const createBouquet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const name = normalizeString(req.body.name);
    const description = normalizeString(req.body.description);
    const type = normalizeString(req.body.type);
    const size = normalizeString(req.body.size);
    const collectionName = normalizeString(req.body.collectionName);

    const status: BouquetStatus = isValidStatus(req.body.status)
      ? req.body.status
      : "ready";
    const price = parsePrice(req.body.price);

    const error = validateBouquetInput(name, price, status);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const bouquet = await BouquetModel.create({
      name,
      description,
      price,
      type,
      size,
      image,
      status,
      collectionName,

      // if your schema requires these:
      occasions: [],
      flowers: [],
      isNewEdition: false,
      isFeatured: false,
    });

    // ✅ FIX: removed extra comma
    await syncBouquetCollection(String(bouquet._id), undefined, collectionName);

    res.status(201).json({ message: "Bouquet created successfully", bouquet });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Failed to create bouquet:", message);
    res.status(500).json({ error: "Failed to create bouquet" });
  }
};

// ✅ Get all bouquets
export const getBouquets = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const bouquets = await BouquetModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    res.status(200).json(bouquets);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Failed to fetch bouquets:", message);
    res.status(500).json({ error: "Failed to fetch bouquets" });
  }
};

// ✅ Update bouquet
export const updateBouquet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const bouquet = await BouquetModel.findById(id).exec();
    if (!bouquet) {
      res.status(404).json({ error: "Bouquet not found" });
      return;
    }

    const oldCollectionName = bouquet.collectionName;

    // Build updates safely (no "any" needed)
    const updates: Record<string, unknown> = {};

    if (req.body.name !== undefined)
      updates.name = normalizeString(req.body.name);
    if (req.body.description !== undefined)
      updates.description = normalizeString(req.body.description);
    if (req.body.type !== undefined)
      updates.type = normalizeString(req.body.type);
    if (req.body.size !== undefined)
      updates.size = normalizeString(req.body.size);
    if (req.body.collectionName !== undefined)
      updates.collectionName = normalizeString(req.body.collectionName);

    if (req.body.status !== undefined) {
      if (!isValidStatus(req.body.status)) {
        res.status(400).json({ error: "Invalid status." });
        return;
      }
      updates.status = req.body.status;
    }

    if (req.body.price !== undefined) {
      const price = parsePrice(req.body.price);
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ error: "Price must be greater than 0." });
        return;
      }
      updates.price = price;
    }

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    // Apply updates
    Object.assign(bouquet, updates);
    await bouquet.save();

    await syncBouquetCollection(
      String(bouquet._id),
      oldCollectionName,
      bouquet.collectionName
    );

    res.status(200).json({ message: "Bouquet updated successfully", bouquet });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Update bouquet failed:", message);
    res.status(500).json({ error: "Failed to update bouquet" });
  }
};

// ✅ Delete bouquet
export const deleteBouquet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const bouquet = await BouquetModel.findByIdAndDelete(id).exec();
    if (!bouquet) {
      res.status(404).json({ error: "Bouquet not found" });
      return;
    }

    const collectionName = normalizeString(bouquet.collectionName);
    if (collectionName) {
      await CollectionModel.updateOne(
        { name: collectionName },
        { $pull: { bouquets: String(bouquet._id) } }
      ).exec();
    }

    res.status(200).json({ message: "Bouquet deleted successfully", bouquet });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Delete bouquet failed:", message);
    res.status(500).json({ error: "Failed to delete bouquet" });
  }
};

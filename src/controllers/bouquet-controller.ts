import type { Request, Response } from "express";
import { BouquetModel } from "../models/bouquet-model";
import { CollectionModel } from "../models/collection-model";
import { saveUploadedImage } from "../middleware/upload"; // ✅ IMPORTANT

type BouquetStatus = "ready" | "preorder";

const isValidStatus = (status: unknown): status is BouquetStatus =>
  status === "ready" || status === "preorder";

const normalizeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const parsePrice = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
};

const parseNonNegativeInt = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
};

const parseCsvList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  // Support both comma-separated and newline-separated input.
  return value
    .split(/[\n,]/g)
    .map((v) => v.trim())
    .filter(Boolean);
};

const normalizeSize = (value: unknown): string => {
  const raw = normalizeString(value);
  if (!raw) return "";

  const v = raw.toLowerCase();
  if (v === "extra-small" || v === "extra small" || v === "xs" || v === "xsmall")
    return "Extra-Small";
  if (v === "small") return "Small";
  if (v === "medium") return "Medium";
  if (v === "large") return "Large";
  if (v === "extra-large" || v === "extra large" || v === "x-large")
    return "Extra-Large";
  if (v === "jumbo" || v === "xl" || v === "xxl") return "Jumbo";

  return raw;
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

const syncBouquetCollection = async (
  bouquetId: string,
  oldCollectionName?: string,
  newCollectionName?: string
) => {
  const oldName = normalizeString(oldCollectionName);
  const newName = normalizeString(newCollectionName);

  if (oldName && oldName !== newName) {
    await CollectionModel.updateOne(
      { name: oldName },
      { $pull: { bouquets: bouquetId } }
    ).exec();
  }

  if (newName) {
    await CollectionModel.findOneAndUpdate(
      { name: newName },
      { $addToSet: { bouquets: bouquetId } },
      { upsert: true, new: true }
    ).exec();
  }
};

// ✅ Get bouquet by id
export const getBouquetById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bouquet = await BouquetModel.findById(req.params.id).lean().exec();
    if (!bouquet) {
      res.status(404).json({ error: "Bouquet not found" });
      return;
    }
    res.status(200).json(bouquet);
  } catch {
    res.status(400).json({ error: "Invalid bouquet id" });
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
    const type = normalizeString(req.body.type) || "bouquet";
    const size = normalizeSize(req.body.size) || "Medium";
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

    // ✅ FIX: memoryStorage => use saveUploadedImage (not req.file.filename)
    const image = req.file ? await saveUploadedImage(req.file) : "";

    const occasions = parseCsvList(req.body.occasions);
    const flowers = parseCsvList(req.body.flowers);
    const isNewEdition = parseBoolean(req.body.isNewEdition);
    const isFeatured = parseBoolean(req.body.isFeatured);
    const quantity = parseNonNegativeInt(req.body.quantity);
    const careInstructions = normalizeString(req.body.careInstructions);

    const bouquet = await BouquetModel.create({
      name,
      description,
      price,
      type,
      size,
      image,
      status,
      collectionName,
      occasions,
      flowers,
      isNewEdition,
      isFeatured,
      quantity,
      careInstructions,
    });

    // ✅ FIX: removed broken ", ,"
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

    const updates: Record<string, unknown> = {};

    if (req.body.name !== undefined)
      updates.name = normalizeString(req.body.name);
    if (req.body.description !== undefined)
      updates.description = normalizeString(req.body.description);
    if (req.body.type !== undefined) {
      const t = normalizeString(req.body.type);
      if (t) updates.type = t;
    }

    if (req.body.size !== undefined) {
      const s = normalizeSize(req.body.size);
      if (s) updates.size = s;
    }
    if (req.body.collectionName !== undefined)
      updates.collectionName = normalizeString(req.body.collectionName);

    if (req.body.occasions !== undefined) {
      updates.occasions = parseCsvList(req.body.occasions);
    }

    if (req.body.flowers !== undefined) {
      updates.flowers = parseCsvList(req.body.flowers);
    }

    if (req.body.isNewEdition !== undefined) {
      updates.isNewEdition = parseBoolean(req.body.isNewEdition);
    }

    if (req.body.isFeatured !== undefined) {
      updates.isFeatured = parseBoolean(req.body.isFeatured);
    }

    if (req.body.quantity !== undefined) {
      updates.quantity = parseNonNegativeInt(req.body.quantity);
    }

    if (req.body.careInstructions !== undefined) {
      updates.careInstructions = normalizeString(req.body.careInstructions);
    }

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

    // ✅ FIX: saveUploadedImage instead of req.file.filename
    if (req.file) {
      updates.image = await saveUploadedImage(req.file);
    }

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

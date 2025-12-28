import type { Request, Response } from "express";
import { BouquetModel } from "../models/bouquet-model";
import { CollectionModel } from "../models/collection-model";
import { saveUploadedImage } from "../middleware/upload";
import {
  normalizeString,
  parsePrice,
  parseBoolean,
  parseNonNegativeInt,
  parseCsvList,
} from "../utils/validation";

type BouquetStatus = "ready" | "preorder";

const isValidStatus = (status: unknown): status is BouquetStatus =>
  status === "ready" || status === "preorder";

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
    // Validate required fields first
    const name = normalizeString(req.body.name);
    const description = normalizeString(req.body.description);
    const type = normalizeString(req.body.type) || "bouquet";
    const size = normalizeSize(req.body.size) || "Medium";
    const collectionName = normalizeString(req.body.collectionName);

    const status: BouquetStatus = isValidStatus(req.body.status)
      ? req.body.status
      : "ready";
    const price = parsePrice(req.body.price);

    // Validate required fields
    const error = validateBouquetInput(name, price, status);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    // Validate collection name if provided
    if (collectionName && collectionName.trim().length < 2) {
      res.status(400).json({ error: "Collection name must be at least 2 characters." });
      return;
    }

    // Handle image upload if provided
    let image = "";
    if (req.file) {
      try {
        image = await saveUploadedImage(req.file);
      } catch (imageErr) {
        const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
        console.error("❌ Image upload failed:", imageErrorMsg);
        res.status(400).json({ error: `Image upload failed: ${imageErrorMsg}` });
        return;
      }
    }

    // Parse optional fields
    const occasions = parseCsvList(req.body.occasions);
    const flowers = parseCsvList(req.body.flowers);
    const isNewEdition = parseBoolean(req.body.isNewEdition);
    const isFeatured = parseBoolean(req.body.isFeatured);
    const customPenanda = parseCsvList(req.body.customPenanda);
    const quantity = parseNonNegativeInt(req.body.quantity);
    const careInstructions = normalizeString(req.body.careInstructions);

    // Create bouquet (create() automatically saves to database)
    const bouquet = await BouquetModel.create({
      name,
      description,
      price,
      type,
      size,
      image,
      status,
      collectionName: collectionName || undefined,
      occasions,
      flowers,
      isNewEdition,
      isFeatured,
      customPenanda,
      quantity,
      careInstructions,
    });

    // Sync with collection (non-blocking - don't fail if this fails)
    if (collectionName) {
      try {
        await syncBouquetCollection(String(bouquet._id), undefined, collectionName);
      } catch (syncErr) {
        console.error("❌ Failed to sync collection (non-fatal):", syncErr);
        // Don't fail the request if collection sync fails - bouquet is already created
      }
    }

    res.status(201).json({ message: "Bouquet created successfully", bouquet });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : undefined;
    
    // Log full error details for debugging
    console.error("❌ Failed to create bouquet:", {
      message,
      stack,
      body: req.body,
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
    });
    
    // Check for specific MongoDB errors
    let errorMessage = message;
    if (message.includes("E11000") || message.includes("duplicate key")) {
      errorMessage = "Bouquet dengan nama ini sudah ada. Silakan gunakan nama yang berbeda.";
    } else if (message.includes("validation failed") || message.includes("CastError")) {
      errorMessage = "Data yang diinput tidak valid. Pastikan semua field sudah diisi dengan benar.";
    }
    
    // Provide more informative error message in development, generic in production
    const isDevelopment = process.env.NODE_ENV !== "production";
    const finalErrorMessage = isDevelopment 
      ? `Failed to create bouquet: ${errorMessage}`
      : errorMessage.includes("sudah ada") || errorMessage.includes("tidak valid")
        ? errorMessage
        : "Failed to create bouquet. Please check all required fields are filled correctly.";
    
    res.status(500).json({ 
      error: finalErrorMessage,
      ...(isDevelopment && { details: message })
    });
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

    if (req.body.customPenanda !== undefined) {
      updates.customPenanda = parseCsvList(req.body.customPenanda);
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

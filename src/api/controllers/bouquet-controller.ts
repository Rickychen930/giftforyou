import type { Request, Response } from "express";
import { BouquetModel } from "../../models/bouquet-model";
import { CollectionModel } from "../../models/collection-model";
import { saveUploadedImage } from "../middleware/upload";
import {
  normalizeString,
  parsePrice,
  parseBoolean,
  parseNonNegativeInt,
  parseCsvList,
} from "../../utils/validation";
import { BaseApiController } from "./base/BaseApiController";

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

/**
 * Bouquet API Controller
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
class BouquetController extends BaseApiController {
  /**
   * Get bouquet by id
   */
  async getBouquetById(req: Request, res: Response): Promise<void> {
    try {
      const bouquet = await BouquetModel.findById(req.params.id).lean().exec();
      if (!bouquet) {
        this.sendNotFound(res, "Bouquet not found");
        return;
      }
      this.sendSuccess(res, bouquet);
    } catch (error) {
      this.sendBadRequest(res, "Invalid bouquet id");
    }
  }

  /**
   * Create bouquet
   */
  async createBouquet(req: Request, res: Response): Promise<void> {
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
        this.sendBadRequest(res, error);
        return;
      }

      // Validate collection name if provided
      if (collectionName && collectionName.trim().length < 2) {
        this.sendBadRequest(res, "Collection name must be at least 2 characters.");
        return;
      }

      // Handle image upload if provided
      let image = "";
      if (req.file) {
        try {
          image = await saveUploadedImage(req.file);
        } catch (imageErr) {
          const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
          const userFriendlyError = this.formatUserFriendlyError(imageErrorMsg);
          this.sendBadRequest(res, userFriendlyError);
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

      this.sendSuccess(res, bouquet, "Bouquet created successfully", 201);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      const userFriendlyError = this.formatUserFriendlyError(error.message);
      this.sendError(res, userFriendlyError, 500, {
        body: req.body,
        hasFile: !!req.file,
        fileSize: req.file?.size,
        fileName: req.file?.originalname,
      });
    }
  }

  /**
   * Get all bouquets
   */
  async getBouquets(_req: Request, res: Response): Promise<void> {
    try {
      const bouquets = await BouquetModel.find()
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      this.sendSuccess(res, bouquets);
    } catch (error) {
      this.sendError(res, error instanceof Error ? error : new Error("Failed to fetch bouquets"));
    }
  }

  /**
   * Update bouquet
   */
  async updateBouquet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const bouquet = await BouquetModel.findById(id).exec();
      if (!bouquet) {
        this.sendNotFound(res, "Bouquet not found");
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
          this.sendBadRequest(res, "Invalid status.");
          return;
        }
        updates.status = req.body.status;
      }

      if (req.body.price !== undefined) {
        const price = parsePrice(req.body.price);
        if (!Number.isFinite(price) || price <= 0) {
          this.sendBadRequest(res, "Price must be greater than 0.");
          return;
        }
        updates.price = price;
      }

      // Handle image upload if provided
      if (req.file) {
        try {
          updates.image = await saveUploadedImage(req.file);
        } catch (imageErr) {
          const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
          const userFriendlyError = this.formatUserFriendlyError(imageErrorMsg);
          this.sendBadRequest(res, userFriendlyError);
          return;
        }
      }

      Object.assign(bouquet, updates);
      await bouquet.save();

      await syncBouquetCollection(
        String(bouquet._id),
        oldCollectionName,
        bouquet.collectionName
      );

      this.sendSuccess(res, bouquet, "Bouquet updated successfully");
    } catch (error) {
      this.sendError(res, error instanceof Error ? error : new Error("Failed to update bouquet"));
    }
  }

  /**
   * Delete bouquet
   */
  async deleteBouquet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const bouquet = await BouquetModel.findByIdAndDelete(id).exec();
      if (!bouquet) {
        this.sendNotFound(res, "Bouquet not found");
        return;
      }

      const collectionName = normalizeString(bouquet.collectionName);
      if (collectionName) {
        await CollectionModel.updateOne(
          { name: collectionName },
          { $pull: { bouquets: String(bouquet._id) } }
        ).exec();
      }

      this.sendSuccess(res, bouquet, "Bouquet deleted successfully");
    } catch (error) {
      this.sendError(res, error instanceof Error ? error : new Error("Failed to delete bouquet"));
    }
  }
}

// Export controller instance
const bouquetController = new BouquetController();

// Export methods for backward compatibility
export const getBouquetById = (req: Request, res: Response): Promise<void> =>
  bouquetController.getBouquetById(req, res);

export const createBouquet = (req: Request, res: Response): Promise<void> =>
  bouquetController.createBouquet(req, res);

export const getBouquets = (req: Request, res: Response): Promise<void> =>
  bouquetController.getBouquets(req, res);

export const updateBouquet = (req: Request, res: Response): Promise<void> =>
  bouquetController.updateBouquet(req, res);

export const deleteBouquet = (req: Request, res: Response): Promise<void> =>
  bouquetController.deleteBouquet(req, res);

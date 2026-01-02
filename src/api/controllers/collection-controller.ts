/**
 * Collection Controller
 * Backend API controller for managing collections
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";
import { CollectionModel } from "../../models/collection-model";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Collection Controller Class
 * Manages all collection-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const collectionController = new (class extends BaseApiController {
  /**
   * POST /api/collections
   * Body: { name: string, description?: string }
   */
  async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const description =
        typeof req.body?.description === "string"
          ? req.body.description.trim()
          : "";

      if (name.length < 2) {
        this.sendBadRequest(res, "Collection name must be at least 2 characters.");
        return;
      }

      // prevent duplicates
      const exists = await CollectionModel.findOne({ name }).lean().exec();
      if (exists) {
        this.sendError(res, new Error("Collection already exists."), 409);
        return;
      }

      const collection = await CollectionModel.create({
        name,
        description,
        bouquets: [],
      });

      this.sendSuccess(res, collection, "Collection created successfully", 201);
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to create collection"), 400);
    }
  }

  /**
   * GET /api/collections
   */
  async getCollections(_req: Request, res: Response): Promise<void> {
    try {
      const collections = await CollectionModel.find()
        .sort({ createdAt: -1 })
        .populate("bouquets")
        .lean()
        .exec();

      this.sendSuccess(res, collections, "Collections retrieved successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to fetch collections"), 500);
    }
  }
})();

// Export functions for backward compatibility
export const createCollection = collectionController.createCollection.bind(collectionController);
export const getCollections = collectionController.getCollections.bind(collectionController);

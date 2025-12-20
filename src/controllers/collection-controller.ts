import type { Request, Response } from "express";
import { CollectionModel } from "../models/collection-model";

/**
 * POST /api/collections
 * Body: { name: string, description?: string }
 */
export const createCollection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body?.description === "string"
        ? req.body.description.trim()
        : "";

    if (name.length < 2) {
      res
        .status(400)
        .json({ error: "Collection name must be at least 2 characters." });
      return;
    }

    // prevent duplicates
    const exists = await CollectionModel.findOne({ name }).lean().exec();
    if (exists) {
      res.status(409).json({ error: "Collection already exists." });
      return;
    }

    const collection = await CollectionModel.create({
      name,
      description,
      bouquets: [],
    });

    res.status(201).json({
      message: "Collection created successfully",
      collection,
    });
  } catch (err) {
    console.error("createCollection failed:", err);
    res.status(400).json({ error: "Failed to create collection" });
  }
};

/**
 * GET /api/collections
 */
export const getCollections = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const collections = await CollectionModel.find()
      .sort({ createdAt: -1 })
      .populate("bouquets")
      .lean()
      .exec();

    res.status(200).json(collections);
  } catch (err) {
    console.error("getCollections failed:", err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
};

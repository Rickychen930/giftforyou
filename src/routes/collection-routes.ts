// src/routes/collection-routes.ts
import { Router } from "express";
import { Types } from "mongoose";

import { CollectionModel } from "../models/collection-model";
import { BouquetModel } from "../models/bouquet-model";

const router = Router();

const normalizeString = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * GET /api/collections
 * Returns all collections with populated bouquets
 */
router.get("/", async (_req, res) => {
  try {
    const collections = await CollectionModel.find()
      .sort({ createdAt: -1 })
      .populate("bouquets")
      .lean()
      .exec();

    res.status(200).json(collections);
  } catch (err) {
    console.error("Failed to fetch collections:", err);
    res.status(500).json({ error: "Failed to fetch collections" });
  }
});

/**
 * POST /api/collections
 * Body: { name: string, description?: string }
 */
router.post("/", async (req, res) => {
  try {
    const name = normalizeString(req.body?.name);
    const description = normalizeString(req.body?.description);

    if (name.length < 2) {
      res
        .status(400)
        .json({ error: "Collection name must be at least 2 characters." });
      return;
    }

    const exists = await CollectionModel.findOne({ name }).lean().exec();
    if (exists) {
      res.status(409).json({ error: "Collection already exists." });
      return;
    }

    const created = await CollectionModel.create({
      name,
      description,
      bouquets: [],
    });

    res
      .status(201)
      .json({
        message: "Collection created successfully",
        collection: created,
      });
  } catch (err) {
    console.error("Failed to create collection:", err);
    res.status(500).json({ error: "Failed to create collection" });
  }
});

/**
 * POST /api/collections/:id/bouquets
 * Body: { bouquetId: string }
 * Adds a bouquet to a collection (deduplicated)
 */
router.post("/:id/bouquets", async (req, res) => {
  try {
    const { id } = req.params;
    const bouquetId = normalizeString(req.body?.bouquetId);

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid collection id." });
      return;
    }
    if (!Types.ObjectId.isValid(bouquetId)) {
      res.status(400).json({ error: "Invalid bouquet id." });
      return;
    }

    // ensure bouquet exists
    const bouquetExists = await BouquetModel.exists({ _id: bouquetId });
    if (!bouquetExists) {
      res.status(404).json({ error: "Bouquet not found" });
      return;
    }

    const updated = await CollectionModel.findByIdAndUpdate(
      id,
      { $addToSet: { bouquets: new Types.ObjectId(bouquetId) } }, // ✅ no duplicates
      { new: true }
    )
      .populate("bouquets")
      .exec();

    if (!updated) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Bouquet added to collection", collection: updated });
  } catch (err) {
    console.error("Failed to add bouquet to collection:", err);
    res.status(500).json({ error: "Failed to add bouquet to collection" });
  }
});

/**
 * DELETE /api/collections/:id/bouquets/:bouquetId
 * Removes a bouquet from a collection
 */
router.delete("/:id/bouquets/:bouquetId", async (req, res) => {
  try {
    const { id, bouquetId } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid collection id." });
      return;
    }
    if (!Types.ObjectId.isValid(bouquetId)) {
      res.status(400).json({ error: "Invalid bouquet id." });
      return;
    }

    const updated = await CollectionModel.findByIdAndUpdate(
      id,
      { $pull: { bouquets: new Types.ObjectId(bouquetId) } },
      { new: true }
    )
      .populate("bouquets")
      .exec();

    if (!updated) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res
      .status(200)
      .json({
        message: "Bouquet removed from collection",
        collection: updated,
      });
  } catch (err) {
    console.error("Failed to remove bouquet from collection:", err);
    res.status(500).json({ error: "Failed to remove bouquet from collection" });
  }
});

export default router;

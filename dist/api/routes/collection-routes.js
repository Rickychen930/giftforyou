"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/routes/collection-routes.ts
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const collection_model_1 = require("../../models/collection-model");
const bouquet_model_1 = require("../../models/bouquet-model");
const collections_1 = require("../../mock-data/collections");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
const normalizeString = (v) => (typeof v === "string" ? v.trim() : "");
/**
 * Check if MongoDB is connected
 */
const isMongoConnected = () => {
    return mongoose_2.default.connection.readyState === 1;
};
/**
 * GET /api/collections
 * Returns all collections with populated bouquets
 * Falls back to mock data if MongoDB is not connected
 */
router.get("/", async (_req, res) => {
    try {
        // If MongoDB is not connected, return mock data
        if (!isMongoConnected()) {
            console.log("⚠️  MongoDB not connected, returning mock collections data");
            return res.status(200).json(collections_1.mockCollections);
        }
        const collections = await collection_model_1.CollectionModel.find()
            .sort({ createdAt: -1 })
            .populate("bouquets")
            .lean()
            .exec();
        res.status(200).json(collections);
    }
    catch (err) {
        console.error("Failed to fetch collections:", err);
        // Fallback to mock data on error
        console.log("⚠️  Error fetching collections, returning mock data");
        res.status(200).json(collections_1.mockCollections);
    }
});
/**
 * POST /api/collections
 * Body: { name: string, description?: string }
 * Protected: Admin only
 */
router.post("/", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const name = normalizeString(req.body?.name);
        const description = normalizeString(req.body?.description);
        if (name.length < 2) {
            res
                .status(400)
                .json({ error: "Collection name must be at least 2 characters." });
            return;
        }
        const exists = await collection_model_1.CollectionModel.findOne({ name }).lean().exec();
        if (exists) {
            res.status(409).json({ error: "Collection already exists." });
            return;
        }
        const created = await collection_model_1.CollectionModel.create({
            name,
            description,
            bouquets: [],
        });
        res.status(201).json({
            message: "Collection created successfully",
            collection: created,
        });
    }
    catch (err) {
        console.error("Failed to create collection:", err);
        res.status(500).json({ error: "Failed to create collection" });
    }
});
/**
 * POST /api/collections/:id/bouquets
 * Body: { bouquetId: string }
 * Adds a bouquet to a collection (deduplicated)
 * Protected: Admin only
 */
router.post("/:id/bouquets", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const bouquetId = normalizeString(req.body?.bouquetId);
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid collection id." });
            return;
        }
        if (!mongoose_1.Types.ObjectId.isValid(bouquetId)) {
            res.status(400).json({ error: "Invalid bouquet id." });
            return;
        }
        // ensure bouquet exists
        const bouquetExists = await bouquet_model_1.BouquetModel.exists({ _id: bouquetId });
        if (!bouquetExists) {
            res.status(404).json({ error: "Bouquet not found" });
            return;
        }
        const updated = await collection_model_1.CollectionModel.findByIdAndUpdate(id, { $addToSet: { bouquets: new mongoose_1.Types.ObjectId(bouquetId) } }, // ✅ no duplicates
        { new: true })
            .populate("bouquets")
            .exec();
        if (!updated) {
            res.status(404).json({ error: "Collection not found" });
            return;
        }
        res
            .status(200)
            .json({ message: "Bouquet added to collection", collection: updated });
    }
    catch (err) {
        console.error("Failed to add bouquet to collection:", err);
        res.status(500).json({ error: "Failed to add bouquet to collection" });
    }
});
/**
 * DELETE /api/collections/:id/bouquets/:bouquetId
 * Removes a bouquet from a collection
 * Protected: Admin only
 */
router.delete("/:id/bouquets/:bouquetId", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id, bouquetId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid collection id." });
            return;
        }
        if (!mongoose_1.Types.ObjectId.isValid(bouquetId)) {
            res.status(400).json({ error: "Invalid bouquet id." });
            return;
        }
        const updated = await collection_model_1.CollectionModel.findByIdAndUpdate(id, { $pull: { bouquets: new mongoose_1.Types.ObjectId(bouquetId) } }, { new: true })
            .populate("bouquets")
            .exec();
        if (!updated) {
            res.status(404).json({ error: "Collection not found" });
            return;
        }
        res.status(200).json({
            message: "Bouquet removed from collection",
            collection: updated,
        });
    }
    catch (err) {
        console.error("Failed to remove bouquet from collection:", err);
        res.status(500).json({ error: "Failed to remove bouquet from collection" });
    }
});
/**
 * PUT /api/collections/:id
 * Body: { name: string, description?: string }
 * Updates a collection name and/or description
 * Protected: Admin only
 */
router.put("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const name = normalizeString(req.body?.name);
        const description = normalizeString(req.body?.description ?? "");
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid collection id." });
            return;
        }
        if (name.length < 2) {
            res.status(400).json({ error: "Collection name must be at least 2 characters." });
            return;
        }
        // Check if new name already exists (excluding current collection)
        const exists = await collection_model_1.CollectionModel.findOne({ name, _id: { $ne: id } }).lean().exec();
        if (exists) {
            res.status(409).json({ error: "Collection name already exists." });
            return;
        }
        const collection = await collection_model_1.CollectionModel.findById(id).exec();
        if (!collection) {
            res.status(404).json({ error: "Collection not found" });
            return;
        }
        const oldName = collection.name;
        // Update collection
        const updated = await collection_model_1.CollectionModel.findByIdAndUpdate(id, { name, description: description || undefined }, { new: true })
            .populate("bouquets")
            .exec();
        if (!updated) {
            res.status(404).json({ error: "Collection not found" });
            return;
        }
        // Update all bouquets with this collection name
        if (oldName !== name) {
            await bouquet_model_1.BouquetModel.updateMany({ collectionName: oldName }, { collectionName: name }).exec();
        }
        res.status(200).json({
            message: "Collection updated successfully",
            collection: updated,
        });
    }
    catch (err) {
        console.error("Failed to update collection:", err);
        res.status(500).json({ error: "Failed to update collection" });
    }
});
/**
 * DELETE /api/collections/:id
 * Deletes a collection and updates bouquets to remove collectionName
 * Protected: Admin only
 */
router.delete("/:id", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            res.status(400).json({ error: "Invalid collection id." });
            return;
        }
        const collection = await collection_model_1.CollectionModel.findById(id).exec();
        if (!collection) {
            res.status(404).json({ error: "Collection not found" });
            return;
        }
        const collectionName = collection.name;
        // Update all bouquets with this collection name to remove it
        await bouquet_model_1.BouquetModel.updateMany({ collectionName }, { $unset: { collectionName: "" } }).exec();
        // Delete the collection
        await collection_model_1.CollectionModel.findByIdAndDelete(id).exec();
        res.status(200).json({
            message: "Collection deleted successfully",
        });
    }
    catch (err) {
        console.error("Failed to delete collection:", err);
        res.status(500).json({ error: "Failed to delete collection" });
    }
});
exports.default = router;
//# sourceMappingURL=collection-routes.js.map
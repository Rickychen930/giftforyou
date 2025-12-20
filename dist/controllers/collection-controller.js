"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollections = exports.createCollection = void 0;
const collection_model_1 = require("../models/collection-model");
/**
 * POST /api/collections
 * Body: { name: string, description?: string }
 */
const createCollection = async (req, res) => {
    try {
        const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
        const description = typeof req.body?.description === "string"
            ? req.body.description.trim()
            : "";
        if (name.length < 2) {
            res
                .status(400)
                .json({ error: "Collection name must be at least 2 characters." });
            return;
        }
        // prevent duplicates
        const exists = await collection_model_1.CollectionModel.findOne({ name }).lean().exec();
        if (exists) {
            res.status(409).json({ error: "Collection already exists." });
            return;
        }
        const collection = await collection_model_1.CollectionModel.create({
            name,
            description,
            bouquets: [],
        });
        res.status(201).json({
            message: "Collection created successfully",
            collection,
        });
    }
    catch (err) {
        console.error("createCollection failed:", err);
        res.status(400).json({ error: "Failed to create collection" });
    }
};
exports.createCollection = createCollection;
/**
 * GET /api/collections
 */
const getCollections = async (_req, res) => {
    try {
        const collections = await collection_model_1.CollectionModel.find()
            .sort({ createdAt: -1 })
            .populate("bouquets")
            .lean()
            .exec();
        res.status(200).json(collections);
    }
    catch (err) {
        console.error("getCollections failed:", err);
        res.status(500).json({ error: "Failed to fetch collections" });
    }
};
exports.getCollections = getCollections;
//# sourceMappingURL=collection-controller.js.map
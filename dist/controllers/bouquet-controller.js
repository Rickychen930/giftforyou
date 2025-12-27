"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBouquet = exports.updateBouquet = exports.getBouquets = exports.createBouquet = exports.getBouquetById = void 0;
const bouquet_model_1 = require("../models/bouquet-model");
const collection_model_1 = require("../models/collection-model");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../utils/validation");
const isValidStatus = (status) => status === "ready" || status === "preorder";
const normalizeSize = (value) => {
    const raw = (0, validation_1.normalizeString)(value);
    if (!raw)
        return "";
    const v = raw.toLowerCase();
    if (v === "extra-small" || v === "extra small" || v === "xs" || v === "xsmall")
        return "Extra-Small";
    if (v === "small")
        return "Small";
    if (v === "medium")
        return "Medium";
    if (v === "large")
        return "Large";
    if (v === "extra-large" || v === "extra large" || v === "x-large")
        return "Extra-Large";
    if (v === "jumbo" || v === "xl" || v === "xxl")
        return "Jumbo";
    return raw;
};
const validateBouquetInput = (name, price, status) => {
    if (!name || name.length < 2)
        return "Name must be at least 2 characters.";
    if (!Number.isFinite(price) || price <= 0)
        return "Price must be greater than 0.";
    if (!isValidStatus(status))
        return "Invalid status.";
    return null;
};
const syncBouquetCollection = async (bouquetId, oldCollectionName, newCollectionName) => {
    const oldName = (0, validation_1.normalizeString)(oldCollectionName);
    const newName = (0, validation_1.normalizeString)(newCollectionName);
    if (oldName && oldName !== newName) {
        await collection_model_1.CollectionModel.updateOne({ name: oldName }, { $pull: { bouquets: bouquetId } }).exec();
    }
    if (newName) {
        await collection_model_1.CollectionModel.findOneAndUpdate({ name: newName }, { $addToSet: { bouquets: bouquetId } }, { upsert: true, new: true }).exec();
    }
};
// ✅ Get bouquet by id
const getBouquetById = async (req, res) => {
    try {
        const bouquet = await bouquet_model_1.BouquetModel.findById(req.params.id).lean().exec();
        if (!bouquet) {
            res.status(404).json({ error: "Bouquet not found" });
            return;
        }
        res.status(200).json(bouquet);
    }
    catch {
        res.status(400).json({ error: "Invalid bouquet id" });
    }
};
exports.getBouquetById = getBouquetById;
// ✅ Create bouquet
const createBouquet = async (req, res) => {
    try {
        const name = (0, validation_1.normalizeString)(req.body.name);
        const description = (0, validation_1.normalizeString)(req.body.description);
        const type = (0, validation_1.normalizeString)(req.body.type) || "bouquet";
        const size = normalizeSize(req.body.size) || "Medium";
        const collectionName = (0, validation_1.normalizeString)(req.body.collectionName);
        const status = isValidStatus(req.body.status)
            ? req.body.status
            : "ready";
        const price = (0, validation_1.parsePrice)(req.body.price);
        const error = validateBouquetInput(name, price, status);
        if (error) {
            res.status(400).json({ error });
            return;
        }
        // ✅ FIX: memoryStorage => use saveUploadedImage (not req.file.filename)
        const image = req.file ? await (0, upload_1.saveUploadedImage)(req.file) : "";
        const occasions = (0, validation_1.parseCsvList)(req.body.occasions);
        const flowers = (0, validation_1.parseCsvList)(req.body.flowers);
        const isNewEdition = (0, validation_1.parseBoolean)(req.body.isNewEdition);
        const isFeatured = (0, validation_1.parseBoolean)(req.body.isFeatured);
        const customPenanda = (0, validation_1.parseCsvList)(req.body.customPenanda);
        const quantity = (0, validation_1.parseNonNegativeInt)(req.body.quantity);
        const careInstructions = (0, validation_1.normalizeString)(req.body.careInstructions);
        const bouquet = await bouquet_model_1.BouquetModel.create({
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
            customPenanda,
            quantity,
            careInstructions,
        });
        // ✅ FIX: removed broken ", ,"
        await syncBouquetCollection(String(bouquet._id), undefined, collectionName);
        res.status(201).json({ message: "Bouquet created successfully", bouquet });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Failed to create bouquet:", message);
        res.status(500).json({ error: "Failed to create bouquet" });
    }
};
exports.createBouquet = createBouquet;
// ✅ Get all bouquets
const getBouquets = async (_req, res) => {
    try {
        const bouquets = await bouquet_model_1.BouquetModel.find()
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        res.status(200).json(bouquets);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Failed to fetch bouquets:", message);
        res.status(500).json({ error: "Failed to fetch bouquets" });
    }
};
exports.getBouquets = getBouquets;
// ✅ Update bouquet
const updateBouquet = async (req, res) => {
    try {
        const { id } = req.params;
        const bouquet = await bouquet_model_1.BouquetModel.findById(id).exec();
        if (!bouquet) {
            res.status(404).json({ error: "Bouquet not found" });
            return;
        }
        const oldCollectionName = bouquet.collectionName;
        const updates = {};
        if (req.body.name !== undefined)
            updates.name = (0, validation_1.normalizeString)(req.body.name);
        if (req.body.description !== undefined)
            updates.description = (0, validation_1.normalizeString)(req.body.description);
        if (req.body.type !== undefined) {
            const t = (0, validation_1.normalizeString)(req.body.type);
            if (t)
                updates.type = t;
        }
        if (req.body.size !== undefined) {
            const s = normalizeSize(req.body.size);
            if (s)
                updates.size = s;
        }
        if (req.body.collectionName !== undefined)
            updates.collectionName = (0, validation_1.normalizeString)(req.body.collectionName);
        if (req.body.occasions !== undefined) {
            updates.occasions = (0, validation_1.parseCsvList)(req.body.occasions);
        }
        if (req.body.flowers !== undefined) {
            updates.flowers = (0, validation_1.parseCsvList)(req.body.flowers);
        }
        if (req.body.isNewEdition !== undefined) {
            updates.isNewEdition = (0, validation_1.parseBoolean)(req.body.isNewEdition);
        }
        if (req.body.isFeatured !== undefined) {
            updates.isFeatured = (0, validation_1.parseBoolean)(req.body.isFeatured);
        }
        if (req.body.customPenanda !== undefined) {
            updates.customPenanda = (0, validation_1.parseCsvList)(req.body.customPenanda);
        }
        if (req.body.quantity !== undefined) {
            updates.quantity = (0, validation_1.parseNonNegativeInt)(req.body.quantity);
        }
        if (req.body.careInstructions !== undefined) {
            updates.careInstructions = (0, validation_1.normalizeString)(req.body.careInstructions);
        }
        if (req.body.status !== undefined) {
            if (!isValidStatus(req.body.status)) {
                res.status(400).json({ error: "Invalid status." });
                return;
            }
            updates.status = req.body.status;
        }
        if (req.body.price !== undefined) {
            const price = (0, validation_1.parsePrice)(req.body.price);
            if (!Number.isFinite(price) || price <= 0) {
                res.status(400).json({ error: "Price must be greater than 0." });
                return;
            }
            updates.price = price;
        }
        // ✅ FIX: saveUploadedImage instead of req.file.filename
        if (req.file) {
            updates.image = await (0, upload_1.saveUploadedImage)(req.file);
        }
        Object.assign(bouquet, updates);
        await bouquet.save();
        await syncBouquetCollection(String(bouquet._id), oldCollectionName, bouquet.collectionName);
        res.status(200).json({ message: "Bouquet updated successfully", bouquet });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Update bouquet failed:", message);
        res.status(500).json({ error: "Failed to update bouquet" });
    }
};
exports.updateBouquet = updateBouquet;
// ✅ Delete bouquet
const deleteBouquet = async (req, res) => {
    try {
        const { id } = req.params;
        const bouquet = await bouquet_model_1.BouquetModel.findByIdAndDelete(id).exec();
        if (!bouquet) {
            res.status(404).json({ error: "Bouquet not found" });
            return;
        }
        const collectionName = (0, validation_1.normalizeString)(bouquet.collectionName);
        if (collectionName) {
            await collection_model_1.CollectionModel.updateOne({ name: collectionName }, { $pull: { bouquets: String(bouquet._id) } }).exec();
        }
        res.status(200).json({ message: "Bouquet deleted successfully", bouquet });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("❌ Delete bouquet failed:", message);
        res.status(500).json({ error: "Failed to delete bouquet" });
    }
};
exports.deleteBouquet = deleteBouquet;
//# sourceMappingURL=bouquet-controller.js.map
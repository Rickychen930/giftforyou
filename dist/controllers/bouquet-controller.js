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
        // Validate required fields first
        const name = (0, validation_1.normalizeString)(req.body.name);
        const description = (0, validation_1.normalizeString)(req.body.description);
        const type = (0, validation_1.normalizeString)(req.body.type) || "bouquet";
        const size = normalizeSize(req.body.size) || "Medium";
        const collectionName = (0, validation_1.normalizeString)(req.body.collectionName);
        const status = isValidStatus(req.body.status)
            ? req.body.status
            : "ready";
        const price = (0, validation_1.parsePrice)(req.body.price);
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
                image = await (0, upload_1.saveUploadedImage)(req.file);
            }
            catch (imageErr) {
                const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
                console.error("❌ Image upload failed:", imageErrorMsg);
                // Provide user-friendly error messages
                let userMessage = imageErrorMsg;
                if (imageErrorMsg.includes("EACCES") || imageErrorMsg.includes("EPERM") || imageErrorMsg.includes("permission")) {
                    userMessage = "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator untuk memperbaiki izin direktori uploads.";
                }
                else if (imageErrorMsg.includes("ENOSPC")) {
                    userMessage = "Ruang penyimpanan penuh. Silakan hapus file lama atau hubungi administrator.";
                }
                else if (imageErrorMsg.includes("terlalu besar") || imageErrorMsg.includes("too large")) {
                    userMessage = imageErrorMsg; // Already user-friendly
                }
                else if (imageErrorMsg.includes("Empty") || imageErrorMsg.includes("kosong")) {
                    userMessage = imageErrorMsg; // Already user-friendly
                }
                res.status(400).json({ error: userMessage });
                return;
            }
        }
        // Parse optional fields
        const occasions = (0, validation_1.parseCsvList)(req.body.occasions);
        const flowers = (0, validation_1.parseCsvList)(req.body.flowers);
        const isNewEdition = (0, validation_1.parseBoolean)(req.body.isNewEdition);
        const isFeatured = (0, validation_1.parseBoolean)(req.body.isFeatured);
        const customPenanda = (0, validation_1.parseCsvList)(req.body.customPenanda);
        const quantity = (0, validation_1.parseNonNegativeInt)(req.body.quantity);
        const careInstructions = (0, validation_1.normalizeString)(req.body.careInstructions);
        // Create bouquet (create() automatically saves to database)
        const bouquet = await bouquet_model_1.BouquetModel.create({
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
            }
            catch (syncErr) {
                console.error("❌ Failed to sync collection (non-fatal):", syncErr);
                // Don't fail the request if collection sync fails - bouquet is already created
            }
        }
        res.status(201).json({ message: "Bouquet created successfully", bouquet });
    }
    catch (err) {
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
        }
        else if (message.includes("validation failed") || message.includes("CastError")) {
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
            try {
                updates.image = await (0, upload_1.saveUploadedImage)(req.file);
            }
            catch (imageErr) {
                const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
                console.error("❌ Image upload failed during update:", imageErrorMsg);
                // Provide user-friendly error messages
                let userMessage = imageErrorMsg;
                if (imageErrorMsg.includes("EACCES") || imageErrorMsg.includes("EPERM") || imageErrorMsg.includes("permission")) {
                    userMessage = "Tidak memiliki izin untuk menyimpan file. Silakan hubungi administrator untuk memperbaiki izin direktori uploads.";
                }
                else if (imageErrorMsg.includes("ENOSPC")) {
                    userMessage = "Ruang penyimpanan penuh. Silakan hapus file lama atau hubungi administrator.";
                }
                else if (imageErrorMsg.includes("terlalu besar") || imageErrorMsg.includes("too large")) {
                    userMessage = imageErrorMsg; // Already user-friendly
                }
                else if (imageErrorMsg.includes("Empty") || imageErrorMsg.includes("kosong")) {
                    userMessage = imageErrorMsg; // Already user-friendly
                }
                res.status(400).json({ error: userMessage });
                return;
            }
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
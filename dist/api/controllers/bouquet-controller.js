"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBouquet = exports.updateBouquet = exports.getBouquets = exports.createBouquet = exports.getBouquetById = void 0;
const bouquet_model_1 = require("../../models/bouquet-model");
const collection_model_1 = require("../../models/collection-model");
const upload_1 = require("../middleware/upload");
const validation_1 = require("../../utils/validation");
const BaseApiController_1 = require("./base/BaseApiController");
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
/**
 * Bouquet API Controller
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
class BouquetController extends BaseApiController_1.BaseApiController {
    /**
     * Get bouquet by id
     */
    async getBouquetById(req, res) {
        try {
            const bouquet = await bouquet_model_1.BouquetModel.findById(req.params.id).lean().exec();
            if (!bouquet) {
                this.sendNotFound(res, "Bouquet not found");
                return;
            }
            this.sendSuccess(res, bouquet);
        }
        catch (error) {
            this.sendBadRequest(res, "Invalid bouquet id");
        }
    }
    /**
     * Create bouquet
     */
    async createBouquet(req, res) {
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
                    image = await (0, upload_1.saveUploadedImage)(req.file);
                }
                catch (imageErr) {
                    const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
                    const userFriendlyError = this.formatUserFriendlyError(imageErrorMsg);
                    this.sendBadRequest(res, userFriendlyError);
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
            this.sendSuccess(res, bouquet, "Bouquet created successfully", 201);
        }
        catch (err) {
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
    async getBouquets(_req, res) {
        try {
            const bouquets = await bouquet_model_1.BouquetModel.find()
                .sort({ createdAt: -1 })
                .lean()
                .exec();
            this.sendSuccess(res, bouquets);
        }
        catch (error) {
            this.sendError(res, error instanceof Error ? error : new Error("Failed to fetch bouquets"));
        }
    }
    /**
     * Update bouquet
     */
    async updateBouquet(req, res) {
        try {
            const { id } = req.params;
            const bouquet = await bouquet_model_1.BouquetModel.findById(id).exec();
            if (!bouquet) {
                this.sendNotFound(res, "Bouquet not found");
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
                    this.sendBadRequest(res, "Invalid status.");
                    return;
                }
                updates.status = req.body.status;
            }
            if (req.body.price !== undefined) {
                const price = (0, validation_1.parsePrice)(req.body.price);
                if (!Number.isFinite(price) || price <= 0) {
                    this.sendBadRequest(res, "Price must be greater than 0.");
                    return;
                }
                updates.price = price;
            }
            // Handle image upload if provided
            if (req.file) {
                try {
                    updates.image = await (0, upload_1.saveUploadedImage)(req.file);
                }
                catch (imageErr) {
                    const imageErrorMsg = imageErr instanceof Error ? imageErr.message : "Failed to process image";
                    const userFriendlyError = this.formatUserFriendlyError(imageErrorMsg);
                    this.sendBadRequest(res, userFriendlyError);
                    return;
                }
            }
            Object.assign(bouquet, updates);
            await bouquet.save();
            await syncBouquetCollection(String(bouquet._id), oldCollectionName, bouquet.collectionName);
            this.sendSuccess(res, bouquet, "Bouquet updated successfully");
        }
        catch (error) {
            this.sendError(res, error instanceof Error ? error : new Error("Failed to update bouquet"));
        }
    }
    /**
     * Delete bouquet
     */
    async deleteBouquet(req, res) {
        try {
            const { id } = req.params;
            const bouquet = await bouquet_model_1.BouquetModel.findByIdAndDelete(id).exec();
            if (!bouquet) {
                this.sendNotFound(res, "Bouquet not found");
                return;
            }
            const collectionName = (0, validation_1.normalizeString)(bouquet.collectionName);
            if (collectionName) {
                await collection_model_1.CollectionModel.updateOne({ name: collectionName }, { $pull: { bouquets: String(bouquet._id) } }).exec();
            }
            this.sendSuccess(res, bouquet, "Bouquet deleted successfully");
        }
        catch (error) {
            this.sendError(res, error instanceof Error ? error : new Error("Failed to delete bouquet"));
        }
    }
}
// Export controller instance
const bouquetController = new BouquetController();
// Export methods for backward compatibility
const getBouquetById = (req, res) => bouquetController.getBouquetById(req, res);
exports.getBouquetById = getBouquetById;
const createBouquet = (req, res) => bouquetController.createBouquet(req, res);
exports.createBouquet = createBouquet;
const getBouquets = (req, res) => bouquetController.getBouquets(req, res);
exports.getBouquets = getBouquets;
const updateBouquet = (req, res) => bouquetController.updateBouquet(req, res);
exports.updateBouquet = updateBouquet;
const deleteBouquet = (req, res) => bouquetController.deleteBouquet(req, res);
exports.deleteBouquet = deleteBouquet;
//# sourceMappingURL=bouquet-controller.js.map
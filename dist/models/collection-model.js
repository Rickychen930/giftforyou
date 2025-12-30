"use strict";
// src/models/collection-model.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = exports.CollectionModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CollectionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        unique: true,
        index: true,
    },
    description: { type: String, default: "", trim: true, maxlength: 300 },
    bouquets: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Bouquet", default: [] }],
}, { timestamps: true });
CollectionSchema.index({ name: 1 });
CollectionSchema.index({ bouquets: 1 });
/**
 * ✅ Export the REAL mongoose model instance.
 * This is what controllers should import for:
 * - CollectionModel.updateOne(...)
 * - CollectionModel.findOneAndUpdate(...)
 * - CollectionModel.countDocuments(...)
 */
exports.CollectionModel = mongoose_1.default.models.Collection ||
    (0, mongoose_1.model)("Collection", CollectionSchema);
/**
 * ✅ Optional service layer for “business logic”
 * (nice and professional, no conflict with mongoose Model methods)
 */
class CollectionService {
    static async findWithBouquets() {
        const docs = await exports.CollectionModel.find()
            .populate("bouquets")
            .lean()
            .exec();
        return docs;
    }
    static async createCollection(data) {
        return exports.CollectionModel.create(data);
    }
    static async updateById(id, data) {
        return exports.CollectionModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
}
exports.CollectionService = CollectionService;
//# sourceMappingURL=collection-model.js.map
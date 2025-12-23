"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BouquetService = exports.BouquetModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BouquetSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0.01 },
    type: { type: String, default: "bouquet", required: true, trim: true },
    // ✅ FIXED: correct enum values
    size: {
        type: String,
        enum: [
            "Extra-Small",
            "Small",
            "Medium",
            "Large",
            "Extra-Large",
            "Jumbo",
        ],
        default: "Medium",
        required: true,
    },
    occasions: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length <= 10,
            message: "Occasions array cannot exceed 10 items.",
        },
    },
    flowers: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length <= 20,
            message: "Flowers array cannot exceed 20 items.",
        },
    },
    image: { type: String, default: "", trim: true },
    status: { type: String, enum: ["ready", "preorder"], default: "ready" },
    quantity: { type: Number, default: 0, min: 0 },
    collectionName: { type: String, default: "", trim: true, maxlength: 100 },
    isNewEdition: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    careInstructions: { type: String, default: "", trim: true, maxlength: 300 },
}, { timestamps: true });
BouquetSchema.index({ name: 1 });
BouquetSchema.index({ occasions: 1 });
BouquetSchema.index({ flowers: 1 });
BouquetSchema.index({ isNewEdition: 1 });
BouquetSchema.index({ isFeatured: 1 });
exports.BouquetModel = mongoose_1.default.models.Bouquet ||
    (0, mongoose_1.model)("Bouquet", BouquetSchema);
class BouquetService {
    static async findNewEditions() {
        return exports.BouquetModel.find({ isNewEdition: true, status: "ready" }).exec();
    }
    static async findFeatured() {
        return exports.BouquetModel.find({ isFeatured: true, status: "ready" }).exec();
    }
    static async createBouquet(data) {
        return exports.BouquetModel.create(data);
    }
    static async updateById(id, data) {
        return exports.BouquetModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).exec();
    }
}
exports.BouquetService = BouquetService;
//# sourceMappingURL=bouquet-model.js.map
"use strict";
// src/models/visitor-stat-model.ts
// VisitorStat model for tracking site visits (Mongoose Model + optional service layer)
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
exports.VisitorStatService = exports.VisitorStatModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VisitorStatSchema = new mongoose_1.Schema({
    date: { type: String, required: true, index: true, unique: true },
    dailyCount: { type: Number, default: 0, min: 0 },
    totalVisitors: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
/**
 * ✅ Export a REAL mongoose model instance.
 * This is what you should import in controllers when you need:
 * - VisitorStatModel.aggregate(...)
 * - VisitorStatModel.countDocuments(...)
 * - VisitorStatModel.findOneAndUpdate(...)
 */
exports.VisitorStatModel = mongoose_1.default.models.VisitorStat ||
    (0, mongoose_1.model)("VisitorStat", VisitorStatSchema);
/**
 * Optional: Service layer (nice & professional).
 * Use this if you want cleaner logic instead of calling mongoose everywhere.
 */
class VisitorStatService {
    static async incrementDaily(date) {
        try {
            const stat = await exports.VisitorStatModel.findOneAndUpdate({ date }, { $inc: { dailyCount: 1, totalVisitors: 1 } }, { new: true, upsert: true });
            if (!stat)
                throw new Error("Failed to upsert visitor stats.");
            return stat;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Error incrementing visitor stats: ${message}`);
        }
    }
    static async create(data) {
        try {
            return await exports.VisitorStatModel.create(data);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Error creating visitor stat: ${message}`);
        }
    }
}
exports.VisitorStatService = VisitorStatService;
//# sourceMappingURL=visitor-stat-model.js.map
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
exports.AnalyticsEventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AnalyticsEventSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["pageview", "search", "bouquet_view"],
        required: true,
        index: true,
    },
    path: { type: String, default: "", trim: true, maxlength: 300 },
    search: { type: String, default: "", trim: true, maxlength: 600 },
    term: { type: String, default: "", trim: true, maxlength: 120 },
    bouquetId: { type: String, default: "", trim: true, maxlength: 64, index: true },
    visitorId: { type: String, default: "", trim: true, maxlength: 64, index: true },
}, { timestamps: true });
AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ term: 1, createdAt: -1 });
AnalyticsEventSchema.index({ visitorId: 1, createdAt: -1 });
exports.AnalyticsEventModel = mongoose_1.default.models.AnalyticsEvent ||
    (0, mongoose_1.model)("AnalyticsEvent", AnalyticsEventSchema);
//# sourceMappingURL=analytics-event-model.js.map
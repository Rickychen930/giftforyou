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
exports.OrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
    customerId: { type: String, required: false, trim: true, maxlength: 64, index: true },
    buyerName: { type: String, required: true, trim: true, maxlength: 120 },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 40 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    bouquetId: { type: String, required: true, trim: true, maxlength: 64, index: true },
    bouquetName: { type: String, required: true, trim: true, maxlength: 200 },
    bouquetPrice: { type: Number, default: 0, min: 0 },
    orderStatus: {
        type: String,
        enum: [
            "bertanya",
            "memesan",
            "sedang_diproses",
            "menunggu_driver",
            "pengantaran",
            "terkirim",
        ],
        default: "bertanya",
        required: true,
        index: true,
    },
    paymentStatus: {
        type: String,
        enum: ["belum_bayar", "dp", "sudah_bayar"],
        default: "belum_bayar",
        required: true,
        index: true,
    },
    paymentMethod: {
        type: String,
        enum: ["", "cash", "transfer_bank", "ewallet", "qris", "lainnya"],
        default: "",
        trim: true,
        maxlength: 32,
    },
    downPaymentAmount: { type: Number, default: 0, min: 0 },
    additionalPayment: { type: Number, default: 0, min: 0 },
    deliveryPrice: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, default: 0, min: 0 },
    deliveryAt: { type: Date, required: false },
    activity: {
        type: [
            {
                at: { type: Date, required: true },
                kind: {
                    type: String,
                    enum: ["created", "status", "payment", "delivery", "bouquet", "edit"],
                    required: true,
                },
                message: { type: String, required: true, trim: true, maxlength: 240 },
            },
        ],
        default: [],
    },
}, { timestamps: true });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ deliveryAt: 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
exports.OrderModel = mongoose_1.default.models.Order || (0, mongoose_1.model)("Order", OrderSchema);
//# sourceMappingURL=order-model.js.map
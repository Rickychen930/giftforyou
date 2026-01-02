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
exports.UserService = exports.UserModel = void 0;
// src/models/user-model.ts
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
/**
 * ✅ Export REAL mongoose model instance
 */
exports.UserModel = mongoose_1.default.models.User || (0, mongoose_1.model)("User", UserSchema);
/**
 * Optional: service layer (nice and clean)
 */
class UserService {
    static findByUsername(username) {
        return exports.UserModel.findOne({ username }).exec();
    }
    static findByEmail(email) {
        return exports.UserModel.findOne({ email }).exec();
    }
    static createUser(data) {
        return exports.UserModel.create(data);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user-model.js.map
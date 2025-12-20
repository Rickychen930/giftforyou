"use strict";
// src/models/base-model.ts
// Base class for common model functionality (OOP inheritance).
// Provides shared CRUD methods for subclasses.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
class BaseModel {
    constructor(model) {
        this.model = model;
    }
    // Common static methods
    async findAll() {
        try {
            return await this.model.find();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Error fetching all records: ${message}`);
        }
    }
    async findById(id) {
        try {
            return await this.model.findById(id);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Error finding record by ID: ${message}`);
        }
    }
    async deleteById(id) {
        try {
            const result = await this.model.findByIdAndDelete(id);
            return !!result;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Error deleting record: ${message}`);
        }
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base-model.js.map
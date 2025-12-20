// src/models/base-model.ts
// Base class for common model functionality (OOP inheritance).
// Provides shared CRUD methods for subclasses.

import { Model, Document } from "mongoose";

export class BaseModel<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  // Common static methods
  async findAll(): Promise<T[]> {
    try {
      return await this.model.find();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error fetching all records: ${message}`);
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error finding record by ID: ${message}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error deleting record: ${message}`);
    }
  }
}

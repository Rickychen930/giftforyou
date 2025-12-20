// src/models/visitor-stat-model.ts
// VisitorStat model for tracking site visits (Mongoose Model + optional service layer)

import mongoose, { Schema, model, type Model } from "mongoose";

export interface IVisitorStat {
  date: string; // e.g. "2025-12-19"
  dailyCount: number; // visits for this date
  totalVisitors: number; // running total (stored redundantly if you want)
}

const VisitorStatSchema = new Schema<IVisitorStat>(
  {
    date: { type: String, required: true, index: true, unique: true },
    dailyCount: { type: Number, default: 0, min: 0 },
    totalVisitors: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

/**
 * ✅ Export a REAL mongoose model instance.
 * This is what you should import in controllers when you need:
 * - VisitorStatModel.aggregate(...)
 * - VisitorStatModel.countDocuments(...)
 * - VisitorStatModel.findOneAndUpdate(...)
 */
export const VisitorStatModel: Model<IVisitorStat> =
  (mongoose.models.VisitorStat as Model<IVisitorStat>) ||
  model<IVisitorStat>("VisitorStat", VisitorStatSchema);

/**
 * Optional: Service layer (nice & professional).
 * Use this if you want cleaner logic instead of calling mongoose everywhere.
 */
export class VisitorStatService {
  static async incrementDaily(date: string) {
    try {
      const stat = await VisitorStatModel.findOneAndUpdate(
        { date },
        { $inc: { dailyCount: 1, totalVisitors: 1 } },
        { new: true, upsert: true }
      );

      if (!stat) throw new Error("Failed to upsert visitor stats.");
      return stat;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error incrementing visitor stats: ${message}`);
    }
  }

  static async create(data: Partial<IVisitorStat>) {
    try {
      return await VisitorStatModel.create(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Error creating visitor stat: ${message}`);
    }
  }
}

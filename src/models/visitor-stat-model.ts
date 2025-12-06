// src/models/visitor-stat-model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVisitorStat extends Document {
  date: string; // format YYYY-MM-DD
  count: number;
}

const VisitorStatSchema = new Schema<IVisitorStat>({
  date: { type: String, required: true, index: true, unique: true },
  count: { type: Number, default: 0 },
});

export const VisitorStat = mongoose.model<IVisitorStat>(
  "VisitorStat",
  VisitorStatSchema
);

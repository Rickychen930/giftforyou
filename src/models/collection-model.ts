import { Schema, model, Types, Document } from "mongoose";
import { IBouquet } from "./bouquet-model-real";

export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  bouquets: IBouquet[]; // ✅ populated bouquets
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    bouquets: [{ type: Types.ObjectId, ref: "Bouquet" }],
  },
  { timestamps: true }
);

export const Collection = model<ICollection>("Collection", CollectionSchema);

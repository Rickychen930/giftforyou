import { Schema, model, Document, ObjectId } from "mongoose";

export interface IBouquet {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  type: string;
  size: string;
  image: string;
  status: "ready" | "preorder";
}

export type BouquetDocument = IBouquet & Document;

const BouquetSchema = new Schema<BouquetDocument>({
  name: { type: String, required: true },
  description: String,
  price: Number,
  type: { type: String, enum: ["collection", "special"], required: true },
  size: String,
  image: String,
  status: { type: String, enum: ["ready", "preorder"], default: "ready" },
});

export const Bouquet = model<BouquetDocument>("Bouquet", BouquetSchema);

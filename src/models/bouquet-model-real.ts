import { Schema, model, Types, Document } from "mongoose";

/**
 * Interface bouquet yang dipakai di seluruh project.
 * Tidak perlu lagi DTO terpisah karena frontend kirim FormData.
 */
export interface IBouquet extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  type?: string;
  size?: string;
  image?: string; // path file di server, misalnya "/uploads/xxx.jpg"
  status: "ready" | "preorder";
  collectionName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Schema bouquet untuk MongoDB.
 */
const BouquetSchema = new Schema<IBouquet>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, default: "" },
    size: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: ["ready", "preorder"], default: "ready" },
    collectionName: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Bouquet = model<IBouquet>("Bouquet", BouquetSchema);

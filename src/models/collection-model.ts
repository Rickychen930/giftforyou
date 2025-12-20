// src/models/collection-model.ts

import mongoose, {
  Schema,
  model,
  Types,
  type Model,
  type HydratedDocument,
} from "mongoose";
import type { IBouquet } from "./bouquet-model";

/**
 * Schema shape (do NOT extend Document).
 */
export interface ICollection {
  name: string;
  description?: string;

  // stored in DB as ObjectId refs
  bouquets: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

export type CollectionDocument = HydratedDocument<ICollection>;

/**
 * If you want to return populated bouquets, use this helper type:
 */
export type CollectionPopulated = Omit<ICollection, "bouquets"> & {
  bouquets: IBouquet[];
};

const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
      index: true,
    },
    description: { type: String, default: "", trim: true, maxlength: 300 },
    bouquets: [{ type: Schema.Types.ObjectId, ref: "Bouquet", default: [] }],
  },
  { timestamps: true }
);

CollectionSchema.index({ name: 1 });
CollectionSchema.index({ bouquets: 1 });

/**
 * ✅ Export the REAL mongoose model instance.
 * This is what controllers should import for:
 * - CollectionModel.updateOne(...)
 * - CollectionModel.findOneAndUpdate(...)
 * - CollectionModel.countDocuments(...)
 */
export const CollectionModel: Model<ICollection> =
  (mongoose.models.Collection as Model<ICollection>) ||
  model<ICollection>("Collection", CollectionSchema);

/**
 * ✅ Optional service layer for “business logic”
 * (nice and professional, no conflict with mongoose Model methods)
 */
export class CollectionService {
  static async findWithBouquets(): Promise<CollectionPopulated[]> {
    const docs = await CollectionModel.find()
      .populate("bouquets")
      .lean()
      .exec();

    return docs as unknown as CollectionPopulated[];
  }

  static async createCollection(
    data: Partial<ICollection>
  ): Promise<CollectionDocument> {
    return CollectionModel.create(data);
  }

  static async updateById(
    id: string,
    data: Partial<ICollection>
  ): Promise<CollectionDocument | null> {
    return CollectionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

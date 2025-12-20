// src/models/bouquet-model.ts

import mongoose, {
  Schema,
  model,
  type Model,
  type HydratedDocument,
} from "mongoose";

/**
 * Schema shape (do NOT extend Document here).
 * Mongoose will add _id automatically.
 */
export interface IBouquet {
  name: string;
  description?: string;
  price: number;

  type: "hand-tied" | "vase-arrangement" | "wreath" | "basket" | "bouquet";
  size: "small" | "medium" | "large" | "extra-large";

  occasions: string[];
  flowers: string[];

  image?: string;
  status: "ready" | "preorder";
  quantity?: number;
  collectionName?: string;

  isNewEdition: boolean;
  isFeatured: boolean;

  careInstructions?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type BouquetDocument = HydratedDocument<IBouquet>;

const BouquetSchema = new Schema<IBouquet>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0.01 },

    type: {
      type: String,
      enum: ["hand-tied", "vase-arrangement", "wreath", "basket", "bouquet"],
      default: "bouquet",
      required: true,
    },

    size: {
      type: String,
      enum: ["small", "medium", "large", "extra-large"],
      default: "medium",
      required: true,
    },

    occasions: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 10,
        message: "Occasions array cannot exceed 10 items.",
      },
    },

    flowers: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 20,
        message: "Flowers array cannot exceed 20 items.",
      },
    },

    image: { type: String, default: "", trim: true },
    status: { type: String, enum: ["ready", "preorder"], default: "ready" },

    quantity: { type: Number, default: 0, min: 0 },

    collectionName: { type: String, default: "", trim: true, maxlength: 100 },

    isNewEdition: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    careInstructions: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// Indexes
BouquetSchema.index({ name: 1 });
BouquetSchema.index({ occasions: 1 });
BouquetSchema.index({ flowers: 1 });
BouquetSchema.index({ isNewEdition: 1 });
BouquetSchema.index({ isFeatured: 1 });

/**
 * ✅ The REAL mongoose model instance.
 * Use this in controllers for:
 * - BouquetModel.countDocuments()
 * - BouquetModel.find()
 * - BouquetModel.aggregate()
 */
export const BouquetModel: Model<IBouquet> =
  (mongoose.models.Bouquet as Model<IBouquet>) ||
  model<IBouquet>("Bouquet", BouquetSchema);

/**
 * Optional (professional): a service layer for bouquet-specific queries.
 * This avoids putting business logic directly in controllers.
 */
export class BouquetService {
  static async findNewEditions(): Promise<BouquetDocument[]> {
    return BouquetModel.find({ isNewEdition: true, status: "ready" }).exec();
  }

  static async findFeatured(): Promise<BouquetDocument[]> {
    return BouquetModel.find({ isFeatured: true, status: "ready" }).exec();
  }

  static async createBouquet(
    data: Partial<IBouquet>
  ): Promise<BouquetDocument> {
    const doc = await BouquetModel.create(data);
    return doc;
  }

  static async updateById(
    id: string,
    data: Partial<IBouquet>
  ): Promise<BouquetDocument | null> {
    return BouquetModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

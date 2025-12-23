import mongoose, {
  Schema,
  model,
  type Model,
  type HydratedDocument,
} from "mongoose";

export interface IBouquet {
  name: string;
  description?: string;
  price: number;

  // allow any type string (no enum validation)
  type: string;

  // Title Case sizes
  size:
    | "Extra-Small"
    | "Small"
    | "Medium"
    | "Large"
    | "Extra-Large"
    | "Jumbo";

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

    type: { type: String, default: "bouquet", required: true, trim: true },

    // ✅ FIXED: correct enum values
    size: {
      type: String,
      enum: [
        "Extra-Small",
        "Small",
        "Medium",
        "Large",
        "Extra-Large",
        "Jumbo",
      ],
      default: "Medium",
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

BouquetSchema.index({ name: 1 });
BouquetSchema.index({ occasions: 1 });
BouquetSchema.index({ flowers: 1 });
BouquetSchema.index({ isNewEdition: 1 });
BouquetSchema.index({ isFeatured: 1 });

export const BouquetModel: Model<IBouquet> =
  (mongoose.models.Bouquet as Model<IBouquet>) ||
  model<IBouquet>("Bouquet", BouquetSchema);

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
    return BouquetModel.create(data);
  }

  static async updateById(
    id: string,
    data: Partial<IBouquet>
  ): Promise<BouquetDocument | null> {
    return BouquetModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();
  }
}

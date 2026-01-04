/**
 * Review Model
 * Stores product reviews and ratings
 */

import mongoose, { Schema, model, type Model } from "mongoose";

export interface IReview {
  bouquetId: string;
  customerId?: string;
  customerName: string;
  rating: number;
  comment: string;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bouquetId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
      index: true,
    },
    customerId: {
      type: String,
      required: false,
      trim: true,
      maxlength: 64,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ bouquetId: 1, createdAt: -1 });
ReviewSchema.index({ customerId: 1 });

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || model<IReview>("Review", ReviewSchema);


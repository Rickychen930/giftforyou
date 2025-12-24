import mongoose, { Schema, model, type Model } from "mongoose";

export interface ICustomer {
  buyerName: string;
  phoneNumber: string;
  address: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    buyerName: { type: String, required: true, trim: true, maxlength: 120, index: true },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 40, unique: true, index: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ buyerName: 1, createdAt: -1 });

export const CustomerModel: Model<ICustomer> =
  (mongoose.models.Customer as Model<ICustomer>) || model<ICustomer>("Customer", CustomerSchema);

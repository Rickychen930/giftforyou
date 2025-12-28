import mongoose, { Schema, model, type Model } from "mongoose";

export interface IAddress {
  label: string; // e.g., "Rumah", "Kantor", "Alamat Utama"
  address: string;
  isDefault?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ICustomer {
  buyerName: string;
  phoneNumber: string;
  address: string; // Keep for backward compatibility
  addresses?: IAddress[]; // New: multiple addresses
  userId?: string; // Link to User model for authenticated customers
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true, trim: true, maxlength: 50 },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    isDefault: { type: Boolean, default: false },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    buyerName: { type: String, required: true, trim: true, maxlength: 120, index: true },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 40, unique: true, index: true },
    address: { type: String, required: true, trim: true, maxlength: 500 }, // Keep for backward compatibility
    addresses: { type: [AddressSchema], default: [] },
    userId: { type: String, index: true }, // Link to User model
  },
  { timestamps: true }
);

CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ buyerName: 1, createdAt: -1 });
CustomerSchema.index({ userId: 1 });

export const CustomerModel: Model<ICustomer> =
  (mongoose.models.Customer as Model<ICustomer>) || model<ICustomer>("Customer", CustomerSchema);

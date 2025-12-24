import mongoose, { Schema, model, type Model } from "mongoose";

export type OrderProgressStatus =
  | "bertanya"
  | "memesan"
  | "sedang_diproses"
  | "menunggu_driver"
  | "pengantaran"
  | "terkirim";

export type PaymentStatus = "belum_bayar" | "dp" | "sudah_bayar";

export type PaymentMethod =
  | ""
  | "cash"
  | "transfer_bank"
  | "ewallet"
  | "qris"
  | "lainnya";

export type OrderActivityKind =
  | "created"
  | "status"
  | "payment"
  | "delivery"
  | "bouquet"
  | "edit";

export interface IOrderActivity {
  at: Date;
  kind: OrderActivityKind;
  message: string;
}

export interface IOrder {
  customerId?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;

  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;

  orderStatus: OrderProgressStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  downPaymentAmount: number;
  additionalPayment: number;
  deliveryPrice: number;

  totalAmount: number;

  deliveryAt?: Date;

  activity?: IOrderActivity[];

  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: String, required: false, trim: true, maxlength: 64, index: true },
    buyerName: { type: String, required: true, trim: true, maxlength: 120 },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 40 },
    address: { type: String, required: true, trim: true, maxlength: 500 },

    bouquetId: { type: String, required: true, trim: true, maxlength: 64, index: true },
    bouquetName: { type: String, required: true, trim: true, maxlength: 200 },
    bouquetPrice: { type: Number, default: 0, min: 0 },

    orderStatus: {
      type: String,
      enum: [
        "bertanya",
        "memesan",
        "sedang_diproses",
        "menunggu_driver",
        "pengantaran",
        "terkirim",
      ],
      default: "bertanya",
      required: true,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["belum_bayar", "dp", "sudah_bayar"],
      default: "belum_bayar",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["", "cash", "transfer_bank", "ewallet", "qris", "lainnya"],
      default: "",
      trim: true,
      maxlength: 32,
    },

    downPaymentAmount: { type: Number, default: 0, min: 0 },
    additionalPayment: { type: Number, default: 0, min: 0 },
    deliveryPrice: { type: Number, default: 0, min: 0 },

    totalAmount: { type: Number, default: 0, min: 0 },

    deliveryAt: { type: Date, required: false },

    activity: {
      type: [
        {
          at: { type: Date, required: true },
          kind: {
            type: String,
            enum: ["created", "status", "payment", "delivery", "bouquet", "edit"],
            required: true,
          },
          message: { type: String, required: true, trim: true, maxlength: 240 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ deliveryAt: 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const OrderModel: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) || model<IOrder>("Order", OrderSchema);

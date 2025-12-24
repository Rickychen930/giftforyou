import mongoose, { Schema, model, type Model } from "mongoose";

export type AnalyticsEventType = "pageview" | "search" | "bouquet_view";

export interface IAnalyticsEvent {
  type: AnalyticsEventType;

  // anonymous visitor id (for unique visitor counts)
  visitorId?: string;

  // optional payload
  path?: string;
  search?: string;
  term?: string;
  bouquetId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    type: {
      type: String,
      enum: ["pageview", "search", "bouquet_view"],
      required: true,
      index: true,
    },

    path: { type: String, default: "", trim: true, maxlength: 300 },
    search: { type: String, default: "", trim: true, maxlength: 600 },
    term: { type: String, default: "", trim: true, maxlength: 120 },
    bouquetId: { type: String, default: "", trim: true, maxlength: 64, index: true },
    visitorId: { type: String, default: "", trim: true, maxlength: 64, index: true },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ term: 1, createdAt: -1 });
AnalyticsEventSchema.index({ visitorId: 1, createdAt: -1 });

export const AnalyticsEventModel: Model<IAnalyticsEvent> =
  (mongoose.models.AnalyticsEvent as Model<IAnalyticsEvent>) ||
  model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);

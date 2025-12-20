import mongoose, { Schema, model, type Model } from "mongoose";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export interface IHeroSliderContent {
  key: "home-hero";
  heading?: string;
  slides: HeroSlide[];
}

const SlideSchema = new Schema<HeroSlide>(
  {
    id: { type: String, required: true },
    badge: { type: String, default: "" },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    primaryCta: {
      label: { type: String, required: true },
      href: { type: String, required: true },
    },
    secondaryCta: {
      label: { type: String, default: "" },
      href: { type: String, default: "" },
    },
  },
  { _id: false }
);

const HeroSliderSchema = new Schema<IHeroSliderContent>(
  {
    key: { type: String, enum: ["home-hero"], unique: true, required: true },
    heading: { type: String, default: "" },
    slides: { type: [SlideSchema], default: [] },
  },
  { timestamps: true }
);

export const HeroSliderModel: Model<IHeroSliderContent> =
  (mongoose.models.HeroSlider as Model<IHeroSliderContent>) ||
  model<IHeroSliderContent>("HeroSlider", HeroSliderSchema);

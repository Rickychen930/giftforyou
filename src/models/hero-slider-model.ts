import mongoose, { Schema, model, type Model } from "mongoose";

/**
 * Hero Slide Type Definition
 * Enhanced with validation and type safety
 */
export type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

/**
 * Hero Slider Content Interface
 * Represents the complete hero slider configuration
 */
export interface IHeroSliderContent {
  key: "home-hero";
  heading?: string;
  slides: HeroSlide[];
}

/**
 * Validation function for HeroSlide
 * Ensures data integrity
 */
const validateSlide = (slide: HeroSlide): boolean => {
  return (
    typeof slide.id === "string" &&
    slide.id.length > 0 &&
    typeof slide.title === "string" &&
    slide.title.trim().length > 0 &&
    typeof slide.image === "string" &&
    slide.image.trim().length > 0 &&
    slide.primaryCta &&
    typeof slide.primaryCta.label === "string" &&
    slide.primaryCta.label.trim().length > 0 &&
    typeof slide.primaryCta.href === "string" &&
    slide.primaryCta.href.trim().length > 0
  );
};

/**
 * Slide Schema with enhanced validation
 */
const SlideSchema = new Schema<HeroSlide>(
  {
    id: {
      type: String,
      required: [true, "Slide ID is required"],
      trim: true,
      minlength: [1, "Slide ID cannot be empty"],
    },
    badge: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Badge cannot exceed 50 characters"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Subtitle cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: "Image URL cannot be empty",
      },
    },
    primaryCta: {
      label: {
        type: String,
        required: [true, "Primary CTA label is required"],
        trim: true,
        minlength: [1, "Primary CTA label cannot be empty"],
        maxlength: [100, "Primary CTA label cannot exceed 100 characters"],
      },
      href: {
        type: String,
        required: [true, "Primary CTA href is required"],
        trim: true,
        minlength: [1, "Primary CTA href cannot be empty"],
      },
    },
    secondaryCta: {
      label: {
        type: String,
        default: "",
        trim: true,
        maxlength: [100, "Secondary CTA label cannot exceed 100 characters"],
      },
      href: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { _id: false }
);

/**
 * Pre-save validation hook
 */
SlideSchema.pre("validate", function (next) {
  if (!validateSlide(this as HeroSlide)) {
    next(new Error("Invalid slide data"));
  } else {
    next();
  }
});

/**
 * Hero Slider Schema with enhanced validation
 */
const HeroSliderSchema = new Schema<IHeroSliderContent>(
  {
    key: {
      type: String,
      enum: {
        values: ["home-hero"],
        message: "Key must be 'home-hero'",
      },
      unique: true,
      required: [true, "Key is required"],
    },
    heading: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Heading cannot exceed 200 characters"],
    },
    slides: {
      type: [SlideSchema],
      default: [],
      validate: {
        validator: (slides: HeroSlide[]) => {
          if (slides.length === 0) return true; // Allow empty for initialization
          return slides.every(validateSlide);
        },
        message: "All slides must be valid",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save validation for slides array
 */
HeroSliderSchema.pre("save", function (next) {
  if (this.slides && this.slides.length > 0) {
    const allValid = this.slides.every(validateSlide);
    if (!allValid) {
      return next(new Error("One or more slides are invalid"));
    }
  }
  next();
});

/**
 * Hero Slider Model
 * Exported for use in controllers and services
 */
export const HeroSliderModel: Model<IHeroSliderContent> =
  (mongoose.models.HeroSlider as Model<IHeroSliderContent>) ||
  model<IHeroSliderContent>("HeroSlider", HeroSliderSchema);

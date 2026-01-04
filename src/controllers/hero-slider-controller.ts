import type { Request, Response } from "express";
import { HeroSliderModel, type HeroSlide } from "../models/hero-slider-model";

/**
 * Validates hero slide data
 * Follows OOP principles - single responsibility
 */
const validateSlide = (slide: any): slide is HeroSlide => {
  return (
    slide &&
    typeof slide === "object" &&
    typeof slide.id === "string" &&
    slide.id.trim().length > 0 &&
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
 * Validates hero slider content
 */
const validateHeroSliderContent = (body: any): boolean => {
  if (!body || typeof body !== "object") return false;
  
  if (body.heading !== undefined && typeof body.heading !== "string") {
    return false;
  }

  if (!Array.isArray(body.slides)) {
    return false;
  }

  if (body.slides.length === 0) {
    return false; // At least one slide required
  }

  return body.slides.every(validateSlide);
};

/**
 * GET /api/hero-slider/home
 * Returns hero slider data for home page
 * Enhanced error handling and edge cases
 */
export const getHomeHeroSlider = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const doc = await HeroSliderModel.findOne({ key: "home-hero" })
      .lean()
      .exec();

    if (!doc) {
      res.status(200).json(null); // Frontend uses defaultContent fallback
      return;
    }

    // Validate slides before sending
    if (doc.slides && doc.slides.length > 0) {
      const validSlides = doc.slides.filter(validateSlide);
      if (validSlides.length === 0) {
        res.status(200).json(null); // Return null if no valid slides
        return;
      }
      // Return doc with only valid slides
      res.status(200).json({ ...doc, slides: validSlides });
      return;
    }

    res.status(200).json(doc);
  } catch (error) {
    console.error("Error fetching hero slider:", error);
    res.status(500).json({
      error: "Failed to fetch hero slider",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PUT /api/hero-slider/home
 * Upserts hero slider content
 * Enhanced validation and error handling
 */
export const upsertHomeHeroSlider = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { heading, slides } = req.body;

    // Validate input
    if (!validateHeroSliderContent(req.body)) {
      res.status(400).json({
        error: "Invalid hero slider content",
        message:
          "Content must include a valid slides array with at least one slide. Each slide must have id, title, image, and primaryCta.",
      });
      return;
    }

    // Additional validation: ensure unique slide IDs
    const slideIds = slides.map((slide: HeroSlide) => slide.id);
    const uniqueIds = new Set(slideIds);
    if (slideIds.length !== uniqueIds.size) {
      res.status(400).json({
        error: "Duplicate slide IDs",
        message: "All slide IDs must be unique",
      });
      return;
    }

    // Sanitize heading
    const sanitizedHeading =
      heading && typeof heading === "string" ? heading.trim() : "";

    const doc = await HeroSliderModel.findOneAndUpdate(
      { key: "home-hero" },
      {
        $set: {
          heading: sanitizedHeading || undefined,
          slides: slides,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )
      .lean()
      .exec();

    if (!doc) {
      res.status(500).json({
        error: "Failed to save hero slider",
        message: "Database operation failed",
      });
      return;
    }

    res.status(200).json({
      message: "Hero slider updated successfully",
      doc,
    });
  } catch (error) {
    console.error("Error updating hero slider:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        error: "Validation failed",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Failed to update hero slider",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

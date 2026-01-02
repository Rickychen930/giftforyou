/**
 * Hero Slide Controller
 * Backend API controller for managing hero slides
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";
import { HeroSliderModel } from "../../models/hero-slider-model";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Hero Slide Controller Class
 * Manages all hero slide-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const heroSlideController = new (class extends BaseApiController {
  async getHomeHeroSlider(_req: Request, res: Response): Promise<void> {
    try {
      const doc = await HeroSliderModel.findOne({ key: "home-hero" })
        .lean()
        .exec();
      this.sendSuccess(res, doc, "Hero slider retrieved successfully");
      // can be null
    } catch (e) {
      this.sendError(res, e instanceof Error ? e : new Error("Failed to load hero slider"), 500);
    }
  }

  async upsertHomeHeroSlider(req: Request, res: Response): Promise<void> {
    try {
      const { heading, slides } = req.body;

      const doc = await HeroSliderModel.findOneAndUpdate(
        { key: "home-hero" },
        { $set: { heading, slides } },
        { upsert: true, new: true, runValidators: true }
      )
        .lean()
        .exec();

      this.sendSuccess(res, { doc }, "Hero slider updated");
    } catch (e) {
      this.sendError(res, e instanceof Error ? e : new Error("Failed to update hero slider"), 500);
    }
  }
})();

// Export functions for backward compatibility
export const getHomeHeroSlider = heroSlideController.getHomeHeroSlider.bind(heroSlideController);
export const upsertHomeHeroSlider = heroSlideController.upsertHomeHeroSlider.bind(heroSlideController);

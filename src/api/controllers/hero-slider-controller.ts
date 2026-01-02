/**
 * Hero Slider Controller
 * Backend API controller for managing hero sliders
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";
import { HeroSliderModel } from "../../models/hero-slider-model";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Hero Slider Controller Class
 * Manages all hero slider-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const heroSliderController = new (class extends BaseApiController {
  async getHomeHeroSlider(_req: Request, res: Response): Promise<void> {
    try {
      const doc = await HeroSliderModel.findOne({ key: "home-hero" }).lean().exec();
      this.sendSuccess(res, doc, "Hero slider retrieved successfully");
      // can be null -> frontend uses defaultContent fallback
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to get hero slider"), 500);
    }
  }

  async upsertHomeHeroSlider(req: Request, res: Response): Promise<void> {
    try {
      const { heading, slides } = req.body;

      const doc = await HeroSliderModel.findOneAndUpdate(
        { key: "home-hero" },
        { $set: { heading, slides } },
        { upsert: true, new: true, runValidators: true }
      ).lean();

      this.sendSuccess(res, doc, "Hero slider updated");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to update hero slider"), 500);
    }
  }
})();

// Export functions for backward compatibility
export const getHomeHeroSlider = heroSliderController.getHomeHeroSlider.bind(heroSliderController);
export const upsertHomeHeroSlider = heroSliderController.upsertHomeHeroSlider.bind(heroSliderController);

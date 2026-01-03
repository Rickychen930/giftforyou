"use strict";
/**
 * Hero Slider Controller
 * Backend API controller for managing hero sliders
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertHomeHeroSlider = exports.getHomeHeroSlider = void 0;
const hero_slider_model_1 = require("../../models/hero-slider-model");
const BaseApiController_1 = require("./base/BaseApiController");
/**
 * Hero Slider Controller Class
 * Manages all hero slider-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const heroSliderController = new (class extends BaseApiController_1.BaseApiController {
    async getHomeHeroSlider(_req, res) {
        try {
            const doc = await hero_slider_model_1.HeroSliderModel.findOne({ key: "home-hero" }).lean().exec();
            this.sendSuccess(res, doc, "Hero slider retrieved successfully");
            // can be null -> frontend uses defaultContent fallback
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to get hero slider"), 500);
        }
    }
    async upsertHomeHeroSlider(req, res) {
        try {
            const { heading, slides } = req.body;
            const doc = await hero_slider_model_1.HeroSliderModel.findOneAndUpdate({ key: "home-hero" }, { $set: { heading, slides } }, { upsert: true, new: true, runValidators: true }).lean();
            this.sendSuccess(res, doc, "Hero slider updated");
        }
        catch (err) {
            this.sendError(res, err instanceof Error ? err : new Error("Failed to update hero slider"), 500);
        }
    }
})();
// Export functions for backward compatibility
exports.getHomeHeroSlider = heroSliderController.getHomeHeroSlider.bind(heroSliderController);
exports.upsertHomeHeroSlider = heroSliderController.upsertHomeHeroSlider.bind(heroSliderController);
//# sourceMappingURL=hero-slider-controller.js.map
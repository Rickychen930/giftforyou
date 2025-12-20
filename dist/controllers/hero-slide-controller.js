"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertHomeHeroSlider = exports.getHomeHeroSlider = void 0;
const hero_slider_model_1 = require("../models/hero-slider-model");
const getHomeHeroSlider = async (_req, res) => {
    try {
        const doc = await hero_slider_model_1.HeroSliderModel.findOne({ key: "home-hero" })
            .lean()
            .exec();
        res.status(200).json(doc); // can be null
    }
    catch (e) {
        res.status(500).json({ error: "Failed to load hero slider" });
    }
};
exports.getHomeHeroSlider = getHomeHeroSlider;
const upsertHomeHeroSlider = async (req, res) => {
    try {
        const { heading, slides } = req.body;
        const doc = await hero_slider_model_1.HeroSliderModel.findOneAndUpdate({ key: "home-hero" }, { $set: { heading, slides } }, { upsert: true, new: true, runValidators: true })
            .lean()
            .exec();
        res.status(200).json({ message: "Hero slider updated", doc });
    }
    catch (e) {
        res.status(500).json({ error: "Failed to update hero slider" });
    }
};
exports.upsertHomeHeroSlider = upsertHomeHeroSlider;
//# sourceMappingURL=hero-slide-controller.js.map
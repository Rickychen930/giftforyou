"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertHomeHeroSlider = exports.getHomeHeroSlider = void 0;
const hero_slider_model_1 = require("../../models/hero-slider-model");
const getHomeHeroSlider = async (_req, res) => {
    const doc = await hero_slider_model_1.HeroSliderModel.findOne({ key: "home-hero" }).lean().exec();
    res.json(doc); // can be null -> frontend uses defaultContent fallback
};
exports.getHomeHeroSlider = getHomeHeroSlider;
const upsertHomeHeroSlider = async (req, res) => {
    const { heading, slides } = req.body;
    const doc = await hero_slider_model_1.HeroSliderModel.findOneAndUpdate({ key: "home-hero" }, { $set: { heading, slides } }, { upsert: true, new: true, runValidators: true }).lean();
    res.json({ message: "Hero slider updated", doc });
};
exports.upsertHomeHeroSlider = upsertHomeHeroSlider;
//# sourceMappingURL=hero-slider-controller.js.map
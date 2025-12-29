import type { Request, Response } from "express";
import { HeroSliderModel } from "../../models/hero-slider-model";

export const getHomeHeroSlider = async (_req: Request, res: Response) => {
  const doc = await HeroSliderModel.findOne({ key: "home-hero" }).lean().exec();
  res.json(doc); // can be null -> frontend uses defaultContent fallback
};

export const upsertHomeHeroSlider = async (req: Request, res: Response) => {
  const { heading, slides } = req.body;

  const doc = await HeroSliderModel.findOneAndUpdate(
    { key: "home-hero" },
    { $set: { heading, slides } },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  res.json({ message: "Hero slider updated", doc });
};

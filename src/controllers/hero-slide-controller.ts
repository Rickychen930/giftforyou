import type { Request, Response } from "express";
import { HeroSliderModel } from "../models/hero-slider-model";

export const getHomeHeroSlider = async (_req: Request, res: Response) => {
  try {
    const doc = await HeroSliderModel.findOne({ key: "home-hero" })
      .lean()
      .exec();
    res.status(200).json(doc); // can be null
  } catch (e) {
    res.status(500).json({ error: "Failed to load hero slider" });
  }
};

export const upsertHomeHeroSlider = async (req: Request, res: Response) => {
  try {
    const { heading, slides } = req.body;

    const doc = await HeroSliderModel.findOneAndUpdate(
      { key: "home-hero" },
      { $set: { heading, slides } },
      { upsert: true, new: true, runValidators: true }
    )
      .lean()
      .exec();

    res.status(200).json({ message: "Hero slider updated", doc });
  } catch (e) {
    res.status(500).json({ error: "Failed to update hero slider" });
  }
};

import type { Request, Response } from "express";
import type { PipelineStage } from "mongoose";

import { BouquetModel } from "../models/bouquet-model";
import { CollectionModel } from "../models/collection-model";
import { VisitorStatModel } from "../models/visitor-stat-model";

export async function getMetrics(req: Request, res: Response): Promise<void> {
  try {
    const [bouquetsCount, collectionsCount, visitorsCount] = await Promise.all([
      BouquetModel.countDocuments(),
      CollectionModel.countDocuments(),
      getTotalVisitors(),
    ]);

    res.status(200).json({
      visitorsCount,
      collectionsCount,
      bouquetsCount,
    });
  } catch (err) {
    console.error("getMetrics failed:", err);
    res.status(500).json({ error: "Failed to get metrics" });
  }
}

export async function getVisitorStats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const rawDays = req.query.days;
    const parsedDays =
      typeof rawDays === "string" && rawDays.trim().length > 0
        ? Number(rawDays)
        : 30;

    const days = Number.isFinite(parsedDays)
      ? Math.min(Math.max(Math.floor(parsedDays), 1), 365)
      : 30;

    const items = await VisitorStatModel.find({}, { _id: 0, date: 1, dailyCount: 1 })
      .sort({ date: -1 })
      .limit(days)
      .lean()
      .exec();

    const lastNDaysTotal = items.reduce(
      (sum, it) => sum + Number((it as any)?.dailyCount ?? 0),
      0
    );

    res.status(200).json({
      days,
      lastNDaysTotal,
      items,
    });
  } catch (err) {
    console.error("getVisitorStats failed:", err);
    res.status(500).json({ error: "Failed to get visitor stats" });
  }
}

async function getTotalVisitors(): Promise<number> {
  const pipeline: PipelineStage[] = [
    { $group: { _id: null, total: { $sum: "$dailyCount" } } },
  ];

  const result = await VisitorStatModel.aggregate(pipeline);
  return result.length ? Number(result[0].total) : 0;
}

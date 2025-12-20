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

async function getTotalVisitors(): Promise<number> {
  const pipeline: PipelineStage[] = [
    { $group: { _id: null, total: { $sum: "$count" } } },
  ];

  const result = await VisitorStatModel.aggregate(pipeline);
  return result.length ? Number(result[0].total) : 0;
}

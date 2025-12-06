// src/controllers/metrics-controller.ts
import { Request, Response } from "express";
import { Bouquet } from "../models/bouquet-model-real";
import { Collection } from "../models/collection-model"; // pastikan model ada
import { VisitorStat } from "../models/visitor-stat-model";

export async function getMetrics(req: Request, res: Response) {
  try {
    const [bouquetsCount, collectionsCount] = await Promise.all([
      Bouquet.countDocuments(),
      Collection.countDocuments(),
    ]);

    // total visitors (akumulasi semua hari)
    const visitorsAgg = await VisitorStat.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const visitorsCount = visitorsAgg.length ? visitorsAgg[0].total : 0;

    res.json({ visitorsCount, collectionsCount, bouquetsCount });
  } catch (err) {
    console.error("Get metrics failed:", err);
    res.status(500).json({ error: "Failed to get metrics" });
  }
}

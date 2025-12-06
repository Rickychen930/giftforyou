import { Request, Response, NextFunction } from "express";
import { VisitorStat } from "../models/visitor-stat-model";

export async function trackVisitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    await VisitorStat.updateOne(
      { date: today },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Visitor tracking failed:", err);
  }
  next();
}

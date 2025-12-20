import type { Request, Response, NextFunction } from "express";
import { VisitorStatModel } from "../models/visitor-stat-model";

/**
 * Middleware: track site visitors per day.
 * Stores date as "YYYY-MM-DD" and increments dailyCount + totalVisitors.
 */
export async function trackVisitor(
  _req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await VisitorStatModel.updateOne(
      { date: today },
      { $inc: { dailyCount: 1, totalVisitors: 1 } },
      { upsert: true }
    ).exec();
  } catch (err) {
    console.error("Visitor tracking failed:", err);
    // don't block the request
  }

  next();
}

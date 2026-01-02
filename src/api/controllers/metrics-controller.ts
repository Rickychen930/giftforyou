/**
 * Metrics Controller
 * Backend API controller for managing metrics and analytics
 * Extends BaseApiController for common functionality (SOLID, DRY)
 */

import type { Request, Response } from "express";

import { BouquetModel } from "../../models/bouquet-model";
import { CollectionModel } from "../../models/collection-model";
import {
  AnalyticsEventModel,
  type AnalyticsEventType,
} from "../../models/analytics-event-model";
import { BaseApiController } from "./base/BaseApiController";

/**
 * Metrics Controller Class
 * Manages all metrics-related API endpoints
 * Extends BaseApiController to avoid code duplication
 */
const metricsController = new (class extends BaseApiController {
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const [bouquetsCount, collectionsCount, visitorsCount] = await Promise.all([
        BouquetModel.countDocuments(),
        CollectionModel.countDocuments(),
        AnalyticsEventModel.countDocuments({ type: "pageview" }),
      ]);

      this.sendSuccess(res, {
        visitorsCount,
        collectionsCount,
        bouquetsCount,
      }, "Metrics retrieved successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to get metrics"), 500);
    }
  }

  async getVisitorStats(
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

      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const items = await AnalyticsEventModel.aggregate([
        { $match: { type: "pageview", createdAt: { $gte: since } } },
        {
          $project: {
            date: {
              $dateToString: {
                date: "$createdAt",
                format: "%Y-%m-%d",
                timezone: "Asia/Jakarta",
              },
            },
          },
        },
        { $group: { _id: "$date", dailyCount: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: days },
        { $project: { _id: 0, date: "$_id", dailyCount: 1 } },
      ]);

      const lastNDaysTotal = (items ?? []).reduce(
        (sum: number, it: any) => sum + Number(it?.dailyCount ?? 0),
        0
      );

      this.sendSuccess(res, {
        days,
        lastNDaysTotal,
        items,
      }, "Visitor stats retrieved successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to get visitor stats"), 500);
    }
  }

  private clampInt(n: number, min: number, max: number): number {
    return Math.min(Math.max(Math.floor(n), min), max);
  }

  private normalizeTerm(term: unknown): string {
    if (typeof term !== "string") return "";
    return term.trim().slice(0, 120);
  }

  private normalizePath(v: unknown, maxLen: number): string {
    if (typeof v !== "string") return "";
    const s = v.trim();
    if (!s) return "";
    return s.slice(0, maxLen);
  }

  private normalizeVisitorId(v: unknown): string {
    if (typeof v !== "string") return "";
    return v.trim().slice(0, 64);
  }

  async postAnalyticsEvent(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
      }

      const rawType = (req.body?.type ?? "").toString().trim();
      const type: AnalyticsEventType | "" =
        rawType === "pageview" || rawType === "search" || rawType === "bouquet_view"
          ? (rawType as AnalyticsEventType)
          : "";

      if (!type) {
        this.sendSuccess(res, { success: false, error: "Invalid event type" }, "Event processed");
        return;
      }

      const term = this.normalizeTerm(req.body?.term);
      const bouquetId = this.normalizePath(req.body?.bouquetId, 64);
      const path = this.normalizePath(req.body?.path, 300);
      const search = this.normalizePath(req.body?.search, 600);
      const visitorId = this.normalizeVisitorId(req.body?.visitorId);

      if (type === "search" && term.length < 2) {
        this.sendSuccess(res, { success: true, skipped: true }, "Event processed");
        return;
      }

      if (type === "bouquet_view" && !bouquetId) {
        this.sendSuccess(res, { success: true, skipped: true }, "Event processed");
        return;
      }

      await AnalyticsEventModel.create({
        type,
        term,
        bouquetId,
        path,
        search,
        visitorId,
      });

      this.sendSuccess(res, { success: true }, "Event saved");
    } catch (err) {
      // Tracking must never break the app - return success even on error
      this.sendSuccess(res, { success: false, error: "Event not saved" }, "Event processed");
    }
  }

  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const rawDays = req.query.days;
      const parsedDays =
        typeof rawDays === "string" && rawDays.trim().length > 0
          ? Number(rawDays)
          : 30;
      const days = Number.isFinite(parsedDays) ? this.clampInt(parsedDays, 1, 365) : 30;

      const since30d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [topSearchTerms, topBouquetsDays, topBouquets7d, visitHours, pageviews30d] =
        await Promise.all([
          AnalyticsEventModel.aggregate([
            { $match: { type: "search", createdAt: { $gte: since30d } } },
            {
              $project: {
                term: {
                  $toLower: {
                    $trim: { input: "$term" },
                  },
                },
              },
            },
            { $match: { term: { $ne: "" } } },
            { $group: { _id: "$term", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 10 },
            { $project: { _id: 0, term: "$_id", count: 1 } },
          ]),

          AnalyticsEventModel.aggregate([
            { $match: { type: "bouquet_view", createdAt: { $gte: since30d } } },
            {
              $project: {
                bouquetId: {
                  $trim: { input: "$bouquetId" },
                },
              },
            },
            { $match: { bouquetId: { $ne: "" } } },
            { $group: { _id: "$bouquetId", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 5 },
            { $project: { _id: 0, bouquetId: "$_id", count: 1 } },
          ]),

          AnalyticsEventModel.aggregate([
            { $match: { type: "bouquet_view", createdAt: { $gte: since7d } } },
            {
              $project: {
                bouquetId: {
                  $trim: { input: "$bouquetId" },
                },
              },
            },
            { $match: { bouquetId: { $ne: "" } } },
            { $group: { _id: "$bouquetId", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 3 },
            { $project: { _id: 0, bouquetId: "$_id", count: 1 } },
          ]),

          AnalyticsEventModel.aggregate([
            { $match: { type: "pageview", createdAt: { $gte: since30d } } },
            {
              $project: {
                hour: {
                  $toInt: {
                    $dateToString: {
                      date: "$createdAt",
                      format: "%H",
                      timezone: "Asia/Jakarta",
                    },
                  },
                },
              },
            },
            { $group: { _id: "$hour", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 8 },
            { $project: { _id: 0, hour: "$_id", count: 1 } },
          ]),

          AnalyticsEventModel.countDocuments({
            type: "pageview",
            createdAt: { $gte: since30d },
          }),
        ]);

      const uniqueVisitorsAgg = await AnalyticsEventModel.aggregate([
        {
          $match: {
            type: "pageview",
            createdAt: { $gte: since30d },
            visitorId: { $exists: true, $ne: "" },
          },
        },
        { $group: { _id: "$visitorId" } },
        { $count: "unique" },
      ]);
      const uniqueVisitors30d = uniqueVisitorsAgg.length
        ? Number(uniqueVisitorsAgg[0]?.unique ?? 0)
        : 0;
      const uniqueVisitorsAvailable = uniqueVisitors30d > 0;

      this.sendSuccess(res, {
        days,
        pageviews30d: Number(pageviews30d ?? 0),
        topSearchTerms,
        topBouquetsDays,
        topBouquets7d,
        visitHours,
        uniqueVisitors30d,
        uniqueVisitorsAvailable,
      }, "Insights retrieved successfully");
    } catch (err) {
      this.sendError(res, err instanceof Error ? err : new Error("Failed to get insights"), 500);
    }
  }
})();

// Export functions for backward compatibility
export const getMetrics = metricsController.getMetrics.bind(metricsController);
export const getVisitorStats = metricsController.getVisitorStats.bind(metricsController);
export const postAnalyticsEvent = metricsController.postAnalyticsEvent.bind(metricsController);
export const getInsights = metricsController.getInsights.bind(metricsController);

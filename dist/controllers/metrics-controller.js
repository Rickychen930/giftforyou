"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsights = exports.postAnalyticsEvent = exports.getVisitorStats = exports.getMetrics = void 0;
const bouquet_model_1 = require("../models/bouquet-model");
const collection_model_1 = require("../models/collection-model");
const analytics_event_model_1 = require("../models/analytics-event-model");
async function getMetrics(req, res) {
    try {
        const [bouquetsCount, collectionsCount, visitorsCount] = await Promise.all([
            bouquet_model_1.BouquetModel.countDocuments(),
            collection_model_1.CollectionModel.countDocuments(),
            analytics_event_model_1.AnalyticsEventModel.countDocuments({ type: "pageview" }),
        ]);
        res.status(200).json({
            visitorsCount,
            collectionsCount,
            bouquetsCount,
        });
    }
    catch (err) {
        console.error("getMetrics failed:", err);
        res.status(500).json({ error: "Failed to get metrics" });
    }
}
exports.getMetrics = getMetrics;
async function getVisitorStats(req, res) {
    try {
        const rawDays = req.query.days;
        const parsedDays = typeof rawDays === "string" && rawDays.trim().length > 0
            ? Number(rawDays)
            : 30;
        const days = Number.isFinite(parsedDays)
            ? Math.min(Math.max(Math.floor(parsedDays), 1), 365)
            : 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const items = await analytics_event_model_1.AnalyticsEventModel.aggregate([
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
        const lastNDaysTotal = (items ?? []).reduce((sum, it) => sum + Number(it?.dailyCount ?? 0), 0);
        res.status(200).json({
            days,
            lastNDaysTotal,
            items,
        });
    }
    catch (err) {
        console.error("getVisitorStats failed:", err);
        res.status(500).json({ error: "Failed to get visitor stats" });
    }
}
exports.getVisitorStats = getVisitorStats;
const clampInt = (n, min, max) => Math.min(Math.max(Math.floor(n), min), max);
const normalizeTerm = (term) => {
    if (typeof term !== "string")
        return "";
    return term.trim().slice(0, 120);
};
const normalizePath = (v, maxLen) => {
    if (typeof v !== "string")
        return "";
    const s = v.trim();
    if (!s)
        return "";
    return s.slice(0, maxLen);
};
const normalizeVisitorId = (v) => {
    if (typeof v !== "string")
        return "";
    return v.trim().slice(0, 64);
};
async function postAnalyticsEvent(req, res) {
    try {
        const rawType = (req.body?.type ?? "").toString().trim();
        const type = rawType === "pageview" || rawType === "search" || rawType === "bouquet_view"
            ? rawType
            : "";
        if (!type) {
            res.status(400).json({ error: "Invalid event type" });
            return;
        }
        const term = normalizeTerm(req.body?.term);
        const bouquetId = normalizePath(req.body?.bouquetId, 64);
        const path = normalizePath(req.body?.path, 300);
        const search = normalizePath(req.body?.search, 600);
        const visitorId = normalizeVisitorId(req.body?.visitorId);
        if (type === "search" && term.length < 2) {
            res.status(204).end();
            return;
        }
        if (type === "bouquet_view" && !bouquetId) {
            res.status(204).end();
            return;
        }
        await analytics_event_model_1.AnalyticsEventModel.create({
            type,
            term,
            bouquetId,
            path,
            search,
            visitorId,
        });
        res.status(204).end();
    }
    catch (err) {
        // Tracking must never break the app
        console.error("postAnalyticsEvent failed:", err);
        res.status(204).end();
    }
}
exports.postAnalyticsEvent = postAnalyticsEvent;
async function getInsights(req, res) {
    try {
        const rawDays = req.query.days;
        const parsedDays = typeof rawDays === "string" && rawDays.trim().length > 0
            ? Number(rawDays)
            : 30;
        const days = Number.isFinite(parsedDays) ? clampInt(parsedDays, 1, 365) : 30;
        const since30d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [topSearchTerms, topBouquetsDays, topBouquets7d, visitHours, pageviews30d] = await Promise.all([
            analytics_event_model_1.AnalyticsEventModel.aggregate([
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
            analytics_event_model_1.AnalyticsEventModel.aggregate([
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
            analytics_event_model_1.AnalyticsEventModel.aggregate([
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
            analytics_event_model_1.AnalyticsEventModel.aggregate([
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
            analytics_event_model_1.AnalyticsEventModel.countDocuments({
                type: "pageview",
                createdAt: { $gte: since30d },
            }),
        ]);
        const uniqueVisitorsAgg = await analytics_event_model_1.AnalyticsEventModel.aggregate([
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
        res.status(200).json({
            days,
            pageviews30d: Number(pageviews30d ?? 0),
            topSearchTerms,
            topBouquetsDays,
            topBouquets7d,
            visitHours,
            uniqueVisitors30d,
            uniqueVisitorsAvailable,
        });
    }
    catch (err) {
        console.error("getInsights failed:", err);
        res.status(500).json({ error: "Failed to get insights" });
    }
}
exports.getInsights = getInsights;
//# sourceMappingURL=metrics-controller.js.map
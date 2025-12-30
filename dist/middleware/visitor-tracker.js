"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackVisitor = trackVisitor;
const visitor_stat_model_1 = require("../models/visitor-stat-model");
/**
 * Middleware: track site visitors per day.
 * Stores date as "YYYY-MM-DD" and increments dailyCount + totalVisitors.
 */
async function trackVisitor(_req, _res, next) {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        await visitor_stat_model_1.VisitorStatModel.updateOne({ date: today }, { $inc: { dailyCount: 1, totalVisitors: 1 } }, { upsert: true }).exec();
    }
    catch (err) {
        console.error("Visitor tracking failed:", err);
        // don't block the request
    }
    next();
}
//# sourceMappingURL=visitor-tracker.js.map
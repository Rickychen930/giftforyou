"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = void 0;
const bouquet_model_1 = require("../models/bouquet-model");
const collection_model_1 = require("../models/collection-model");
const visitor_stat_model_1 = require("../models/visitor-stat-model");
async function getMetrics(req, res) {
    try {
        const [bouquetsCount, collectionsCount, visitorsCount] = await Promise.all([
            bouquet_model_1.BouquetModel.countDocuments(),
            collection_model_1.CollectionModel.countDocuments(),
            getTotalVisitors(),
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
async function getTotalVisitors() {
    const pipeline = [
        { $group: { _id: null, total: { $sum: "$count" } } },
    ];
    const result = await visitor_stat_model_1.VisitorStatModel.aggregate(pipeline);
    return result.length ? Number(result[0].total) : 0;
}
//# sourceMappingURL=metrics-controller.js.map
/**
 * Trends Analysis Utility
 * Analyzes historical data to show trends and patterns
 */

import type { HistoricalPerformance, HistoricalSeo } from "./analytics-storage";

export interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  dataPoints: Array<{ date: number; value: number }>;
}

export interface PerformanceTrends {
  score: TrendData;
  lcp?: TrendData;
  fid?: TrendData;
  cls?: TrendData;
  fcp?: TrendData;
  ttfb?: TrendData;
}

export interface SeoTrends {
  score: TrendData;
  checks: Array<{
    name: string;
    trend: TrendData;
  }>;
}

/**
 * Calculate trend for a metric
 */
function calculateTrend(
  dataPoints: Array<{ timestamp: number; value: number }>,
  metricName: string
): TrendData | null {
  if (dataPoints.length < 2) return null;

  const sorted = [...dataPoints].sort((a, b) => a.timestamp - b.timestamp);
  const current = sorted[sorted.length - 1].value;
  const previous = sorted[sorted.length - 2].value;

  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  let trend: "up" | "down" | "stable";
  if (Math.abs(changePercent) < 1) {
    trend = "stable";
  } else if (changePercent > 0) {
    // For performance metrics, lower is better, so increase is bad
    trend = metricName === "score" ? "up" : "down";
  } else {
    trend = metricName === "score" ? "down" : "up";
  }

  return {
    metric: metricName,
    current,
    previous,
    change,
    changePercent: Math.abs(changePercent),
    trend,
    dataPoints: sorted.map((p) => ({ date: p.timestamp, value: p.value })),
  };
}

/**
 * Analyze performance trends
 */
export function analyzePerformanceTrends(
  history: HistoricalPerformance[],
  days: number = 30
): PerformanceTrends | null {
  if (history.length < 2) return null;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = history.filter((h) => h.timestamp >= cutoff);

  if (recent.length < 2) return null;

  const trends: Partial<PerformanceTrends> = {};

  // Score trend
  const scoreData = recent.map((h) => ({
    timestamp: h.timestamp,
    value: h.score,
  }));
  const scoreTrend = calculateTrend(scoreData, "score");
  if (scoreTrend) trends.score = scoreTrend;

  // LCP trend
  const lcpData = recent
    .filter((h) => h.metrics.lcp !== undefined)
    .map((h) => ({
      timestamp: h.timestamp,
      value: h.metrics.lcp!,
    }));
  if (lcpData.length >= 2) {
    const lcpTrend = calculateTrend(lcpData, "lcp");
    if (lcpTrend) trends.lcp = lcpTrend;
  }

  // FID trend
  const fidData = recent
    .filter((h) => h.metrics.fid !== undefined)
    .map((h) => ({
      timestamp: h.timestamp,
      value: h.metrics.fid!,
    }));
  if (fidData.length >= 2) {
    const fidTrend = calculateTrend(fidData, "fid");
    if (fidTrend) trends.fid = fidTrend;
  }

  // CLS trend
  const clsData = recent
    .filter((h) => h.metrics.cls !== undefined)
    .map((h) => ({
      timestamp: h.timestamp,
      value: h.metrics.cls!,
    }));
  if (clsData.length >= 2) {
    const clsTrend = calculateTrend(clsData, "cls");
    if (clsTrend) trends.cls = clsTrend;
  }

  // FCP trend
  const fcpData = recent
    .filter((h) => h.metrics.fcp !== undefined)
    .map((h) => ({
      timestamp: h.timestamp,
      value: h.metrics.fcp!,
    }));
  if (fcpData.length >= 2) {
    const fcpTrend = calculateTrend(fcpData, "fcp");
    if (fcpTrend) trends.fcp = fcpTrend;
  }

  // TTFB trend
  const ttfbData = recent
    .filter((h) => h.metrics.ttfb !== undefined)
    .map((h) => ({
      timestamp: h.timestamp,
      value: h.metrics.ttfb!,
    }));
  if (ttfbData.length >= 2) {
    const ttfbTrend = calculateTrend(ttfbData, "ttfb");
    if (ttfbTrend) trends.ttfb = ttfbTrend;
  }

  return trends as PerformanceTrends;
}

/**
 * Analyze SEO trends
 */
export function analyzeSeoTrends(
  history: HistoricalSeo[],
  days: number = 30
): SeoTrends | null {
  if (history.length < 2) return null;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = history.filter((h) => h.timestamp >= cutoff);

  if (recent.length < 2) return null;

  // Score trend
  const scoreData = recent.map((h) => ({
    timestamp: h.timestamp,
    value: h.analysis.score,
  }));
  const scoreTrend = calculateTrend(scoreData, "score");
  if (!scoreTrend) return null;

  // Check trends
  const checkTrends: Array<{ name: string; trend: TrendData }> = [];
  const checkNames = new Set<string>();
  
  recent.forEach((h) => {
    h.analysis.checks.forEach((check) => {
      checkNames.add(check.name);
    });
  });

  checkNames.forEach((checkName) => {
    const checkData = recent
      .map((h) => {
        const check = h.analysis.checks.find((c) => c.name === checkName);
        if (!check) return null;
        const value = check.status === "pass" ? 1 : check.status === "warning" ? 0.5 : 0;
        return {
          timestamp: h.timestamp,
          value,
        };
      })
      .filter((d): d is { timestamp: number; value: number } => d !== null);

    if (checkData.length >= 2) {
      const trend = calculateTrend(checkData, checkName);
      if (trend) {
        checkTrends.push({ name: checkName, trend });
      }
    }
  });

  return {
    score: scoreTrend,
    checks: checkTrends,
  };
}

/**
 * Get average values for a period
 */
export function getAverageMetrics(
  history: HistoricalPerformance[],
  days: number = 7
): Partial<Record<string, number>> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = history.filter((h) => h.timestamp >= cutoff);

  if (recent.length === 0) return {};

  const averages: Record<string, number[]> = {};

  recent.forEach((h) => {
    if (h.metrics.lcp !== undefined) {
      averages.lcp = averages.lcp || [];
      averages.lcp.push(h.metrics.lcp);
    }
    if (h.metrics.fid !== undefined) {
      averages.fid = averages.fid || [];
      averages.fid.push(h.metrics.fid);
    }
    if (h.metrics.cls !== undefined) {
      averages.cls = averages.cls || [];
      averages.cls.push(h.metrics.cls);
    }
    if (h.metrics.fcp !== undefined) {
      averages.fcp = averages.fcp || [];
      averages.fcp.push(h.metrics.fcp);
    }
    if (h.metrics.ttfb !== undefined) {
      averages.ttfb = averages.ttfb || [];
      averages.ttfb.push(h.metrics.ttfb);
    }
    averages.score = averages.score || [];
    averages.score.push(h.score);
  });

  const result: Record<string, number> = {};
  Object.keys(averages).forEach((key) => {
    const values = averages[key];
    if (values.length > 0) {
      result[key] = values.reduce((a, b) => a + b, 0) / values.length;
    }
  });

  return result;
}


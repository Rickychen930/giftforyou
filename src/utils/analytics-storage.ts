/**
 * Analytics Storage Utility
 * Stores historical performance and SEO data for trends analysis
 */

import type { PerformanceMetrics } from "./performance-monitor";
import type { SeoAnalysis } from "./seo-analyzer";

export interface HistoricalPerformance {
  timestamp: number;
  url: string;
  metrics: PerformanceMetrics;
  score: number;
  grade: string;
}

export interface HistoricalSeo {
  timestamp: number;
  url: string;
  analysis: SeoAnalysis;
}

export interface HistoricalData {
  performance: HistoricalPerformance[];
  seo: HistoricalSeo[];
  lastUpdated: number;
}

const STORAGE_KEY = "analytics.historical";
const MAX_ENTRIES = 1000; // Keep last 1000 entries
const RETENTION_DAYS = 90; // Keep data for 90 days

/**
 * Get historical data from storage
 */
export function getHistoricalData(): HistoricalData {
  if (typeof localStorage === "undefined") {
    return {
      performance: [],
      seo: [],
      lastUpdated: Date.now(),
    };
  }
  try {
    const storage = localStorage as Storage;
    const stored = storage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        performance: [],
        seo: [],
        lastUpdated: Date.now(),
      };
    }

    const data = JSON.parse(stored) as HistoricalData;
    
    // Clean old data
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    data.performance = data.performance.filter((p) => p.timestamp >= cutoff);
    data.seo = data.seo.filter((s) => s.timestamp >= cutoff);

    // Limit entries
    if (data.performance.length > MAX_ENTRIES) {
      data.performance = data.performance.slice(-MAX_ENTRIES);
    }
    if (data.seo.length > MAX_ENTRIES) {
      data.seo = data.seo.slice(-MAX_ENTRIES);
    }

    return data;
  } catch (error) {
    console.error("Failed to get historical data:", error);
    return {
      performance: [],
      seo: [],
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Save performance metrics to history
 */
export function savePerformanceHistory(
  metrics: PerformanceMetrics,
  score: number,
  grade: string,
  url?: string
): void {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    const win = window as Window;
    const storage = localStorage as Storage;
    const data = getHistoricalData();
    const entry: HistoricalPerformance = {
      timestamp: Date.now(),
      url: url || win.location.href,
      metrics,
      score,
      grade,
    };

    data.performance.push(entry);
    data.lastUpdated = Date.now();

    // Clean and limit
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    data.performance = data.performance
      .filter((p) => p.timestamp >= cutoff)
      .slice(-MAX_ENTRIES);

    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save performance history:", error);
  }
}

/**
 * Save SEO analysis to history
 */
export function saveSeoHistory(
  analysis: SeoAnalysis,
  url?: string
): void {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    const win = window as Window;
    const storage = localStorage as Storage;
    const data = getHistoricalData();
    const entry: HistoricalSeo = {
      timestamp: Date.now(),
      url: url || win.location.href,
      analysis,
    };

    data.seo.push(entry);
    data.lastUpdated = Date.now();

    // Clean and limit
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    data.seo = data.seo
      .filter((s) => s.timestamp >= cutoff)
      .slice(-MAX_ENTRIES);

    storage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save SEO history:", error);
  }
}

/**
 * Clear historical data
 */
export function clearHistoricalData(): void {
  if (typeof localStorage === "undefined") return;
  try {
    const storage = localStorage as Storage;
    storage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear historical data:", error);
  }
}

/**
 * Get performance data for a date range
 */
export function getPerformanceHistory(
  startDate?: number,
  endDate?: number
): HistoricalPerformance[] {
  const data = getHistoricalData();
  let filtered = data.performance;

  if (startDate) {
    filtered = filtered.filter((p) => p.timestamp >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((p) => p.timestamp <= endDate);
  }

  return filtered.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Get SEO data for a date range
 */
export function getSeoHistory(
  startDate?: number,
  endDate?: number
): HistoricalSeo[] {
  const data = getHistoricalData();
  let filtered = data.seo;

  if (startDate) {
    filtered = filtered.filter((s) => s.timestamp >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter((s) => s.timestamp <= endDate);
  }

  return filtered.sort((a, b) => a.timestamp - b.timestamp);
}


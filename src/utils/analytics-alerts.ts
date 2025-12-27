/**
 * Analytics Alerts System
 * Monitors performance and SEO metrics and alerts on degradation
 */

import type { PerformanceMetrics } from "./performance-monitor";
import type { SeoAnalysis } from "./seo-analyzer";
import { getPerformanceHistory } from "./analytics-storage";
import { compareWithBenchmark } from "./benchmarks";

export interface Alert {
  id: string;
  type: "performance" | "seo" | "trend";
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  type: "performance" | "seo" | "trend";
  metric: string;
  condition: "above" | "below" | "degradation";
  threshold: number;
  severity: "critical" | "warning" | "info";
  enabled: boolean;
}

const ALERTS_STORAGE_KEY = "analytics.alerts";
const ALERT_RULES_STORAGE_KEY = "analytics.alertRules";

/**
 * Default alert rules
 */
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: "lcp-critical",
    name: "LCP Critical",
    type: "performance",
    metric: "lcp",
    condition: "above",
    threshold: 4000,
    severity: "critical",
    enabled: true,
  },
  {
    id: "fid-critical",
    name: "FID Critical",
    type: "performance",
    metric: "fid",
    condition: "above",
    threshold: 300,
    severity: "critical",
    enabled: true,
  },
  {
    id: "cls-critical",
    name: "CLS Critical",
    type: "performance",
    metric: "cls",
    condition: "above",
    threshold: 0.25,
    severity: "critical",
    enabled: true,
  },
  {
    id: "seo-score-low",
    name: "SEO Score Low",
    type: "seo",
    metric: "score",
    condition: "below",
    threshold: 60,
    severity: "warning",
    enabled: true,
  },
  {
    id: "performance-degradation",
    name: "Performance Degradation",
    type: "trend",
    metric: "score",
    condition: "degradation",
    threshold: 10, // 10% degradation
    severity: "warning",
    enabled: true,
  },
];

/**
 * Get alert rules
 */
export function getAlertRules(): AlertRule[] {
  try {
    const stored = localStorage.getItem(ALERT_RULES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AlertRule[];
    }
    return DEFAULT_ALERT_RULES;
  } catch {
    return DEFAULT_ALERT_RULES;
  }
}

/**
 * Save alert rules
 */
export function saveAlertRules(rules: AlertRule[]): void {
  try {
    localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error("Failed to save alert rules:", error);
  }
}

/**
 * Get alerts
 */
export function getAlerts(): Alert[] {
  try {
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Alert[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save alerts
 */
function saveAlerts(alerts: Alert[]): void {
  try {
    // Keep only last 100 alerts
    const limited = alerts.slice(-100);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error("Failed to save alerts:", error);
  }
}

/**
 * Add alert
 */
export function addAlert(alert: Omit<Alert, "id" | "timestamp" | "acknowledged">): void {
  const alerts = getAlerts();
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    acknowledged: false,
  };

  // Check if similar alert already exists
  const existing = alerts.find(
    (a) =>
      a.type === newAlert.type &&
      a.metric === newAlert.metric &&
      !a.acknowledged &&
      Date.now() - a.timestamp < 3600000 // Within 1 hour
  );

  if (!existing) {
    alerts.push(newAlert);
    saveAlerts(alerts);
  }
}

/**
 * Acknowledge alert
 */
export function acknowledgeAlert(alertId: string): void {
  const alerts = getAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    saveAlerts(alerts);
  }
}

/**
 * Check performance metrics against alert rules
 */
export function checkPerformanceAlerts(
  metrics: PerformanceMetrics,
  score: number
): void {
  const rules = getAlertRules().filter(
    (r) => r.type === "performance" && r.enabled
  );

  rules.forEach((rule) => {
    const value = metrics[rule.metric as keyof PerformanceMetrics] as number | undefined;
    if (value === undefined) return;

    let shouldAlert = false;

    if (rule.condition === "above" && value > rule.threshold) {
      shouldAlert = true;
    } else if (rule.condition === "below" && value < rule.threshold) {
      shouldAlert = true;
    }

    if (shouldAlert) {
      const comparison = compareWithBenchmark(rule.metric, value, "performance");
      const unit = comparison.benchmark && "unit" in comparison.benchmark 
        ? comparison.benchmark.unit 
        : "";
      addAlert({
        type: "performance",
        severity: rule.severity,
        title: rule.name,
        message: `${rule.metric} is ${value}${unit ? ` ${unit}` : ""}, exceeding threshold of ${rule.threshold}`,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
      });
    }
  });
}

/**
 * Check SEO analysis against alert rules
 */
export function checkSeoAlerts(analysis: SeoAnalysis): void {
  const rules = getAlertRules().filter((r) => r.type === "seo" && r.enabled);

  rules.forEach((rule) => {
    let value: number | undefined;
    if (rule.metric === "score") {
      value = analysis.score;
    } else {
      const check = analysis.checks.find((c) => c.name === rule.metric);
      if (check) {
        value = check.status === "pass" ? 1 : check.status === "warning" ? 0.5 : 0;
      }
    }

    if (value === undefined) return;

    let shouldAlert = false;

    if (rule.condition === "above" && value > rule.threshold) {
      shouldAlert = true;
    } else if (rule.condition === "below" && value < rule.threshold) {
      shouldAlert = true;
    }

    if (shouldAlert) {
      addAlert({
        type: "seo",
        severity: rule.severity,
        title: rule.name,
        message: `${rule.metric} is ${value}, ${rule.condition === "below" ? "below" : "above"} threshold of ${rule.threshold}`,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
      });
    }
  });
}

/**
 * Check for performance degradation trends
 */
export function checkTrendAlerts(days: number = 7): void {
  const rules = getAlertRules().filter(
    (r) => r.type === "trend" && r.enabled
  );

  if (rules.length === 0) return;

  const history = getPerformanceHistory();
  if (history.length < 2) return;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = history.filter((h) => h.timestamp >= cutoff);

  if (recent.length < 2) return;

  const oldest = recent[0];
  const newest = recent[recent.length - 1];

  rules.forEach((rule) => {
    if (rule.condition === "degradation") {
      let oldValue: number;
      let newValue: number;

      if (rule.metric === "score") {
        oldValue = oldest.score;
        newValue = newest.score;
      } else {
        oldValue = oldest.metrics[rule.metric as keyof PerformanceMetrics] as number | undefined || 0;
        newValue = newest.metrics[rule.metric as keyof PerformanceMetrics] as number | undefined || 0;
      }

      if (oldValue === 0) return;

      const degradation = ((oldValue - newValue) / oldValue) * 100;

      if (degradation >= rule.threshold) {
        addAlert({
          type: "trend",
          severity: rule.severity,
          title: rule.name,
          message: `${rule.metric} has degraded by ${degradation.toFixed(1)}% over the last ${days} days`,
          metric: rule.metric,
          value: newValue,
          threshold: oldValue,
        });
      }
    }
  });
}

/**
 * Get unacknowledged alerts
 */
export function getUnacknowledgedAlerts(): Alert[] {
  return getAlerts().filter((a) => !a.acknowledged);
}

/**
 * Clear old alerts (older than 30 days)
 */
export function clearOldAlerts(): void {
  const alerts = getAlerts();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const filtered = alerts.filter((a) => a.timestamp >= cutoff);
  saveAlerts(filtered);
}


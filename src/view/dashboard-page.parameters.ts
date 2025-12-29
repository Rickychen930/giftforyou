/**
 * Dashboard Page Parameters
 * Configuration and parameter definitions for Dashboard Page View
 */

import type { ActiveTab } from "../models/dashboard-page-model";
import React from "react";

export interface TabConfig {
  key: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export interface MetricCardConfig {
  label: string;
  variant: "visits" | "info" | "collections" | "bouquets" | "success" | "warning" | "featured";
  iconKey: string;
  valueKey: string;
  noteKey?: string;
}

export interface OverviewActionConfig {
  id: string;
  label: string;
  iconKey: string;
  onClickKey: string;
  variant?: "primary" | "secondary";
  ariaLabel: string;
  title?: string;
  className?: string;
}

export interface PriceItemConfig {
  key: string;
  valueKey: string;
  iconKey: string;
}

export interface RevenueRowConfig {
  key: string;
  valueKey: string;
}

export interface OrderStatusConfig {
  label: string;
  valueKey: string;
}

export interface PaymentStatusConfig {
  label: string;
  valueKey: string;
}

export interface DataQualityItemConfig {
  label: string;
  valueKey: string;
  iconKey: string;
  warningKey: string;
}

export interface PerformanceMetricConfig {
  key: string;
  valueKey: string;
  statusKey?: string;
  format?: "ms" | "bytes" | "number";
}

export interface ExportButtonConfig {
  label: string;
  format: "csv" | "json" | "pdf";
}

export interface CustomerActionConfig {
  label: string;
  iconKey: string;
  onClickKey: string;
  variant: "primary" | "secondary";
  className?: string;
}


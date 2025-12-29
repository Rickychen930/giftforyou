/**
 * Dashboard Page Constants
 * Static data and constants for Dashboard Page View
 */

import type { ActiveTab } from "../models/dashboard-page-model";

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export const QUICK_ACTIONS = (
  onSetActiveTab: (tab: ActiveTab) => void,
  onToggleShow: (key: "showTrends" | "showBenchmarks" | "showNotifications" | "showInventory" | "showAnalytics" | "showQuickActions" | "showSearch" | "showActivityLog" | "showSystemStatus") => void
): QuickAction[] => [
  {
    id: "new-order",
    label: "Order Baru",
    icon: "📦",
    onClick: () => onSetActiveTab("orders"),
    variant: "primary",
  },
  {
    id: "new-bouquet",
    label: "Tambah Bouquet",
    icon: "🌸",
    onClick: () => onSetActiveTab("upload"),
    variant: "primary",
  },
  {
    id: "view-customers",
    label: "Lihat Customers",
    icon: "👤",
    onClick: () => onSetActiveTab("customers"),
  },
  {
    id: "edit-bouquet",
    label: "Edit Bouquet",
    icon: "✏️",
    onClick: () => onSetActiveTab("edit"),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    onClick: () => onSetActiveTab("analytics"),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
    onClick: () => onToggleShow("showNotifications"),
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: "📦",
    onClick: () => onToggleShow("showInventory"),
  },
  {
    id: "system-status",
    label: "System Status",
    icon: "⚙️",
    onClick: () => onToggleShow("showSystemStatus"),
  },
];

export const SKELETON_COUNTS = {
  STATS: 6,
  QUICK_ACTIONS: 6,
} as const;


/**
 * Dashboard Page Static Data
 * Static arrays and data structures for Dashboard Page View
 */

import type { ActiveTab } from "../models/dashboard-page-model";

export interface TabItem {
  key: ActiveTab;
  label: string;
  iconKey: string;
}

export const DASHBOARD_TABS: TabItem[] = [
  { key: "overview", label: "Overview", iconKey: "OverviewIcon" },
  { key: "orders", label: "Orders", iconKey: "OrdersIcon" },
  { key: "customers", label: "Customers", iconKey: "CustomersIcon" },
  { key: "upload", label: "Upload", iconKey: "UploadIcon" },
  { key: "edit", label: "Edit", iconKey: "EditIcon" },
  { key: "hero", label: "Hero", iconKey: "HeroIcon" },
  { key: "analytics", label: "Analytics", iconKey: "AnalyticsIcon" },
];

export interface MetricCardData {
  label: string;
  variant: "visits" | "info" | "collections" | "bouquets" | "success" | "warning" | "featured";
  iconKey: string;
  getValue: (metrics: any) => string | number;
  getNote?: (metrics: any) => string | undefined;
}

export const METRIC_CARDS_CONFIG: MetricCardData[] = [
  {
    label: "Kunjungan (30 hari)",
    variant: "visits",
    iconKey: "VisitsIcon",
    getValue: (m) => m.insightsError ? m.visitorsCount : m.pageviews30d || m.visitorsCount,
  },
  {
    label: "Pengunjung unik (30 hari)",
    variant: "info",
    iconKey: "UsersIcon",
    getValue: (m) => m.insightsError ? "—" : m.uniqueVisitorsAvailable ? m.uniqueVisitors30d : "—",
    getNote: (m) => m.uniqueVisitorsAvailable ? "Berbasis visitorId anonim." : "Mulai terekam setelah update.",
  },
  {
    label: "Koleksi",
    variant: "collections",
    iconKey: "CollectionsIcon",
    getValue: (m) => m.collectionsCount,
  },
  {
    label: "Total bouquet",
    variant: "bouquets",
    iconKey: "BouquetsIcon",
    getValue: (m) => m.bouquets.length,
  },
  {
    label: "Siap",
    variant: "success",
    iconKey: "CheckIcon",
    getValue: (m) => m.readyCount,
    getNote: (m) => `Unit siap: ${m.totalReadyUnits}`,
  },
  {
    label: "Preorder",
    variant: "warning",
    iconKey: "ClockIcon",
    getValue: (m) => m.preorderCount,
  },
  {
    label: "Featured",
    variant: "featured",
    iconKey: "StarIcon",
    getValue: (m) => m.featuredCount,
    getNote: (m) => `New edition: ${m.newEditionCount}`,
  },
];

export interface OverviewActionData {
  id: string;
  label: string;
  iconKey: string;
  onClickKey: string;
  variant?: "primary" | "secondary";
  ariaLabel: string;
  title?: string;
  className?: string;
}

export const OVERVIEW_ACTIONS: OverviewActionData[] = [
  {
    id: "add-bouquet",
    label: "Tambah bouquet",
    iconKey: "AddIcon",
    onClickKey: "upload",
    ariaLabel: "Tambah bouquet baru",
    className: "overviewActionBtn",
  },
  {
    id: "edit-bouquet",
    label: "Buka editor",
    iconKey: "EditIcon",
    onClickKey: "edit",
    ariaLabel: "Buka editor bouquet",
    className: "overviewActionBtn",
  },
  {
    id: "hero-slider",
    label: "Atur hero",
    iconKey: "GridIcon",
    onClickKey: "hero",
    ariaLabel: "Atur hero slider",
    className: "overviewActionBtn",
  },
  {
    id: "copy-overview",
    label: "Salin ringkasan",
    iconKey: "CopyIcon",
    onClickKey: "copyOverview",
    variant: "primary",
    ariaLabel: "Salin ringkasan ke clipboard",
    title: "Ctrl/Cmd + C untuk copy",
    className: "overviewActionBtn overviewActionBtn--primary",
  },
  {
    id: "refresh",
    label: "Refresh",
    iconKey: "RefreshIcon",
    onClickKey: "reloadDashboard",
    ariaLabel: "Muat ulang dashboard",
    title: "Refresh data (Ctrl/Cmd + R)",
    className: "overviewActionBtn",
  },
];

export interface PriceItemData {
  key: string;
  valueKey: string;
  iconKey: string;
}

export const PRICE_ITEMS: PriceItemData[] = [
  { key: "Min", valueKey: "priceMin", iconKey: "MoneyIcon" },
  { key: "Rata-rata", valueKey: "priceAvg", iconKey: "MoneyIcon" },
  { key: "Max", valueKey: "priceMax", iconKey: "MoneyIcon" },
];

export interface RevenueRowData {
  key: string;
  valueKey: string;
}

export const REVENUE_ROWS: RevenueRowData[] = [
  { key: "Total", valueKey: "totalRevenue" },
  { key: "Hari ini", valueKey: "todayRevenue" },
  { key: "Bulan ini", valueKey: "thisMonthRevenue" },
  { key: "Rata-rata order", valueKey: "averageOrderValue" },
];

export interface OrderRowData {
  key: string;
  valueKey: string;
}

export const ORDER_ROWS: OrderRowData[] = [
  { key: "Total", valueKey: "totalOrders" },
  { key: "Hari ini", valueKey: "todayOrders" },
  { key: "Bulan ini", valueKey: "thisMonthOrders" },
];

export interface OrderStatusData {
  label: string;
  valueKey: string;
}

export const ORDER_STATUS_ITEMS: OrderStatusData[] = [
  { label: "Pending", valueKey: "pendingOrders" },
  { label: "Processing", valueKey: "processingOrders" },
  { label: "Completed", valueKey: "completedOrders" },
];

export interface PaymentStatusData {
  label: string;
  valueKey: string;
}

export const PAYMENT_STATUS_ITEMS: PaymentStatusData[] = [
  { label: "Belum Bayar", valueKey: "unpaidOrders" },
  { label: "Sudah Bayar", valueKey: "paidOrders" },
];

export interface DataQualityItemData {
  label: string;
  valueKey: string;
  iconKey: string;
  warningKey: string;
}

export const DATA_QUALITY_ITEMS: DataQualityItemData[] = [
  {
    label: "Tanpa gambar",
    valueKey: "missingImageCount",
    iconKey: "ImageIcon",
    warningKey: "missingImageCount",
  },
  {
    label: "Tanpa koleksi",
    valueKey: "missingCollectionCount",
    iconKey: "CollectionGridIcon",
    warningKey: "missingCollectionCount",
  },
  {
    label: "Ready qty 0",
    valueKey: "zeroQtyReadyCount",
    iconKey: "InfoIcon",
    warningKey: "zeroQtyReadyCount",
  },
];

export interface PerformanceMetricData {
  key: string;
  valueKey: string;
  statusKey?: string;
  format?: "ms" | "bytes" | "number";
}

export const PERFORMANCE_METRICS: PerformanceMetricData[] = [
  { key: "First Contentful Paint", valueKey: "fcp", format: "ms" },
  { key: "Largest Contentful Paint", valueKey: "lcp", statusKey: "lcp", format: "ms" },
  { key: "First Input Delay", valueKey: "fid", statusKey: "fid", format: "ms" },
  { key: "Cumulative Layout Shift", valueKey: "cls", statusKey: "cls", format: "number" },
  { key: "Time to First Byte", valueKey: "ttfb", format: "ms" },
  { key: "Load Complete", valueKey: "loadComplete", format: "ms" },
  { key: "Total Resources", valueKey: "totalResources", format: "bytes" },
];

export interface ExportButtonData {
  label: string;
  format: "csv" | "json" | "pdf";
}

export const EXPORT_BUTTONS: ExportButtonData[] = [
  { label: "Export CSV", format: "csv" },
  { label: "Export JSON", format: "json" },
  { label: "Export PDF", format: "pdf" },
];

export interface CustomerActionData {
  label: string;
  iconKey: string;
  onClickKey: string;
  variant: "primary" | "secondary";
  className?: string;
}

export const CUSTOMER_ACTIONS: CustomerActionData[] = [
  {
    label: "Kelola Customers",
    iconKey: "ArrowRightIcon",
    onClickKey: "customers",
    variant: "secondary",
    className: "overviewActionBtn",
  },
  {
    label: "Inventory",
    iconKey: "InventoryIcon",
    onClickKey: "showInventory",
    variant: "secondary",
    className: "overviewActionBtn",
  },
  {
    label: "Analytics",
    iconKey: "AnalyticsIcon",
    onClickKey: "showAnalytics",
    variant: "primary",
    className: "overviewActionBtn overviewActionBtn--primary",
  },
];


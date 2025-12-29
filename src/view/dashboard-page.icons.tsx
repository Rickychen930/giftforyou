/**
 * Dashboard Page Icons
 * SVG icon components for Dashboard Page View
 */

import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AddIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const GridIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 16H3v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const VisitsIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
    <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
  </svg>
);

export const CollectionsIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
  </svg>
);

export const BouquetsIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
  </svg>
);

export const MoneyIcon: React.FC<IconProps> = ({ width = 14, height = 14, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const RevenueIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const OrdersIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CustomersIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const InventoryIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AnalyticsIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ width = 14, height = 14, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CollectionGridIcon: React.FC<IconProps> = ({ width = 14, height = 14, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ width = 14, height = 14, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const PerformanceIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SeoIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const AlertIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ width = 16, height = 16, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const NotificationIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ width = 20, height = 20, className, style }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


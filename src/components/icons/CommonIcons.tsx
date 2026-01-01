/**
 * Common Icons Library
 * Reusable icon components for common UI elements
 * Uses base Icon component
 */

import React from "react";
import Icon, { IconProps } from "./Icon";

/**
 * Arrow/Chevron Icons
 */
export const ArrowLeftIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const ArrowRightIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const ChevronDownIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const ChevronUpIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

/**
 * Action Icons
 */
export const CloseIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
  </Icon>
);

export const CheckIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const EditIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const DeleteIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m4 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const SaveIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21v-8H7v8M7 3v5h8" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const CopyIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M8 8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2H8z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const ExportIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const DownloadIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

/**
 * Search & Filter Icons
 */
export const SearchIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
  </Icon>
);

export const FilterIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

/**
 * Status Icons
 */
export const CheckCircleIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="10" />
  </Icon>
);

export const ErrorIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
  </Icon>
);

export const WarningIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinejoin="round" />
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
  </Icon>
);

export const InfoIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
  </Icon>
);

/**
 * Communication Icons
 */
export const PhoneIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const MailIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

/**
 * User Icons
 */
export const UserIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const UsersIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

/**
 * Loading/Spinner Icon
 */
export const SpinnerIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" opacity="0.75" />
  </Icon>
);

/**
 * Collection/Box Icons
 */
export const CollectionIcon: React.FC<Omit<IconProps, "children">> = (props) => (
  <Icon {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);


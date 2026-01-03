/**
 * Error Display Model (OOP)
 * Type definitions and interfaces for error display component
 * Follows Single Responsibility Principle
 */

/**
 * Error severity levels
 */
export type ErrorSeverity = "error" | "warning" | "info";

/**
 * Error action configuration
 */
export interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
  ariaLabel?: string;
}

/**
 * Error display configuration
 */
export interface ErrorDisplayConfig {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  icon?: React.ReactNode;
  actions?: ErrorAction[];
  showRetry?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  maxWidth?: string;
}

/**
 * Default error messages by severity
 */
export class ErrorDisplayDefaults {
  static readonly TITLES: Record<ErrorSeverity, string> = {
    error: "Terjadi Kesalahan",
    warning: "Peringatan",
    info: "Informasi",
  };

  static readonly RETRY_LABEL = "Coba Lagi";
  static readonly DEFAULT_MAX_WIDTH = "820px";
}

/**
 * Error display state
 */
export interface ErrorDisplayState {
  isRetrying: boolean;
  retryCount: number;
}


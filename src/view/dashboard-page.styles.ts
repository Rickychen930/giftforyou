/**
 * Dashboard Page Styles
 * Centralized style constants to replace inline styles
 */

export const DASHBOARD_STYLES = {
  // Icon styles
  ICON_SMALL: { width: 14, height: 14 },
  ICON_MEDIUM: { width: 16, height: 16 },
  ICON_LARGE: { width: 18, height: 18 },
  ICON_HEADER: { width: 20, height: 20 },
  ICON_METRIC: { width: 24, height: 24 },
  ICON_OPACITY: { opacity: 0.8 },
  ICON_OPACITY_LOW: { opacity: 0.6 },
  ICON_MARGIN: { marginRight: "0.5rem" },
  ICON_MARGIN_SMALL: { marginRight: "0.4rem" },

  // Layout styles
  FLEX_COLUMN: { display: "flex", flexDirection: "column" },
  FLEX_ROW: { display: "flex", gap: "0.5rem", flexWrap: "wrap" },
  FLEX_ROW_SMALL_GAP: { display: "flex", gap: "0.2rem" },
  FLEX_FULL_WIDTH: { width: "100%", justifyContent: "center" },

  // Spacing
  MARGIN_TOP: { marginTop: "1rem" },
  MARGIN_TOP_SMALL: { marginTop: "0.5rem" },
  PADDING_TOP: { paddingTop: "1rem" },
  PADDING_TOP_SMALL: { paddingTop: "0.5rem" },
  GAP_SMALL: { gap: "0.5rem" },
  GAP_TINY: { gap: "0.2rem" },

  // Borders
  BORDER_TOP: { borderTop: "1px solid rgba(0,0,0,0.1)" },

  // Typography
  FONT_SMALL: { fontSize: "0.9rem" },
  FONT_XSMALL: { fontSize: "0.85rem" },
  FONT_XXSMALL: { fontSize: "0.75rem" },
  FONT_WEIGHT_BOLD: { fontWeight: 700 },
  FONT_WEIGHT_EXTRA_BOLD: { fontWeight: 800 },
  LINE_HEIGHT: { lineHeight: "1.6" },

  // Colors
  TEXT_MUTED: { color: "var(--dash-text-muted)" },
  TEXT_ERROR: { color: "var(--error-text)" },

  // Layout combinations
  SECTION_DIVIDER: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  RECOMMENDATIONS_CONTAINER: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  TRENDS_CONTAINER: {
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(0,0,0,0.1)",
  },
  RANK_ITEM_CONTAINER: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    minWidth: 0,
  },
  SEO_CHECKS_CONTAINER: {
    marginTop: "1rem",
  },
  EXPORT_BUTTONS_CONTAINER: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },
  ALERTS_CONTAINER: {
    marginTop: "1rem",
  },
  RECOMMENDATIONS_LIST: {
    margin: 0,
    paddingLeft: "1.25rem",
    fontSize: "0.85rem",
    lineHeight: "1.6",
  },
  RECOMMENDATIONS_ITEM: {
    marginBottom: "0.4rem",
  },
  RECOMMENDATIONS_TITLE: {
    fontWeight: 800,
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  TRENDS_TITLE: {
    fontWeight: 800,
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  },
  TRENDS_ITEM: {
    marginBottom: "0.5rem",
    fontSize: "0.85rem",
  },
  TRENDS_LABEL: {
    fontWeight: 700,
  },
  ERROR_TEXT: {
    color: "var(--error-text)",
    fontSize: "0.9rem",
    textAlign: "left" as const,
  },
  RANK_REVENUE_TEXT: {
    fontSize: "0.75rem",
    color: "var(--dash-text-muted)",
    fontWeight: 700,
  },
  ALERT_MORE_TEXT: {
    fontSize: "0.85rem",
    color: "var(--ink-550)",
    marginTop: "0.5rem",
  },
  ICON_WITH_MARGIN_OPACITY: {
    marginRight: "0.5rem",
    opacity: 0.8,
  },
  ICON_WITH_MARGIN_SMALL_OPACITY_LOW: {
    marginRight: "0.4rem",
    opacity: 0.6,
  },
} as const;


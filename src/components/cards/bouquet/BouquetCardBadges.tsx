/**
 * Bouquet Card Badges Component
 * Reusable badges for bouquet cards
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and fully responsive
 */

import React, { Component } from "react";
import "../../../styles/cards/bouquet/BouquetCardBadges.css";

export interface BouquetCardBadgesProps {
  isFeatured?: boolean;
  isNewEdition?: boolean;
  status: "ready" | "preorder";
  statusLabel: string;
}

interface BouquetCardBadgesState {
  // No state needed, but keeping for consistency
}

/**
 * Bouquet Card Badges Component
 * Displays featured/new badges and status badge
 * Follows Single Responsibility Principle: only handles badge rendering
 */
export class BouquetCardBadges extends Component<BouquetCardBadgesProps, BouquetCardBadgesState> {
  private baseClass: string = "bouquet-card-badges";

  private renderFeaturedBadge(): React.ReactNode {
    return (
      <span
        className={`${this.baseClass}__badge ${this.baseClass}__badge--featured`}
        aria-label="Bouquet featured"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
          />
        </svg>
        Featured
      </span>
    );
  }

  private renderNewBadge(): React.ReactNode {
    return (
      <span className={`${this.baseClass}__badge ${this.baseClass}__badge--new`} aria-label="Bouquet baru">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Baru
      </span>
    );
  }

  private renderStatusBadge(): React.ReactNode {
    const { status, statusLabel } = this.props;
    return (
      <span
        className={`${this.baseClass}__badge ${this.baseClass}__badge--status ${
          status === "ready" ? "is-ready" : "is-preorder"
        }`}
        aria-label={`Status: ${statusLabel}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {status === "ready" ? (
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {statusLabel}
      </span>
    );
  }

  render(): React.ReactNode {
    const { isFeatured, isNewEdition } = this.props;

    return (
      <div className={this.baseClass}>
        {/* Top Left - Featured/New Badges */}
        {(isFeatured || isNewEdition) && (
          <div className={`${this.baseClass}__top-left`}>
            {isFeatured && this.renderFeaturedBadge()}
            {isNewEdition && !isFeatured && this.renderNewBadge()}
          </div>
        )}

        {/* Top Right - Status Badge */}
        <div className={`${this.baseClass}__top-right`}>{this.renderStatusBadge()}</div>
      </div>
    );
  }
}

export default BouquetCardBadges;


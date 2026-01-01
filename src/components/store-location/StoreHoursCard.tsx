/**
 * Store Hours Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/store-location/StoreHoursCard.css";
import StoreLocationCard from "./StoreLocationCard";
import type { StoreHours } from "../../models/store-model";

export interface StoreHoursCardProps {
  hours: StoreHours;
}

interface StoreHoursCardState {
  // No state needed, but keeping for consistency
}

/**
 * Store Hours Card Component
 * Class-based component for store hours card
 */
class StoreHoursCard extends Component<StoreHoursCardProps, StoreHoursCardState> {
  private baseClass: string = "store-hours-card";

  private renderClockIcon(): React.ReactNode {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { hours } = this.props;

    return (
      <StoreLocationCard icon={this.renderClockIcon()} title="Jam Operasional" variant="hours">
        <p className={`${this.baseClass}__time`}>{hours.weekdays}</p>
        <p className={`${this.baseClass}__time`}>{hours.saturday}</p>
        <p className={`${this.baseClass}__time ${this.baseClass}__time--closed`}>
          {hours.sunday}
        </p>
      </StoreLocationCard>
    );
  }
}

export default StoreHoursCard;

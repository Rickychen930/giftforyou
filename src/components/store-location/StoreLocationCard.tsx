/**
 * Store Location Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/store-location/StoreLocationCard.css";

export interface StoreLocationCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: "location" | "contact" | "hours";
  className?: string;
}

interface StoreLocationCardState {
  // No state needed, but keeping for consistency
}

/**
 * Store Location Card Component
 * Class-based component for store location card
 */
class StoreLocationCard extends Component<StoreLocationCardProps, StoreLocationCardState> {
  private baseClass: string = "store-location-card";

  render(): React.ReactNode {
    const { icon, title, children, variant = "location", className = "" } = this.props;

    return (
      <div className={`${this.baseClass} ${this.baseClass}--${variant} ${className}`}>
        <div className={`${this.baseClass}__icon`}>{icon}</div>
        <h3 className={`${this.baseClass}__title`}>{title}</h3>
        <div className={`${this.baseClass}__content`}>{children}</div>
      </div>
    );
  }
}

export default StoreLocationCard;

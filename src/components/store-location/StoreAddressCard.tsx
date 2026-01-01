/**
 * Store Address Card Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/store-location/StoreAddressCard.css";
import StoreLocationCard from "./StoreLocationCard";
import CopyButton from "../common/CopyButton";

export interface StoreAddressCardProps {
  name: string;
  address: string;
  city: string;
  mapDirectionsUrl?: string;
}

interface StoreAddressCardState {
  // No state needed, but keeping for consistency
}

/**
 * Store Address Card Component
 * Class-based component for store address card
 */
class StoreAddressCard extends Component<StoreAddressCardProps, StoreAddressCardState> {
  private baseClass: string = "store-address-card";

  private getFullAddress(): string {
    const { address, city } = this.props;
    return [address, city].filter(Boolean).join(", ");
  }

  private renderLocationIcon(): React.ReactNode {
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
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { name, address, city, mapDirectionsUrl } = this.props;
    const fullAddress = this.getFullAddress();

    return (
      <StoreLocationCard icon={this.renderLocationIcon()} title={name} variant="location">
        <p className={`${this.baseClass}__address`}>{address}</p>
        <p className={`${this.baseClass}__city`}>{city}</p>

        <div className={`${this.baseClass}__actions`}>
          <CopyButton
            text={fullAddress}
            label="Salin alamat"
            copiedLabel="Tersalin"
            size="sm"
            className={`${this.baseClass}__copy-btn`}
          />

          {mapDirectionsUrl && (
            <a
              href={mapDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${this.baseClass}__directions-btn`}
              aria-label="Petunjuk arah ke toko"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 11l19-9-9 19-2-8-8-2z" />
              </svg>
              Petunjuk Arah
            </a>
          )}
        </div>
      </StoreLocationCard>
    );
  }
}

export default StoreAddressCard;

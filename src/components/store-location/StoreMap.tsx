/**
 * Store Map Component
 * Reusable map display component
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and fully responsive
 */

import React, { Component } from "react";
import "../../styles/store-location/StoreMap.css";

export interface StoreMapProps {
  embedUrl: string;
  directionsUrl?: string;
  title?: string;
  className?: string;
}

interface StoreMapState {
  mapLoaded: boolean;
}

/**
 * Store Map Component
 * Displays Google Maps embed with optional directions button
 * Follows Single Responsibility Principle: only handles map rendering
 */
export class StoreMap extends Component<StoreMapProps, StoreMapState> {
  private baseClass: string = "store-map";

  constructor(props: StoreMapProps) {
    super(props);
    this.state = {
      mapLoaded: false,
    };
  }

  private handleMapLoad = (): void => {
    this.setState({ mapLoaded: true });
  };

  render(): React.ReactNode {
    const { embedUrl, directionsUrl, title, className = "" } = this.props;
    const { mapLoaded } = this.state;

    return (
      <div className={`${this.baseClass} ${className}`}>
        {title && (
          <h3 className={`${this.baseClass}__title`} id="store-map-title">
            {title}
          </h3>
        )}
        <div className={`${this.baseClass}__container`}>
          {!mapLoaded && (
            <div className={`${this.baseClass}__skeleton`} aria-hidden="true">
              <div className={`${this.baseClass}__skeleton-shimmer`} />
            </div>
          )}
          <iframe
            src={embedUrl}
            title={title || "Store location map"}
            className={`${this.baseClass}__iframe ${mapLoaded ? "is-loaded" : ""}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={this.handleMapLoad}
            aria-label="Store location on Google Maps"
          />
        </div>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${this.baseClass}__directions-btn`}
            aria-label="Buka petunjuk arah di Google Maps"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 11l19-9-9 19-2-8-8-2z" />
            </svg>
            Buka di Google Maps
          </a>
        )}
      </div>
    );
  }
}

export default StoreMap;


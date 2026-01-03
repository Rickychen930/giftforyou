/**
 * Bouquet Card Media Component
 * Reusable media section for bouquet cards
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and fully responsive
 */

import React, { Component, RefObject } from "react";
import { Link } from "react-router-dom";
import "../../../styles/cards/bouquet/BouquetCardMedia.css";

export interface BouquetCardMediaProps {
  imageUrl: string;
  imageAlt: string;
  detailHref: string;
  imageLoaded: boolean;
  imageError: boolean;
  onImageLoad?: () => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  imageRef?: RefObject<HTMLImageElement>;
  bouquetId?: string;
}

interface BouquetCardMediaState {
  // No state needed, but keeping for consistency
}

/**
 * Bouquet Card Media Component
 * Handles image display with loading states
 * Follows Single Responsibility Principle: only handles media rendering
 */
export class BouquetCardMedia extends Component<BouquetCardMediaProps, BouquetCardMediaState> {
  private baseClass: string = "bouquet-card-media";
  private imageRef: RefObject<HTMLImageElement>;

  constructor(props: BouquetCardMediaProps) {
    super(props);
    this.imageRef = React.createRef();
  }

  render(): React.ReactNode {
    const { imageUrl, imageAlt, detailHref, imageLoaded, imageError, onImageLoad, onImageError, imageRef, bouquetId } =
      this.props;

    // Use provided ref or internal ref
    const imgRef = imageRef || this.imageRef;

    return (
      <div className={this.baseClass}>
        <Link
          to={detailHref}
          className={`${this.baseClass}__link`}
          aria-label={`Lihat detail ${imageAlt}`}
        >
          {!imageLoaded && (
            <div className={`${this.baseClass}__skeleton`} aria-hidden="true">
              <div className={`${this.baseClass}__skeleton-shimmer`} />
            </div>
          )}
          <img
            ref={imgRef}
            data-bouquet-id={bouquetId}
            src={imageLoaded ? imageUrl : undefined}
            data-src={!imageLoaded ? imageUrl : undefined}
            alt={imageAlt}
            className={`${this.baseClass}__image ${imageLoaded ? "is-loaded" : ""} ${imageError ? "is-error" : ""}`}
            loading="lazy"
            decoding="async"
            onLoad={onImageLoad}
            onError={onImageError}
          />
          <div className={`${this.baseClass}__overlay`} aria-hidden="true" />
        </Link>
      </div>
    );
  }
}

export default BouquetCardMedia;


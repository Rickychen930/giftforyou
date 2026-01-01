/**
 * Store Social Links Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/store-location/StoreSocialLinks.css";
import { SocialIcon } from "../icons/SocialIcons";

export interface StoreSocialLinksProps {
  instagram?: string;
  tiktok?: string;
  className?: string;
}

interface StoreSocialLinksState {
  // No state needed, but keeping for consistency
}

/**
 * Store Social Links Component
 * Class-based component for store social links
 */
class StoreSocialLinks extends Component<StoreSocialLinksProps, StoreSocialLinksState> {
  private baseClass: string = "store-social-links";

  render(): React.ReactNode {
    const { instagram, tiktok, className = "" } = this.props;

    if (!instagram && !tiktok) return null;

    return (
      <div className={`${this.baseClass} ${className}`}>
        <p className={`${this.baseClass}__title`}>Follow Us</p>
        <div className={`${this.baseClass}__row`}>
          {instagram && (
            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={`${this.baseClass}__icon ${this.baseClass}__icon--instagram`}
              aria-label="Follow us on Instagram"
            >
              <SocialIcon name="Instagram" className={`${this.baseClass}__icon-svg`} />
            </a>
          )}
          {tiktok && (
            <a
              href={tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className={`${this.baseClass}__icon ${this.baseClass}__icon--tiktok`}
              aria-label="Follow us on TikTok"
            >
              <SocialIcon name="TikTok" className={`${this.baseClass}__icon-svg`} />
            </a>
          )}
        </div>
      </div>
    );
  }
}

export default StoreSocialLinks;

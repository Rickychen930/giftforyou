import React from "react";
import "../../styles/store-location/StoreSocialLinks.css";
import { SocialIcon } from "../icons/SocialIcons";

export interface StoreSocialLinksProps {
  instagram?: string;
  tiktok?: string;
  className?: string;
}

const StoreSocialLinks: React.FC<StoreSocialLinksProps> = ({
  instagram,
  tiktok,
  className = "",
}) => {
  if (!instagram && !tiktok) return null;

  return (
    <div className={`store-social-links ${className}`}>
      <p className="store-social-links__title">Follow Us</p>
      <div className="store-social-links__row">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="store-social-links__icon store-social-links__icon--instagram"
            aria-label="Follow us on Instagram"
          >
            <SocialIcon name="Instagram" className="store-social-links__icon-svg" />
          </a>
        )}
        {tiktok && (
          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="store-social-links__icon store-social-links__icon--tiktok"
            aria-label="Follow us on TikTok"
          >
            <SocialIcon name="TikTok" className="store-social-links__icon-svg" />
          </a>
        )}
      </div>
    </div>
  );
};

export default StoreSocialLinks;


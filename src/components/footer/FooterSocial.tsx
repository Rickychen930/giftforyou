/**
 * Footer Social Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/footer/FooterSocial.css";
import { SOCIAL_MEDIA, type SocialPlatform } from "../../constants/app-constants";
import { SocialIcon } from "../icons/SocialIcons";

interface FooterSocialState {
  // No state needed, but keeping for consistency
}

/**
 * Footer Social Component
 * Class-based component for social media links
 */
class FooterSocial extends Component<{}, FooterSocialState> {
  private baseClass: string = "footer-social";

  private renderSocialLink(platform: { name: string; url: string; label: string }): React.ReactNode {
    return (
      <a
        key={platform.name}
        href={platform.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${this.baseClass}__icon ${this.baseClass}__icon--${platform.name.toLowerCase()}`}
        aria-label={platform.label}
        title={platform.name}
      >
        <SocialIcon name={platform.name as SocialPlatform} className={`${this.baseClass}__icon-svg`} />
      </a>
    );
  }

  render(): React.ReactNode {
    return (
      <div className={this.baseClass}>
        <span className={`${this.baseClass}__label`}>Ikuti Kami:</span>
        <div className={`${this.baseClass}__row`}>
          {SOCIAL_MEDIA.map((platform) => this.renderSocialLink(platform))}
        </div>
      </div>
    );
  }
}

export default FooterSocial;

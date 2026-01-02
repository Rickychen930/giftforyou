/**
 * Hero Slide Content Component
 * Reusable content panel component for hero slides
 * OOP-based class component following SOLID principles
 * Luxury, elegant, clean UI/UX, and fully responsive
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero/HeroSlideContent.css";
import LuxuryButton from "../buttons/LuxuryButton";
import { ArrowRightIcon } from "../icons/UIIcons";
import HeroSlideBadge from "./HeroSlideBadge";

export interface HeroSlideContentProps {
  badge?: string;
  title: string;
  subtitle?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  animated?: boolean;
}

interface HeroSlideContentState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Slide Content Component
 * Displays elegant content panel with title, subtitle, and CTAs
 * Follows Single Responsibility Principle: only handles content rendering
 */
export class HeroSlideContent extends Component<HeroSlideContentProps, HeroSlideContentState> {
  private baseClass: string = "hero-slide-content";

  private isExternal(href: string): boolean {
    return /^https?:\/\//i.test(href);
  }

  private renderCtaButton(
    href: string,
    variant: "primary" | "secondary",
    label: string
  ): React.ReactNode {
    const buttonContent = (
      <LuxuryButton
        variant={variant}
        size="lg"
        icon={<ArrowRightIcon width={16} height={16} />}
        iconPosition="right"
        className={`${this.baseClass}__cta`}
      >
        {label}
      </LuxuryButton>
    );

    if (this.isExternal(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${this.baseClass}__cta-link`}
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <Link to={href} className={`${this.baseClass}__cta-link`}>
        {buttonContent}
      </Link>
    );
  }

  private renderFloralIcon(): React.ReactNode {
    return (
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${this.baseClass}__floral-icon`}
        aria-hidden="true"
      >
        <g className={`${this.baseClass}__flower-petals`}>
          <path
            className={`${this.baseClass}__flower-petal`}
            d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
            fill="currentColor"
            opacity="0.15"
          />
        </g>
        <circle
          className={`${this.baseClass}__flower-center`}
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.9"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
      </svg>
    );
  }

  render(): React.ReactNode {
    const { badge, title, subtitle, primaryCta, secondaryCta, animated = true } = this.props;

    return (
      <div className={this.baseClass} data-swiper-parallax="-200">
        <div className={`${this.baseClass}__panel`} role="region" aria-label={`${title} details`}>
          <div className={`${this.baseClass}__panel-inner`}>
            {/* Badge */}
            {badge && (
              <div className={`${this.baseClass}__badge-wrapper`} data-swiper-parallax="-50">
                <HeroSlideBadge text={badge} variant="featured" animated={animated} />
              </div>
            )}

            {/* Heading with Floral Icon */}
            <div
              className={`${this.baseClass}__heading`}
              data-swiper-parallax="-100"
            >
              <div className={`${this.baseClass}__floral-icon-wrapper`} aria-hidden="true">
                {this.renderFloralIcon()}
              </div>
              <h2 className={`${this.baseClass}__title`}>{title}</h2>
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p
                className={`${this.baseClass}__subtitle`}
                data-swiper-parallax="-150"
              >
                {subtitle}
              </p>
            )}

            {/* Actions */}
            <div
              className={`${this.baseClass}__actions`}
              data-swiper-parallax="-200"
            >
              {this.renderCtaButton(primaryCta.href, "primary", primaryCta.label)}
              {secondaryCta && this.renderCtaButton(secondaryCta.href, "secondary", secondaryCta.label)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HeroSlideContent;


/**
 * Hero Slide Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero/HeroSlide.css";
import LuxuryButton from "../buttons/LuxuryButton";
import { ArrowRightIcon } from "../icons/UIIcons";
import { API_BASE } from "../../config/api";

export interface HeroSlideData {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export interface HeroSlideProps {
  slide: HeroSlideData;
  index: number;
  imageLoaded?: boolean;
  onImageLoad?: () => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

interface HeroSlideState {
  // No state needed, but keeping for consistency
}

/**
 * Hero Slide Component
 * Class-based component for hero slider slide
 */
class HeroSlide extends Component<HeroSlideProps, HeroSlideState> {
  private baseClass: string = "hero-slide";

  private isExternal(href: string): boolean {
    return /^https?:\/\//i.test(href);
  }

  private resolveImageSrc(image: string): string {
    const v = (image ?? "").trim();
    if (!v) return "/images/placeholder-bouquet.jpg";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/uploads/")) {
      return `${API_BASE}${v}`;
    }
    return v;
  }

  private renderCtaButton(href: string, variant: "primary" | "secondary", children: React.ReactNode): React.ReactNode {
    const buttonContent = (
      <LuxuryButton
        variant={variant}
        size="lg"
        icon={<ArrowRightIcon width={16} height={16} />}
        iconPosition="right"
        className={`${this.baseClass}__cta`}
      >
        {children}
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
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
    const { slide, index, imageLoaded = false, onImageLoad, onImageError } = this.props;
    const imageUrl = this.resolveImageSrc(slide.image);

    return (
      <article className={this.baseClass} aria-label={slide.title}>
        {/* Image with Ken Burns effect */}
        <div className={`${this.baseClass}__media`} data-swiper-parallax="-100">
          <div
            className={`${this.baseClass}__img-wrapper ${
              imageLoaded ? `${this.baseClass}__img-wrapper--loaded` : ""
            }`}
          >
            <img
              className={`${this.baseClass}__img`}
              src={imageUrl}
              alt={slide.title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="100vw"
              onLoad={onImageLoad}
              onError={onImageError}
            />
            {!imageLoaded && (
              <div className={`${this.baseClass}__img-placeholder`} aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Overlays for better text readability */}
        <div className={`${this.baseClass}__overlay`} />
        <div className={`${this.baseClass}__glow`} aria-hidden="true" />
        <div className={`${this.baseClass}__grain`} aria-hidden="true" />

        {/* Content panel */}
        <div className={`${this.baseClass}__content`} data-swiper-parallax="-200">
          <div
            className={`${this.baseClass}__panel`}
            role="region"
            aria-label={`${slide.title} details`}
          >
            <div className={`${this.baseClass}__panel-inner`}>
              {slide.badge && (
                <div
                  className={`${this.baseClass}__badge`}
                  data-swiper-parallax="-50"
                >
                  {slide.badge}
                </div>
              )}

              <div
                className={`${this.baseClass}__heading`}
                data-swiper-parallax="-100"
              >
                <div className={`${this.baseClass}__floral-icon`} aria-hidden="true">
                  {this.renderFloralIcon()}
                </div>
                <h2 className={`${this.baseClass}__title`}>{slide.title}</h2>
              </div>

              {slide.subtitle && (
                <p
                  className={`${this.baseClass}__subtitle`}
                  data-swiper-parallax="-150"
                >
                  {slide.subtitle}
                </p>
              )}

              <div
                className={`${this.baseClass}__actions`}
                data-swiper-parallax="-200"
              >
                {this.renderCtaButton(slide.primaryCta.href, "primary", slide.primaryCta.label)}

                {slide.secondaryCta && (
                  this.renderCtaButton(slide.secondaryCta.href, "secondary", slide.secondaryCta.label)
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }
}

export default HeroSlide;

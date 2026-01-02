/**
 * Hero Slide Component (OOP)
 * Class-based component following SOLID principles
 * Luxury, elegant, clean UI/UX, and fully responsive
 */

import React, { Component } from "react";
import "../../styles/hero/HeroSlide.css";
import { API_BASE } from "../../config/api";
import HeroSlideContent from "./HeroSlideContent";

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

  private resolveImageSrc(image: string): string {
    const v = (image ?? "").trim();
    if (!v) return "/images/placeholder-bouquet.jpg";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/uploads/")) {
      return `${API_BASE}${v}`;
    }
    return v;
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

        {/* Content panel - Using reusable HeroSlideContent component */}
        <div className={`${this.baseClass}__content`}>
          <HeroSlideContent
            badge={slide.badge}
            title={slide.title}
            subtitle={slide.subtitle}
            primaryCta={slide.primaryCta}
            secondaryCta={slide.secondaryCta}
            animated={true}
          />
        </div>
      </article>
    );
  }
}

export default HeroSlide;

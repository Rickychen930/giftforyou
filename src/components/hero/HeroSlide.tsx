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
 * Optimized with shouldComponentUpdate for performance
 */
class HeroSlide extends Component<HeroSlideProps, HeroSlideState> {
  private baseClass: string = "hero-slide";
  private imageSrcCache: Map<string, string> = new Map();

  /**
   * Prevent unnecessary re-renders for better performance
   * Only re-render when props actually change
   */
  shouldComponentUpdate(nextProps: HeroSlideProps): boolean {
    return (
      nextProps.slide.id !== this.props.slide.id ||
      nextProps.slide.image !== this.props.slide.image ||
      nextProps.slide.title !== this.props.slide.title ||
      nextProps.slide.subtitle !== this.props.slide.subtitle ||
      nextProps.slide.badge !== this.props.slide.badge ||
      nextProps.imageLoaded !== this.props.imageLoaded ||
      nextProps.index !== this.props.index
    );
  }

  /**
   * Memoized image source resolver for performance
   * Caches resolved URLs to avoid repeated string operations
   */
  private resolveImageSrc(image: string): string {
    // Check cache first
    if (this.imageSrcCache.has(image)) {
      return this.imageSrcCache.get(image)!;
    }

    const v = (image ?? "").trim();
    let resolved: string;
    
    if (!v) {
      resolved = "/images/placeholder-bouquet.jpg";
    } else if (v.startsWith("http://") || v.startsWith("https://")) {
      resolved = v;
    } else if (v.startsWith("/uploads/")) {
      resolved = `${API_BASE}${v}`;
    } else {
      resolved = v;
    }

    // Cache the result
    this.imageSrcCache.set(image, resolved);
    return resolved;
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
              width="1920"
              height="1080"
              onLoad={onImageLoad}
              onError={onImageError}
              style={{
                contentVisibility: index > 1 ? "auto" : "visible",
              }}
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

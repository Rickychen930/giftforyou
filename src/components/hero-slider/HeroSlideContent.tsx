import React, { memo } from "react";
import { HeroSlideCTA } from "./HeroSlideCTA";
import { FloralIcon } from "./FloralIcon";

export interface HeroSlideData {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

interface HeroSlideContentProps {
  slide: HeroSlideData;
  imageLoaded: boolean;
  onCTAClick?: (ctaType: "primary" | "secondary", href: string) => void;
}

/**
 * Reusable hero slide content component
 * Displays badge, title, subtitle, and CTAs
 * Memoized for performance optimization
 */
export const HeroSlideContent: React.FC<HeroSlideContentProps> = memo(({
  slide,
  imageLoaded,
  onCTAClick,
}) => {
  return (
    <div className="heroSlide__content" data-swiper-parallax="-200">
      <div
        className="heroSlide__panel"
        role="region"
        aria-label={`${slide.title} details`}
      >
        <div className="heroSlide__panel-inner">
          {slide.badge && (
            <div
              className="heroSlide__badge"
              data-swiper-parallax="-50"
              aria-label={`Badge: ${slide.badge}`}
            >
              {slide.badge}
            </div>
          )}

          <div
            className="heroSlide__heading"
            data-swiper-parallax="-100"
          >
            <FloralIcon />
            <h2 className="heroSlide__title">{slide.title}</h2>
          </div>

          {slide.subtitle && (
            <p
              className="heroSlide__subtitle"
              data-swiper-parallax="-150"
            >
              {slide.subtitle}
            </p>
          )}

          <div
            className="heroSlide__actions"
            data-swiper-parallax="-200"
          >
            <HeroSlideCTA
              href={slide.primaryCta.href}
              className="heroSlide__btn heroSlide__btn--primary"
              variant="primary"
              onClick={() => onCTAClick?.("primary", slide.primaryCta.href)}
            >
              <span className="heroSlide__btnText">
                {slide.primaryCta.label}
              </span>
              <svg
                className="heroSlide__btnIcon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </HeroSlideCTA>

            {slide.secondaryCta && (
              <HeroSlideCTA
                href={slide.secondaryCta.href}
                className="heroSlide__btn heroSlide__btn--secondary"
                variant="secondary"
                onClick={() => {
                  if (slide.secondaryCta) {
                    onCTAClick?.("secondary", slide.secondaryCta.href);
                  }
                }}
              >
                <span className="heroSlide__btnText">
                  {slide.secondaryCta.label}
                </span>
                <svg
                  className="heroSlide__btnIcon heroSlide__btnIcon--secondary"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </HeroSlideCTA>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps: HeroSlideContentProps, nextProps: HeroSlideContentProps) => {
  // Custom comparison for memoization
  return (
    prevProps.slide.id === nextProps.slide.id &&
    prevProps.slide.title === nextProps.slide.title &&
    prevProps.slide.subtitle === nextProps.slide.subtitle &&
    prevProps.slide.badge === nextProps.slide.badge &&
    prevProps.imageLoaded === nextProps.imageLoaded &&
    prevProps.onCTAClick === nextProps.onCTAClick
  );
});

HeroSlideContent.displayName = "HeroSlideContent";


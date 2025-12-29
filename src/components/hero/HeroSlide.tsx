import React from "react";
import { Link } from "react-router-dom";
import "../../styles/hero/HeroSlide.css";
import LuxuryButton from "../LuxuryButton";
import { buildImageUrl } from "../../utils/image-utils";
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

const isExternal = (href: string) => /^https?:\/\//i.test(href);

const HeroSlide: React.FC<HeroSlideProps> = ({
  slide,
  index,
  imageLoaded = false,
  onImageLoad,
  onImageError,
}) => {
  // Resolve image URL - handle /uploads/ paths correctly
  const resolveImageSrc = (image: string) => {
    const v = (image ?? "").trim();
    if (!v) return "/images/placeholder-bouquet.jpg";
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    if (v.startsWith("/uploads/")) {
      return `${API_BASE}${v}`;
    }
    return v;
  };

  const imageUrl = resolveImageSrc(slide.image);

  const CtaButton: React.FC<{
    href: string;
    variant: "primary" | "secondary";
    children: React.ReactNode;
  }> = ({ href, variant, children }) => {
    const buttonContent = (
      <LuxuryButton
        variant={variant}
        size="lg"
        icon={<ArrowRightIcon width={16} height={16} />}
        iconPosition="right"
        className="hero-slide__cta"
      >
        {children}
      </LuxuryButton>
    );

    if (isExternal(href)) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="hero-slide__cta-link"
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <Link to={href} className="hero-slide__cta-link">
        {buttonContent}
      </Link>
    );
  };

  return (
    <article className="hero-slide" aria-label={slide.title}>
      {/* Image with Ken Burns effect */}
      <div className="hero-slide__media" data-swiper-parallax="-100">
        <div
          className={`hero-slide__img-wrapper ${
            imageLoaded ? "hero-slide__img-wrapper--loaded" : ""
          }`}
        >
          <img
            className="hero-slide__img"
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
            <div className="hero-slide__img-placeholder" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Overlays for better text readability */}
      <div className="hero-slide__overlay" />
      <div className="hero-slide__glow" aria-hidden="true" />
      <div className="hero-slide__grain" aria-hidden="true" />

      {/* Content panel */}
      <div className="hero-slide__content" data-swiper-parallax="-200">
        <div
          className="hero-slide__panel"
          role="region"
          aria-label={`${slide.title} details`}
        >
          <div className="hero-slide__panel-inner">
            {slide.badge && (
              <div
                className="hero-slide__badge"
                data-swiper-parallax="-50"
              >
                {slide.badge}
              </div>
            )}

            <div
              className="hero-slide__heading"
              data-swiper-parallax="-100"
            >
              <div className="hero-slide__floral-icon" aria-hidden="true">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g className="hero-slide__flower-petals">
                    <path
                      className="hero-slide__flower-petal"
                      d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
                      fill="currentColor"
                      opacity="0.15"
                    />
                  </g>
                  <circle
                    className="hero-slide__flower-center"
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
              </div>
              <h2 className="hero-slide__title">{slide.title}</h2>
            </div>

            {slide.subtitle && (
              <p
                className="hero-slide__subtitle"
                data-swiper-parallax="-150"
              >
                {slide.subtitle}
              </p>
            )}

            <div
              className="hero-slide__actions"
              data-swiper-parallax="-200"
            >
              <CtaButton href={slide.primaryCta.href} variant="primary">
                {slide.primaryCta.label}
              </CtaButton>

              {slide.secondaryCta && (
                <CtaButton href={slide.secondaryCta.href} variant="secondary">
                  {slide.secondaryCta.label}
                </CtaButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default HeroSlide;


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import {
  Autoplay,
  Navigation,
  Pagination,
  EffectFade,
  A11y,
  Parallax,
  Keyboard,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/parallax";
import "../../styles/HeroCollectionSlider.css";

import { API_BASE } from "../../config/api";

type HeroSlide = {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type HeroSliderContent = {
  heading?: string;
  slides: HeroSlide[];
};

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

const defaultContent: HeroSliderContent = {
  heading: "New Collections",
  slides: [
    {
      id: "welcome-collection",
      badge: "NEW ARRIVAL",
      title: "Premium Flower Collection",
      subtitle:
        "Exquisite arrangements with elegant wrapping—perfect for gifting.",
      image: "/images/welcome-image.jpeg",
      primaryCta: { label: "Shop Collection", href: "/collection" },
      secondaryCta: {
        label: "Order via WhatsApp",
        href: "https://wa.me/6285161428911",
      },
    },
    {
      id: "seasonal-blooms",
      badge: "SEASONAL",
      title: "Seasonal Blooms",
      subtitle: "Fresh picks curated weekly by our florist.",
      image: "/images/about-us-background.jpg",
      primaryCta: { label: "Explore Bouquets", href: "/collection" },
      secondaryCta: {
        label: "Custom Request",
        href: "https://wa.me/6285161428911",
      },
    },
    {
      id: "special-gifts",
      badge: "BEST SELLER",
      title: "Flowers & Gifts",
      subtitle: "Make it special with add-ons: cards, chocolates, and more.",
      image: "/images/our-collection-background.jpg",
      primaryCta: { label: "Browse Collection", href: "/collection" },
      secondaryCta: {
        label: "Contact Us",
        href: "https://wa.me/6285161428911",
      },
    },
  ],
};

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * ✅ Fix for uploaded images:
 * - if image is "/uploads/..." -> serve from backend API_BASE
 * - if image is "/images/..."  -> serve from frontend public folder (keep as-is)
 * - if image is "http..."      -> keep as-is
 */
const resolveImageSrc = (image: string) => {
  const v = (image ?? "").trim();
  if (!v) return "/images/placeholder-bouquet.jpg";
  if (isExternal(v)) return v;

  if (v.startsWith("/uploads/")) {
    return `${API_BASE}${v}`;
  }

  // Default: assume it's a normal public asset (/images/...)
  return v;
};

const Cta: React.FC<{
  href: string;
  className: string;
  children: React.ReactNode;
}> = ({ href, className, children }) => {
  if (isExternal(href)) {
    return (
      <a
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link className={className} to={href}>
      {children}
    </Link>
  );
};

// Enhanced animated flower icon with petals
const FloralIcon: React.FC = () => (
  <svg
    className="heroSlide__flower"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Animated petals */}
    <g className="heroSlide__flower-petals">
      <path
        className="heroSlide__flower-petal"
        d="M12 2s2 3.5 5 4 4.5 1.8 4 4-2.2 4.2-4 5-4 1-5 4c0 0-2-3.5-5-4s-4.5-1.8-4-4 2.2-4.2 4-5 4-1 5-4z"
        fill="currentColor"
        opacity="0.15"
      />
    </g>
    {/* Center bloom */}
    <circle
      className="heroSlide__flower-center"
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      opacity="0.9"
    />
    {/* Inner details */}
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

// Loading skeleton component
const HeroSkeleton: React.FC = () => (
  <section className="hero hero--loading" aria-label="Loading hero slider">
    <div className="hero__skeleton">
      <div className="hero__skeleton-image" />
      <div className="hero__skeleton-content">
        <div className="hero__skeleton-badge" />
        <div className="hero__skeleton-title" />
        <div className="hero__skeleton-subtitle" />
        <div className="hero__skeleton-buttons">
          <div className="hero__skeleton-button" />
          <div className="hero__skeleton-button" />
        </div>
      </div>
    </div>
  </section>
);

const HeroCollectionSlider: React.FC<HeroCollectionSliderProps> = ({
  content,
  loading = false,
}) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageLoadStates, setImageLoadStates] = useState<
    Record<string, boolean>
  >({});

  const data = useMemo(() => content ?? defaultContent, [content]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!swiperInstance) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          swiperInstance.slidePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          swiperInstance.slideNext();
          break;
        case " ":
          if (e.target === document.body) {
            e.preventDefault();
            toggleAutoplay();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [swiperInstance]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    if (!swiperInstance?.autoplay) return;

    if (isPlaying) {
      swiperInstance.autoplay.stop();
      setIsPlaying(false);
    } else {
      swiperInstance.autoplay.start();
      setIsPlaying(true);
    }
  }, [swiperInstance, isPlaying]);

  // Handle image load
  const handleImageLoad = useCallback((slideId: string) => {
    setImageLoadStates((prev) => ({ ...prev, [slideId]: true }));
  }, []);

  // Show skeleton while loading
  if (loading) {
    return <HeroSkeleton />;
  }

  return (
    <section className="hero" aria-label="Featured collections">
      {data.heading && (
        <div className="hero__kicker-wrapper">
          <p className="hero__kicker">{data.heading}</p>
        </div>
      )}

      <Swiper
        modules={[
          Autoplay,
          Navigation,
          Pagination,
          EffectFade,
          A11y,
          Parallax,
          Keyboard,
        ]}
        effect="fade"
        slidesPerView={1}
        loop={data.slides.length > 1}
        speed={1200}
        parallax={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        navigation={{
          nextEl: ".hero__nav-next",
          prevEl: ".hero__nav-prev",
        }}
        pagination={{
          el: ".hero__pagination",
          clickable: true,
          renderBullet: (index: number, className: string) => {
            return `<button class="${className}" aria-label="Go to slide ${
              index + 1
            }"></button>`;
          },
        }}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
        a11y={{ enabled: true }}
        className="hero__swiper"
        aria-roledescription="carousel"
        aria-label="Hero collections slider"
        aria-live="polite"
      >
        {data.slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <article className="heroSlide" aria-label={slide.title}>
              {/* Image with Ken Burns effect and blur-up loading */}
              <div className="heroSlide__media" data-swiper-parallax="-100">
                <div
                  className={`heroSlide__imgWrapper ${
                    imageLoadStates[slide.id]
                      ? "heroSlide__imgWrapper--loaded"
                      : ""
                  }`}
                >
                  <img
                    className="heroSlide__img"
                    src={resolveImageSrc(slide.image)}
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoad(slide.id)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      handleImageLoad(slide.id);
                    }}
                  />
                  {!imageLoadStates[slide.id] && (
                    <div
                      className="heroSlide__imgPlaceholder"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>

              {/* Overlays for better text readability */}
              <div className="heroSlide__overlay" />
              <div className="heroSlide__glow" aria-hidden="true" />
              <div className="heroSlide__grain" aria-hidden="true" />

              {/* Content panel */}
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
                      >
                        {slide.badge}
                      </div>
                    )}

                    <div
                      className="heroSlide__heading"
                      data-swiper-parallax="-100"
                    >
                      <FloralIcon />
                      <h1 className="heroSlide__title">{slide.title}</h1>
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
                      <Cta
                        href={slide.primaryCta.href}
                        className="heroSlide__btn heroSlide__btn--primary"
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
                      </Cta>

                      {slide.secondaryCta && (
                        <Cta
                          href={slide.secondaryCta.href}
                          className="heroSlide__btn heroSlide__btn--secondary"
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
                        </Cta>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}

        {/* Custom navigation with enhanced accessibility */}
        {data.slides.length > 1 && (
          <>
            <button
              className="hero__nav hero__nav-prev"
              aria-label="Previous slide (Left arrow key)"
              type="button"
              title="Previous slide"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="hero__nav hero__nav-next"
              aria-label="Next slide (Right arrow key)"
              type="button"
              title="Next slide"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Play/Pause button */}
            <button
              className="hero__playPause"
              onClick={toggleAutoplay}
              aria-label={
                isPlaying
                  ? "Pause autoplay (Space key)"
                  : "Play autoplay (Space key)"
              }
              type="button"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="6"
                    y="4"
                    width="4"
                    height="16"
                    rx="1"
                    fill="currentColor"
                  />
                  <rect
                    x="14"
                    y="4"
                    width="4"
                    height="16"
                    rx="1"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </button>
          </>
        )}

        {/* Custom pagination */}
        <div className="hero__pagination" />
      </Swiper>

      {/* Enhanced slide counter with progress */}
      {data.slides.length > 1 && (
        <div className="hero__counterWrapper">
          <div className="hero__counter" aria-live="polite" aria-atomic="true">
            <span className="hero__counter-current">{activeIndex + 1}</span>
            <span className="hero__counter-separator">/</span>
            <span className="hero__counter-total">{data.slides.length}</span>
          </div>
          <div className="hero__progress" aria-hidden="true">
            <div
              className="hero__progressBar"
              style={{
                width: `${((activeIndex + 1) / data.slides.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroCollectionSlider;

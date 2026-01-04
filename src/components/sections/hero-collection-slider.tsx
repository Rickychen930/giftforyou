import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { STORE_PROFILE } from "../../config/store-profile";

import { HeroSlideImage } from "../hero-slider/HeroSlideImage";
import { HeroSlideContent, type HeroSlideData } from "../hero-slider/HeroSlideContent";
import { HeroSliderNavigation } from "../hero-slider/HeroSliderNavigation";
import { HeroSliderCounter } from "../hero-slider/HeroSliderCounter";
import { HeroSliderSkeleton } from "../hero-slider/HeroSliderSkeleton";
import { HeroSliderErrorBoundary } from "../hero-slider/HeroSliderErrorBoundary";
import { useHeroSlider } from "../../hooks/useHeroSlider";
import { usePerformanceOptimizations } from "../../hooks/usePerformanceOptimizations";
import { preloadImages, validateHeroSliderContent } from "../../utils/hero-slider-utils";
import { trackSlideViewTime, trackCTAClick, measurePerformance } from "../../utils/analytics-utils";
import { prefetchResource, preconnectDomain } from "../../utils/performance-utils";

/**
 * Hero Slider Content Type
 */
export type HeroSliderContent = {
  heading?: string;
  slides: HeroSlideData[];
};

interface HeroCollectionSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

/**
 * Default content fallback
 * Used when API returns null or no content
 */
const defaultContent: HeroSliderContent = {
  heading: "Koleksi Pilihan",
  slides: [
    {
      id: "welcome-collection",
      badge: "SIGNATURE",
      title: "Bouquet & Gift Premium",
      subtitle: "Rangkaian pilihan dengan wrapping elegan—cocok untuk hadiah.",
      image: "/images/welcome-image.jpeg",
      primaryCta: { label: "Lihat Koleksi", href: "/collection" },
      secondaryCta: {
        label: "Chat lewat WhatsApp",
        href: STORE_PROFILE.whatsapp.url,
      },
    },
    {
      id: "seasonal-blooms",
      badge: "CUSTOM",
      title: "Request Bouquet Custom",
      subtitle: "Ceritakan momen, warna, dan budget—kami rekomendasikan yang terbaik.",
      image: "/images/about-us-background.jpg",
      primaryCta: { label: "Lihat Bouquet", href: "/collection" },
      secondaryCta: {
        label: "Chat lewat WhatsApp",
        href: STORE_PROFILE.whatsapp.url,
      },
    },
    {
      id: "special-gifts",
      badge: "BEST SELLER",
      title: "Pesan Cepat & Mudah",
      subtitle: "Pesan lewat WhatsApp—respon cepat dan pelayanan ramah.",
      image: "/images/our-collection-background.jpg",
      primaryCta: { label: "Lihat Semua", href: "/collection" },
      secondaryCta: {
        label: "Chat lewat WhatsApp",
        href: STORE_PROFILE.whatsapp.url,
      },
    },
  ],
};

/**
 * Hero Collection Slider Component
 * Luxury, elegant, responsive hero slider with full feature set
 * 
 * Features:
 * - Fade transitions
 * - Autoplay with pause on hover
 * - Keyboard navigation
 * - Touch/swipe support
 * - Progress indicators
 * - Image preloading
 * - Accessibility (ARIA, keyboard, screen readers)
 * - Performance optimized
 * 
 * Follows SOLID, MVP, OOP, DRY principles
 */
const HeroCollectionSlider: React.FC<HeroCollectionSliderProps> = ({
  content,
  loading = false,
}) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [hasError, setHasError] = useState(false);
  const slideViewStartTime = useRef<Map<number, number>>(new Map());
  const performanceStartTime = useRef<number>(Date.now());

  // Performance optimizations based on device capabilities
  const performanceOpts = usePerformanceOptimizations();

  // Validate and merge content
  const data = useMemo(() => {
    if (content && validateHeroSliderContent(content)) {
      return content;
    }
    return defaultContent;
  }, [content]);

  // Preconnect to API domain for faster loading
  useEffect(() => {
    if (typeof window !== "undefined" && data.slides.length > 0) {
      const firstImage = data.slides[0].image;
      if (firstImage.startsWith("http")) {
        preconnectDomain(firstImage);
      }
    }
  }, [data.slides]);

  // Use custom hook for slider logic
  const {
    activeIndex,
    isPlaying,
    isVisible,
    transitionProgress,
    imageLoadStates,
    heroRef,
    touchTimeoutRef,
    focusTimeoutRef,
    toggleAutoplay,
    handleImageLoad,
    handleSlideChange,
  } = useHeroSlider(swiperInstance, data.slides.length, {
    autoplayDelay: performanceOpts.shouldReduceAnimations ? 8000 : 6000, // Slower on low-end devices
    onSlideChange: (index) => {
      // Track slide view time
      const prevIndex = activeIndex;
      if (prevIndex >= 0 && slideViewStartTime.current.has(prevIndex)) {
        const startTime = slideViewStartTime.current.get(prevIndex)!;
        const viewTime = Date.now() - startTime;
        const prevSlide = data.slides[prevIndex];
        if (prevSlide) {
          trackSlideViewTime(prevSlide.id, prevIndex, viewTime);
        }
        slideViewStartTime.current.delete(prevIndex);
      }

      // Start tracking new slide
      slideViewStartTime.current.set(index, Date.now());

      // Prefetch next slide image for smoother transition
      const nextIndex = (index + 1) % data.slides.length;
      if (data.slides[nextIndex] && !performanceOpts.isSlowConnection) {
        prefetchResource(data.slides[nextIndex].image, "low");
      }
    },
  });

  // Measure initial load performance
  useEffect(() => {
    if (!loading && swiperInstance) {
      const loadTime = Date.now() - performanceStartTime.current;
      measurePerformance("hero-slider-initial-load", loadTime);
    }
  }, [loading, swiperInstance]);

  // Optimized image preloading - adaptive based on device capabilities
  useEffect(() => {
    if (data.slides.length === 0) return;

    // On slow connection or low-end device, only preload first slide
    const maxPreload = performanceOpts.isSlowConnection || performanceOpts.isLowEnd
      ? 1
      : Math.min(2, data.slides.length);

    const immediateUrls = data.slides
      .slice(0, maxPreload)
      .map((slide) => slide.image);

    const cleanup = preloadImages(immediateUrls);

    // Preload remaining images with delay (only if not slow connection)
    if (data.slides.length > maxPreload && !performanceOpts.isSlowConnection) {
      const delayedUrls = data.slides
        .slice(maxPreload)
        .map((slide) => slide.image);

      const timeoutId = setTimeout(() => {
        preloadImages(delayedUrls);
      }, performanceOpts.isLowEnd ? 2000 : 1000);

      return () => {
        cleanup();
        clearTimeout(timeoutId);
      };
    }

    return cleanup;
  }, [data.slides, performanceOpts.isSlowConnection, performanceOpts.isLowEnd]);

  // Handle navigation focus/blur for autoplay
  const handleNavFocus = useCallback(() => {
    if (swiperInstance?.autoplay && isPlaying) {
      swiperInstance.autoplay.pause();
    }
  }, [swiperInstance, isPlaying]);

  const handleNavBlur = useCallback(() => {
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    if (swiperInstance && isPlaying && isVisible) {
      focusTimeoutRef.current = setTimeout(() => {
        if (swiperInstance?.autoplay && isPlaying) {
          swiperInstance.autoplay.resume();
        }
        focusTimeoutRef.current = null;
      }, 500);
    }
  }, [swiperInstance, isPlaying, isVisible, focusTimeoutRef]);

  // Handle touch events
  const handleTouchStart = useCallback(() => {
    if (swiperInstance?.autoplay && isPlaying) {
      swiperInstance.autoplay.pause();
    }
  }, [swiperInstance, isPlaying]);

  const handleTouchEnd = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    if (swiperInstance?.autoplay && isPlaying && isVisible) {
      touchTimeoutRef.current = setTimeout(() => {
        if (swiperInstance?.autoplay && isPlaying && isVisible) {
          swiperInstance.autoplay.resume();
        }
        touchTimeoutRef.current = null;
      }, 1500);
    }
  }, [swiperInstance, isPlaying, isVisible, touchTimeoutRef]);

  // Add class for reduced animations if needed - MUST be before early returns (React Hooks rules)
  const heroClassName = useMemo(() => {
    const classes = ["hero"];
    if (performanceOpts.shouldReduceAnimations || performanceOpts.reducedMotion) {
      classes.push("hero--reduced-animations");
    }
    return classes.join(" ");
  }, [performanceOpts.shouldReduceAnimations, performanceOpts.reducedMotion]);

  // Handle errors gracefully
  if (hasError) {
    return (
      <section className="hero hero--empty" aria-label="Slider error">
        <div className="hero__empty">
          <p>Unable to load slider. Please refresh the page.</p>
        </div>
      </section>
    );
  }

  // Handle empty slides gracefully
  if (!data.slides || data.slides.length === 0) {
    return (
      <section className="hero hero--empty" aria-label="No slides available">
        <div className="hero__empty">
          <p>No slides available</p>
        </div>
      </section>
    );
  }

  // Show skeleton while loading
  if (loading) {
    return <HeroSliderSkeleton />;
  }

  const progressPercentage = ((activeIndex + 1) / data.slides.length) * 100;

  return (
    <HeroSliderErrorBoundary
      onError={(error) => {
        if (
          typeof process !== "undefined" &&
          process.env &&
          process.env.NODE_ENV === "development"
        ) {
          console.error("Hero Slider Error:", error);
        }
        setHasError(true);
      }}
    >
      <section
        className={heroClassName}
        aria-label="Featured collections"
        ref={heroRef}
      >
      <h1 className="srOnly">{STORE_PROFILE.brand.displayName}</h1>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="hero__skipLink">
        Skip to main content
      </a>
      {data.heading && (
        <div className="hero__kicker-wrapper">
          <p className="hero__kicker">{data.heading}</p>
        </div>
      )}

      <div className="hero__swiper-wrapper">
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
          speed={performanceOpts.shouldReduceAnimations ? 800 : 1400}
          parallax={!performanceOpts.shouldReduceAnimations}
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
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            stopOnLastSlide: false,
            waitForTransition: true,
          }}
          touchEventsTarget="container"
          touchRatio={1}
          touchAngle={45}
          simulateTouch={true}
          allowTouchMove={true}
          resistance={true}
          resistanceRatio={0.85}
          watchSlidesProgress={true}
          watchSlidesVisibility={true}
          onSwiper={(swiper: SwiperType) => {
            try {
              setSwiperInstance(swiper);
              setHasError(false);
            } catch (error) {
              console.error("Error initializing Swiper:", error);
              setHasError(true);
            }
          }}
          onSlideChange={handleSlideChange}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onReachBeginning={() => {
            if (data.slides.length > 1 && swiperInstance?.params?.loop) {
              // Reset progress on loop
            }
          }}
          onReachEnd={() => {
            if (data.slides.length > 1 && swiperInstance?.params?.loop) {
              // Reset progress on loop
            }
          }}
          a11y={{
            enabled: true,
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
            firstSlideMessage: "This is the first slide",
            lastSlideMessage: "This is the last slide",
            paginationBulletMessage: "Go to slide {{index}}",
          }}
          className="hero__swiper"
          role="region"
          aria-roledescription="carousel"
          aria-label="Hero collections slider"
          aria-live="polite"
        >
          {data.slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <article className="heroSlide" aria-label={slide.title}>
                <HeroSlideImage
                  image={slide.image}
                  alt={slide.title}
                  slideId={slide.id}
                  priority={index === 0}
                  onLoad={handleImageLoad}
                  onError={(slideId, e) => {
                    // Error handling is done in HeroSlideImage component
                    console.warn(`Failed to load image for slide ${slideId}`);
                  }}
                />

                {/* Overlays for better text readability */}
                <div className="heroSlide__overlay" />
                <div className="heroSlide__glow" aria-hidden="true" />
                <div className="heroSlide__grain" aria-hidden="true" />

                {/* Content panel */}
                <HeroSlideContent
                  slide={slide}
                  imageLoaded={imageLoadStates[slide.id] || false}
                  onCTAClick={(ctaType, href) => {
                    trackCTAClick(slide.id, index, ctaType, href);
                  }}
                />
              </article>
            </SwiperSlide>
          ))}

          {/* Custom navigation */}
          <HeroSliderNavigation
            swiperInstance={swiperInstance}
            isPlaying={isPlaying}
            onToggleAutoplay={toggleAutoplay}
            onFocus={handleNavFocus}
            onBlur={handleNavBlur}
            slidesCount={data.slides.length}
          />

          {/* Custom pagination */}
          <div className="hero__pagination" />
        </Swiper>
      </div>

      {/* Enhanced slide counter with progress */}
      <HeroSliderCounter
        current={activeIndex + 1}
        total={data.slides.length}
        progress={progressPercentage}
        autoplayProgress={transitionProgress}
        isPlaying={isPlaying}
        isVisible={isVisible}
      />
      </section>
    </HeroSliderErrorBoundary>
  );
};

export default HeroCollectionSlider;

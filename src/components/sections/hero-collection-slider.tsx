import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
import { STORE_PROFILE } from "../../config/store-profile";

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
  <section className="hero hero--loading" aria-label="Memuat hero slider">
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
  const [isVisible, setIsVisible] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const data = useMemo(() => content ?? defaultContent, [content]);

  // Toggle autoplay - defined before useEffect that uses it
  const toggleAutoplay = useCallback(() => {
    if (!swiperInstance?.autoplay) return;

    if (isPlaying) {
      swiperInstance.autoplay.stop();
      setIsPlaying(false);
      setTransitionProgress(0);
    } else {
      swiperInstance.autoplay.start();
      setIsPlaying(true);
    }
  }, [swiperInstance, isPlaying]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Intersection Observer - pause autoplay when slider is not visible
  useEffect(() => {
    if (!swiperInstance || !heroRef.current) return;

    // Use IntersectionObserver with better performance options
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? true;
        setIsVisible(isIntersecting);

        if (swiperInstance.autoplay) {
          if (isIntersecting && isPlaying) {
            // Small delay to ensure smooth transition
            requestAnimationFrame(() => {
              swiperInstance.autoplay?.start();
            });
          } else if (!isIntersecting) {
            swiperInstance.autoplay.stop();
          }
        }
      },
      {
        threshold: 0.3,
        rootMargin: "50px",
        // Use passive observation for better performance
      }
    );

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
    };
  }, [swiperInstance, isPlaying]);

  // Track autoplay progress for visual indicator - fixed memory leaks
  useEffect(() => {
    if (!swiperInstance || !isPlaying || !isVisible) {
      setTransitionProgress(0);
      return;
    }

    let startTime = Date.now();
    const autoplayDelay = 6000;
    let animationFrame: number | null = null;
    let isActive = true;

    const updateProgress = () => {
      if (!isActive) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / autoplayDelay) * 100, 100);
      setTransitionProgress(progress);

      if (progress < 100 && isActive) {
        animationFrame = requestAnimationFrame(updateProgress);
      } else if (isActive) {
        setTransitionProgress(0);
        startTime = Date.now();
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    const handleSlideChange = () => {
      if (!isActive) return;
      setTransitionProgress(0);
      startTime = Date.now();
    };

    const handleAutoplayStop = () => {
      if (!isActive) return;
      setTransitionProgress(0);
    };

    swiperInstance.on("slideChange", handleSlideChange);
    swiperInstance.on("autoplayStop", handleAutoplayStop);

    return () => {
      isActive = false;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      swiperInstance.off("slideChange", handleSlideChange);
      swiperInstance.off("autoplayStop", handleAutoplayStop);
      setTransitionProgress(0);
    };
  }, [swiperInstance, isPlaying, isVisible, activeIndex]);

  // Keyboard shortcuts with debouncing and focus check
  useEffect(() => {
    if (!swiperInstance) return;

    let lastKeyTime = 0;
    const DEBOUNCE_DELAY = 300; // Prevent rapid key presses

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Check if slider is in viewport
      if (!isVisible) return;

      // Debounce rapid key presses
      const now = Date.now();
      if (now - lastKeyTime < DEBOUNCE_DELAY) {
        return;
      }
      lastKeyTime = now;

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
          e.preventDefault();
          toggleAutoplay();
          break;
        case "Home":
          e.preventDefault();
          if (data.slides.length > 1 && swiperInstance.params?.loop) {
            swiperInstance.slideToLoop(0);
          } else {
            swiperInstance.slideTo(0);
          }
          break;
        case "End":
          e.preventDefault();
          if (data.slides.length > 1 && swiperInstance.params?.loop) {
            swiperInstance.slideToLoop(data.slides.length - 1);
          } else {
            swiperInstance.slideTo(data.slides.length - 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swiperInstance, toggleAutoplay, data.slides.length, isVisible]);

  // Handle image load with error handling
  const handleImageLoad = useCallback((slideId: string) => {
    setImageLoadStates((prev) => ({ ...prev, [slideId]: true }));
  }, []);

  const handleImageError = useCallback((slideId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    // Try to load placeholder image
    const placeholderSrc = "/images/placeholder-bouquet.jpg";
    
    // Only retry if it's not already the placeholder
    if (target.src && !target.src.includes(placeholderSrc)) {
      target.src = placeholderSrc;
      return;
    }
    
    // Hide broken image and show placeholder div
    target.style.display = "none";
    handleImageLoad(slideId);
  }, [handleImageLoad]);

  // Optimized image preloading - only preload first 2 slides immediately, rest on demand
  useEffect(() => {
    if (data.slides.length === 0) return;

    const preloadImages: HTMLImageElement[] = [];
    const maxPreload = Math.min(2, data.slides.length); // Only preload first 2

    // Preload first slides immediately
    for (let i = 0; i < maxPreload; i++) {
      const slide = data.slides[i];
      const img = new Image();
      img.onerror = () => {
        // Silently handle preload errors
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to preload image: ${slide.image}`);
        }
      };
      img.src = resolveImageSrc(slide.image);
      preloadImages.push(img);
    }

    // Preload remaining images with delay to avoid blocking
    const preloadRemaining = () => {
      if (data.slides.length <= maxPreload) return;
      
      setTimeout(() => {
        for (let i = maxPreload; i < data.slides.length; i++) {
          const slide = data.slides[i];
          const img = new Image();
          img.onerror = () => {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Failed to preload image: ${slide.image}`);
            }
          };
          img.src = resolveImageSrc(slide.image);
          preloadImages.push(img);
        }
      }, 1000);
    };

    preloadRemaining();

    // Cleanup if component unmounts
    return () => {
      preloadImages.forEach((img) => {
        img.onerror = null;
        img.src = "";
      });
    };
  }, [data.slides]);

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
    return <HeroSkeleton />;
  }

  return (
    <section 
      className="hero" 
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

      <div
        className="hero__swiper-wrapper"
      >
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
        speed={1400}
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
        onSlideChange={(swiper: SwiperType) => {
          setActiveIndex(swiper.realIndex);
          setTransitionProgress(0);
        }}
        onTouchStart={() => {
          // Pause autoplay on touch interaction for better UX
          if (swiperInstance?.autoplay && isPlaying) {
            swiperInstance.autoplay.pause();
          }
        }}
        onTouchEnd={() => {
          // Resume autoplay after touch with delay - with cleanup
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
        }}
        onReachBeginning={() => {
          // Reset progress on loop
          if (data.slides.length > 1 && swiperInstance?.params?.loop) {
            setTransitionProgress(0);
          }
        }}
        onReachEnd={() => {
          // Reset progress on loop
          if (data.slides.length > 1 && swiperInstance?.params?.loop) {
            setTransitionProgress(0);
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
                    decoding="async"
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sizes="100vw"
                    onLoad={() => handleImageLoad(slide.id)}
                    onError={(e) => handleImageError(slide.id, e)}
                    onLoadStart={() => {
                      // Preload adjacent images for smoother transitions
                      // Use requestIdleCallback for better performance
                      const preloadAdjacent = () => {
                        if (index < data.slides.length - 1) {
                          const nextSlide = data.slides[index + 1];
                          if (!imageLoadStates[nextSlide.id]) {
                            const img = new Image();
                            img.onerror = () => {
                              // Silently handle preload errors
                            };
                            img.src = resolveImageSrc(nextSlide.image);
                          }
                        }
                        if (index > 0) {
                          const prevSlide = data.slides[index - 1];
                          if (!imageLoadStates[prevSlide.id]) {
                            const img = new Image();
                            img.onerror = () => {
                              // Silently handle preload errors
                            };
                            img.src = resolveImageSrc(prevSlide.image);
                          }
                        }
                      };

                      // Use requestIdleCallback if available, otherwise setTimeout
                      if ('requestIdleCallback' in window) {
                        requestIdleCallback(preloadAdjacent, { timeout: 2000 });
                      } else {
                        setTimeout(preloadAdjacent, 100);
                      }
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
              aria-label="Previous slide"
              type="button"
              title="Previous slide (Left Arrow)"
              tabIndex={0}
              onFocus={() => {
                // Ensure focus is visible
                if (swiperInstance) {
                  swiperInstance.autoplay?.pause();
                }
              }}
              onBlur={() => {
                // Resume autoplay when focus leaves - with cleanup
                if (focusTimeoutRef.current) {
                  clearTimeout(focusTimeoutRef.current);
                }
                
                if (swiperInstance && isPlaying) {
                  focusTimeoutRef.current = setTimeout(() => {
                    if (swiperInstance?.autoplay && isPlaying) {
                      swiperInstance.autoplay.resume();
                    }
                    focusTimeoutRef.current = null;
                  }, 500);
                }
              }}
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
              aria-label="Next slide"
              type="button"
              title="Next slide (Right Arrow)"
              tabIndex={0}
              onFocus={() => {
                // Ensure focus is visible
                if (swiperInstance) {
                  swiperInstance.autoplay?.pause();
                }
              }}
              onBlur={() => {
                // Resume autoplay when focus leaves - with cleanup
                if (focusTimeoutRef.current) {
                  clearTimeout(focusTimeoutRef.current);
                }
                
                if (swiperInstance && isPlaying) {
                  focusTimeoutRef.current = setTimeout(() => {
                    if (swiperInstance?.autoplay && isPlaying) {
                      swiperInstance.autoplay.resume();
                    }
                    focusTimeoutRef.current = null;
                  }, 500);
                }
              }}
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
                isPlaying ? "Pause autoplay" : "Play autoplay"
              }
              aria-pressed={isPlaying}
              type="button"
              title={isPlaying ? "Pause slideshow (Space)" : "Play slideshow (Space)"}
              tabIndex={0}
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
      </div>

      {/* Enhanced slide counter with progress */}
      {data.slides.length > 1 && (
        <div className="hero__counterWrapper">
          <div 
            className="hero__counter" 
            aria-live="polite" 
            aria-atomic="true"
            role="status"
            aria-label={`Slide ${activeIndex + 1} of ${data.slides.length}`}
          >
            <span className="hero__counter-current" aria-hidden="true">{activeIndex + 1}</span>
            <span className="hero__counter-separator" aria-hidden="true">/</span>
            <span className="hero__counter-total" aria-hidden="true">{data.slides.length}</span>
          </div>
          <div className="hero__progress" aria-hidden="true">
            <div
              className="hero__progressBar"
              style={{
                width: `${((activeIndex + 1) / data.slides.length) * 100}%`,
              }}
            />
            {isPlaying && isVisible && (
              <div
                className="hero__progressAutoplay"
                style={{
                  width: `${transitionProgress}%`,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroCollectionSlider;

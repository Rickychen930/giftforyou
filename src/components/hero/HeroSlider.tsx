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

import "../../styles/hero/HeroSlider.css";
import { STORE_PROFILE } from "../../config/store-profile";
import { API_BASE } from "../../config/api";
import HeroSlide, { HeroSlideData } from "./HeroSlide";
import HeroNavigation from "./HeroNavigation";
import HeroIndicators from "./HeroIndicators";
import HeroProgress from "./HeroProgress";
import HeroPlayPause from "./HeroPlayPause";
import HeroSkeleton from "./HeroSkeleton";

export interface HeroSliderContent {
  heading?: string;
  slides: HeroSlideData[];
}

export interface HeroSliderProps {
  content?: HeroSliderContent;
  loading?: boolean;
  autoplayDelay?: number;
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

const HeroSlider: React.FC<HeroSliderProps> = ({
  content,
  loading = false,
  autoplayDelay = 6000,
}) => {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const data = useMemo(() => content ?? defaultContent, [content]);

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

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? true;
        setIsVisible(isIntersecting);

        if (swiperInstance.autoplay) {
          if (isIntersecting && isPlaying) {
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
      }
    );

    observer.observe(heroRef.current);

    return () => {
      observer.disconnect();
    };
  }, [swiperInstance, isPlaying]);

  // Track autoplay progress
  useEffect(() => {
    if (!swiperInstance || !isPlaying || !isVisible) {
      setTransitionProgress(0);
      return;
    }

    let startTime = Date.now();
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
  }, [swiperInstance, isPlaying, isVisible, activeIndex, autoplayDelay]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!swiperInstance) return;

    let lastKeyTime = 0;
    const DEBOUNCE_DELAY = 300;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (!isVisible) return;

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

  const handleImageLoad = useCallback((slideId: string) => {
    setImageLoadStates((prev) => ({ ...prev, [slideId]: true }));
  }, []);

  const handleImageError = useCallback((slideId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const placeholderSrc = "/images/placeholder-bouquet.jpg";
    
    if (target.src && !target.src.includes(placeholderSrc)) {
      target.src = placeholderSrc;
      return;
    }
    
    target.style.display = "none";
    handleImageLoad(slideId);
  }, [handleImageLoad]);

  // Image preloading
  useEffect(() => {
    if (data.slides.length === 0) return;

    const preloadImages: HTMLImageElement[] = [];
    const maxPreload = Math.min(2, data.slides.length);

    for (let i = 0; i < maxPreload; i++) {
      const slide = data.slides[i];
      const img = new Image();
      img.onerror = () => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Failed to preload image: ${slide.image}`);
        }
      };
      img.src = slide.image.startsWith("/uploads/") 
        ? `${API_BASE}${slide.image}`
        : slide.image;
      preloadImages.push(img);
    }

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
          img.src = slide.image.startsWith("/uploads/") 
            ? `${process.env.REACT_APP_API_BASE || ""}${slide.image}`
            : slide.image;
          preloadImages.push(img);
        }
      }, 1000);
    };

    preloadRemaining();

    return () => {
      preloadImages.forEach((img) => {
        img.onerror = null;
        img.src = "";
      });
    };
  }, [data.slides]);

  const handleNavFocus = useCallback(() => {
    if (swiperInstance) {
      swiperInstance.autoplay?.pause();
    }
  }, [swiperInstance]);

  const handleNavBlur = useCallback(() => {
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
  }, [swiperInstance, isPlaying]);

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
  }, [swiperInstance, isPlaying, isVisible]);

  if (hasError) {
    return (
      <section className="hero-slider hero-slider--error" aria-label="Slider error">
        <div className="hero-slider__error">
          <p>Unable to load slider. Please refresh the page.</p>
        </div>
      </section>
    );
  }

  if (!data.slides || data.slides.length === 0) {
    return (
      <section className="hero-slider hero-slider--empty" aria-label="No slides available">
        <div className="hero-slider__empty">
          <p>No slides available</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return <HeroSkeleton />;
  }

  return (
    <section 
      className="hero-slider" 
      aria-label="Featured collections"
      ref={heroRef}
    >
      <h1 className="sr-only">{STORE_PROFILE.brand.displayName}</h1>
      
      <a href="#main-content" className="hero-slider__skip-link">
        Skip to main content
      </a>

      {data.heading && (
        <div className="hero-slider__kicker-wrapper">
          <p className="hero-slider__kicker">{data.heading}</p>
        </div>
      )}

      <div className="hero-slider__swiper-wrapper">
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
            nextEl: ".hero-slider__nav--next",
            prevEl: ".hero-slider__nav--prev",
          }}
          pagination={false}
          autoplay={{
            delay: autoplayDelay,
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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onReachBeginning={() => {
            if (data.slides.length > 1 && swiperInstance?.params?.loop) {
              setTransitionProgress(0);
            }
          }}
          onReachEnd={() => {
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
          className="hero-slider__swiper"
          role="region"
          aria-roledescription="carousel"
          aria-label="Hero collections slider"
          aria-live="polite"
        >
          {data.slides.map((slide, index) => (
            <SwiperSlide key={slide.id}>
              <HeroSlide
                slide={slide}
                index={index}
                imageLoaded={imageLoadStates[slide.id]}
                onImageLoad={() => handleImageLoad(slide.id)}
                onImageError={(e) => handleImageError(slide.id, e)}
              />
            </SwiperSlide>
          ))}

          {data.slides.length > 1 && (
            <>
              <HeroNavigation
                swiperInstance={swiperInstance}
                onFocus={handleNavFocus}
                onBlur={handleNavBlur}
              />
              <HeroPlayPause isPlaying={isPlaying} onToggle={toggleAutoplay} />
            </>
          )}

          <div className="hero-slider__pagination">
            <HeroIndicators
              totalSlides={data.slides.length}
              activeIndex={activeIndex}
              onSlideClick={(index) => {
                if (swiperInstance) {
                  if (swiperInstance.params?.loop) {
                    swiperInstance.slideToLoop(index);
                  } else {
                    swiperInstance.slideTo(index);
                  }
                }
              }}
            />
          </div>
        </Swiper>
      </div>

      {data.slides.length > 1 && (
        <HeroProgress
          currentIndex={activeIndex}
          totalSlides={data.slides.length}
          autoplayProgress={transitionProgress}
          isPlaying={isPlaying && isVisible}
        />
      )}
    </section>
  );
};

export default HeroSlider;


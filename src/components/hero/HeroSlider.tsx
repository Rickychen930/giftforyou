/**
 * Hero Slider Component (OOP)
 * Class-based component following SOLID principles
 * Note: Uses functional wrapper for Swiper.js integration
 */

import React, { Component, RefObject } from "react";
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

interface HeroSliderState {
  swiperInstance: SwiperType | null;
  activeIndex: number;
  isPlaying: boolean;
  imageLoadStates: Record<string, boolean>;
  isVisible: boolean;
  transitionProgress: number;
  hasError: boolean;
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

/**
 * Hero Slider Component
 * Class-based component for hero slider with Swiper.js integration
 */
class HeroSlider extends Component<HeroSliderProps, HeroSliderState> {
  private baseClass: string = "hero-slider";
  private heroRef: RefObject<HTMLElement>;
  private touchTimeoutRef: NodeJS.Timeout | null = null;
  private focusTimeoutRef: NodeJS.Timeout | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private progressAnimationFrame: number | null = null;
  private progressStartTime: number = 0;
  private progressIsActive: boolean = false;
  private preloadedImages: HTMLImageElement[] = [];
  private slideChangeHandler: (() => void) | null = null;
  private autoplayStopHandler: (() => void) | null = null;

  constructor(props: HeroSliderProps) {
    super(props);
    this.state = {
      swiperInstance: null,
      activeIndex: 0,
      isPlaying: true,
      imageLoadStates: {},
      isVisible: true,
      transitionProgress: 0,
      hasError: false,
    };
    this.heroRef = React.createRef();
  }

  componentDidMount(): void {
    this.preloadImages();
  }

  componentDidUpdate(prevProps: HeroSliderProps, prevState: HeroSliderState): void {
    const { swiperInstance, isPlaying, isVisible } = this.state;
    const { autoplayDelay = 6000 } = this.props;

    // Setup intersection observer when swiper instance is ready
    if (swiperInstance && !prevState.swiperInstance && this.heroRef.current) {
      this.setupIntersectionObserver();
    }

    // Setup keyboard shortcuts when swiper instance is ready
    if (swiperInstance && !prevState.swiperInstance) {
      this.setupKeyboardShortcuts();
    }

    // Track autoplay progress
    if (swiperInstance && isPlaying && isVisible && !prevState.isPlaying) {
      this.startProgressTracking();
    } else if ((!isPlaying || !isVisible) && prevState.isPlaying) {
      this.stopProgressTracking();
    }

    // Cleanup and restart progress if autoplayDelay changes
    if (autoplayDelay !== prevProps.autoplayDelay && swiperInstance && isPlaying && isVisible) {
      this.stopProgressTracking();
      this.startProgressTracking();
    }
  }

  componentWillUnmount(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.touchTimeoutRef) {
      clearTimeout(this.touchTimeoutRef);
    }
    if (this.focusTimeoutRef) {
      clearTimeout(this.focusTimeoutRef);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
    }
    this.stopProgressTracking();
    this.cleanupSwiperListeners();
    this.cleanupPreloadImages();
  }

  private getData(): HeroSliderContent {
    return this.props.content ?? defaultContent;
  }

  private setupIntersectionObserver(): void {
    if (!this.heroRef.current || !this.state.swiperInstance) return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? true;
        this.setState({ isVisible: isIntersecting });

        const { swiperInstance, isPlaying } = this.state;
        if (swiperInstance?.autoplay) {
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

    this.intersectionObserver.observe(this.heroRef.current);
  }

  private setupKeyboardShortcuts(): void {
    if (!this.state.swiperInstance) return;

    let lastKeyTime = 0;
    const DEBOUNCE_DELAY = 300;

    this.keyboardHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (!this.state.isVisible) return;

      const now = Date.now();
      if (now - lastKeyTime < DEBOUNCE_DELAY) {
        return;
      }
      lastKeyTime = now;

      const { swiperInstance } = this.state;
      const data = this.getData();

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          swiperInstance?.slidePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          swiperInstance?.slideNext();
          break;
        case " ":
          e.preventDefault();
          this.toggleAutoplay();
          break;
        case "Home":
          e.preventDefault();
          if (data.slides.length > 1 && swiperInstance?.params?.loop) {
            swiperInstance.slideToLoop(0);
          } else {
            swiperInstance?.slideTo(0);
          }
          break;
        case "End":
          e.preventDefault();
          if (data.slides.length > 1 && swiperInstance?.params?.loop) {
            swiperInstance.slideToLoop(data.slides.length - 1);
          } else {
            swiperInstance?.slideTo(data.slides.length - 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", this.keyboardHandler, { passive: false });
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    const { autoplayDelay = 6000 } = this.props;
    this.progressIsActive = true;
    this.progressStartTime = Date.now();

    const updateProgress = () => {
      if (!this.progressIsActive) return;

      const elapsed = Date.now() - this.progressStartTime;
      const progress = Math.min((elapsed / autoplayDelay) * 100, 100);
      this.setState({ transitionProgress: progress });

      if (progress < 100 && this.progressIsActive) {
        this.progressAnimationFrame = requestAnimationFrame(updateProgress);
      } else if (this.progressIsActive) {
        this.setState({ transitionProgress: 0 });
        this.progressStartTime = Date.now();
        this.progressAnimationFrame = requestAnimationFrame(updateProgress);
      }
    };

    this.progressAnimationFrame = requestAnimationFrame(updateProgress);
  }

  private stopProgressTracking(): void {
    this.progressIsActive = false;
    if (this.progressAnimationFrame !== null) {
      cancelAnimationFrame(this.progressAnimationFrame);
      this.progressAnimationFrame = null;
    }
  }

  private cleanupSwiperListeners(): void {
    const { swiperInstance } = this.state;
    if (swiperInstance) {
      if (this.slideChangeHandler) {
        swiperInstance.off("slideChange", this.slideChangeHandler);
      }
      if (this.autoplayStopHandler) {
        swiperInstance.off("autoplayStop", this.autoplayStopHandler);
      }
    }
  }

  private setupSwiperListeners(): void {
    const { swiperInstance } = this.state;
    if (!swiperInstance) return;

    this.slideChangeHandler = () => {
      this.setState({ transitionProgress: 0 });
      this.progressStartTime = Date.now();
    };

    this.autoplayStopHandler = () => {
      this.setState({ transitionProgress: 0 });
    };

    swiperInstance.on("slideChange", this.slideChangeHandler);
    swiperInstance.on("autoplayStop", this.autoplayStopHandler);
  }

  private preloadImages(): void {
    const data = this.getData();
    if (data.slides.length === 0) return;

    this.cleanupPreloadImages();

    const maxPreload = Math.min(2, data.slides.length);

    for (let i = 0; i < maxPreload; i++) {
      const slide = data.slides[i];
      const img = new Image();
      img.onerror = () => {
        if (process.env.NODE_ENV === "development") {
          console.warn(`Failed to preload image: ${slide.image}`);
        }
      };
      img.src = slide.image.startsWith("/uploads/") ? `${API_BASE}${slide.image}` : slide.image;
      this.preloadedImages.push(img);
    }

    if (data.slides.length > maxPreload) {
      setTimeout(() => {
        for (let i = maxPreload; i < data.slides.length; i++) {
          const slide = data.slides[i];
          const img = new Image();
          img.onerror = () => {
            if (process.env.NODE_ENV === "development") {
              console.warn(`Failed to preload image: ${slide.image}`);
            }
          };
          img.src = slide.image.startsWith("/uploads/")
            ? `${process.env.REACT_APP_API_BASE || ""}${slide.image}`
            : slide.image;
          this.preloadedImages.push(img);
        }
      }, 1000);
    }
  }

  private cleanupPreloadImages(): void {
    this.preloadedImages.forEach((img) => {
      img.onerror = null;
      img.src = "";
    });
    this.preloadedImages = [];
  }

  private handleSwiperInit = (swiper: SwiperType): void => {
    try {
      this.setState({ swiperInstance: swiper, hasError: false });
      this.setupSwiperListeners();
    } catch (error) {
      console.error("Error initializing Swiper:", error);
      this.setState({ hasError: true });
    }
  };

  private handleSlideChange = (swiper: SwiperType): void => {
    this.setState({ activeIndex: swiper.realIndex, transitionProgress: 0 });
  };

  private toggleAutoplay = (): void => {
    const { swiperInstance, isPlaying } = this.state;
    if (!swiperInstance?.autoplay) return;

    if (isPlaying) {
      swiperInstance.autoplay.stop();
      this.setState({ isPlaying: false, transitionProgress: 0 });
    } else {
      swiperInstance.autoplay.start();
      this.setState({ isPlaying: true });
    }
  };

  private handleImageLoad = (slideId: string): void => {
    this.setState((prevState) => ({
      imageLoadStates: { ...prevState.imageLoadStates, [slideId]: true },
    }));
  };

  private handleImageError = (slideId: string, e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.currentTarget;
    const placeholderSrc = "/images/placeholder-bouquet.jpg";

    if (target.src && !target.src.includes(placeholderSrc)) {
      target.src = placeholderSrc;
      return;
    }

    target.style.display = "none";
    this.handleImageLoad(slideId);
  };

  private handleNavFocus = (): void => {
    const { swiperInstance } = this.state;
    if (swiperInstance) {
      swiperInstance.autoplay?.pause();
    }
  };

  private handleNavBlur = (): void => {
    if (this.focusTimeoutRef) {
      clearTimeout(this.focusTimeoutRef);
    }

    const { swiperInstance, isPlaying } = this.state;
    if (swiperInstance && isPlaying) {
      this.focusTimeoutRef = setTimeout(() => {
        if (swiperInstance?.autoplay && isPlaying) {
          swiperInstance.autoplay.resume();
        }
        this.focusTimeoutRef = null;
      }, 500);
    }
  };

  private handleTouchStart = (): void => {
    const { swiperInstance, isPlaying } = this.state;
    if (swiperInstance?.autoplay && isPlaying) {
      swiperInstance.autoplay.pause();
    }
  };

  private handleTouchEnd = (): void => {
    if (this.touchTimeoutRef) {
      clearTimeout(this.touchTimeoutRef);
    }

    const { swiperInstance, isPlaying, isVisible } = this.state;
    if (swiperInstance?.autoplay && isPlaying && isVisible) {
      this.touchTimeoutRef = setTimeout(() => {
        if (swiperInstance?.autoplay && isPlaying && isVisible) {
          swiperInstance.autoplay.resume();
        }
        this.touchTimeoutRef = null;
      }, 1500);
    }
  };

  private handleReachBeginning = (): void => {
    const data = this.getData();
    const { swiperInstance } = this.state;
    if (data.slides.length > 1 && swiperInstance?.params?.loop) {
      this.setState({ transitionProgress: 0 });
    }
  };

  private handleReachEnd = (): void => {
    const data = this.getData();
    const { swiperInstance } = this.state;
    if (data.slides.length > 1 && swiperInstance?.params?.loop) {
      this.setState({ transitionProgress: 0 });
    }
  };

  render(): React.ReactNode {
    const { loading = false, autoplayDelay = 6000 } = this.props;
    const { hasError, activeIndex, isPlaying, imageLoadStates, transitionProgress, isVisible, swiperInstance } =
      this.state;
    const data = this.getData();

    if (hasError) {
      return (
        <section className={`${this.baseClass} ${this.baseClass}--error`} aria-label="Slider error">
          <div className={`${this.baseClass}__error`}>
            <p>Unable to load slider. Please refresh the page.</p>
          </div>
        </section>
      );
    }

    if (!data.slides || data.slides.length === 0) {
      return (
        <section className={`${this.baseClass} ${this.baseClass}--empty`} aria-label="No slides available">
          <div className={`${this.baseClass}__empty`}>
            <p>No slides available</p>
          </div>
        </section>
      );
    }

    if (loading) {
      return <HeroSkeleton />;
    }

    return (
      <section className={this.baseClass} aria-label="Featured collections" ref={this.heroRef}>
        <h1 className="sr-only">{STORE_PROFILE.brand.displayName}</h1>

        <a href="#main-content" className={`${this.baseClass}__skip-link`}>
          Skip to main content
        </a>

        {data.heading && (
          <div className={`${this.baseClass}__kicker-wrapper`}>
            <p className={`${this.baseClass}__kicker`}>{data.heading}</p>
          </div>
        )}

        <div className={`${this.baseClass}__swiper-wrapper`}>
          <Swiper
            modules={[Autoplay, Navigation, Pagination, EffectFade, A11y, Parallax, Keyboard]}
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
            onSwiper={this.handleSwiperInit}
            onSlideChange={this.handleSlideChange}
            onTouchStart={this.handleTouchStart}
            onTouchEnd={this.handleTouchEnd}
            onReachBeginning={this.handleReachBeginning}
            onReachEnd={this.handleReachEnd}
            a11y={{
              enabled: true,
              prevSlideMessage: "Previous slide",
              nextSlideMessage: "Next slide",
              firstSlideMessage: "This is the first slide",
              lastSlideMessage: "This is the last slide",
              paginationBulletMessage: "Go to slide {{index}}",
            }}
            className={`${this.baseClass}__swiper`}
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
                  onImageLoad={() => this.handleImageLoad(slide.id)}
                  onImageError={(e) => this.handleImageError(slide.id, e)}
                />
              </SwiperSlide>
            ))}

            {data.slides.length > 1 && (
              <>
                <HeroNavigation
                  swiperInstance={swiperInstance}
                  onFocus={this.handleNavFocus}
                  onBlur={this.handleNavBlur}
                />
                <HeroPlayPause isPlaying={isPlaying} onToggle={this.toggleAutoplay} />
              </>
            )}
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
  }
}

export default HeroSlider;

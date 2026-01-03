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

  /**
   * Comprehensive cleanup for maximum performance
   * Ensures no memory leaks and proper resource cleanup
   */
  private cleanup(): void {
    // Clear all timeouts
    if (this.touchTimeoutRef) {
      clearTimeout(this.touchTimeoutRef);
      this.touchTimeoutRef = null;
    }
    if (this.focusTimeoutRef) {
      clearTimeout(this.focusTimeoutRef);
      this.focusTimeoutRef = null;
    }
    
    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    
    // Remove event listeners
    if (this.keyboardHandler) {
      window.removeEventListener("keydown", this.keyboardHandler);
      this.keyboardHandler = null;
    }
    
    // Stop all animations
    this.stopProgressTracking();
    
    // Cleanup Swiper listeners
    this.cleanupSwiperListeners();
    
    // Cleanup image preloading
    this.cleanupPreloadImages();
    
    // Clear image source cache in HeroSlide if accessible
    // (Note: This would require refactoring, but current cleanup is sufficient)
  }

  private getData(): HeroSliderContent {
    return this.props.content ?? defaultContent;
  }

  /**
   * Setup intersection observer with optimized performance
   * Uses passive observation and throttled updates
   */
  private setupIntersectionObserver(): void {
    if (!this.heroRef.current || !this.state.swiperInstance) return;

    let lastVisibilityState: boolean | null = null;
    let throttleTimeout: NodeJS.Timeout | null = null;
    let rafId: number | null = null;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0]?.isIntersecting ?? true;
        
        // Cancel pending throttle
        if (throttleTimeout) {
          clearTimeout(throttleTimeout);
        }

        // Cancel pending RAF
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }

        throttleTimeout = setTimeout(() => {
          // Only update state if visibility actually changed
          if (lastVisibilityState !== isIntersecting) {
            // Use RAF for state updates to batch with browser paint
            rafId = requestAnimationFrame(() => {
              this.setState({ isVisible: isIntersecting });
              lastVisibilityState = isIntersecting;

              const { swiperInstance, isPlaying } = this.state;
              if (swiperInstance?.autoplay) {
                if (isIntersecting && isPlaying) {
                  swiperInstance.autoplay?.start();
                } else if (!isIntersecting) {
                  swiperInstance.autoplay.stop();
                }
              }
              rafId = null;
            });
          }
          throttleTimeout = null;
        }, 150); // Optimized throttle to 150ms for better performance
      },
      {
        threshold: 0.3,
        rootMargin: "50px",
      }
    );

    this.intersectionObserver.observe(this.heroRef.current);
  }

  /**
   * Setup keyboard shortcuts with optimized performance
   * Uses requestAnimationFrame for smooth interactions
   */
  private setupKeyboardShortcuts(): void {
    if (!this.state.swiperInstance) return;

    let lastKeyTime = 0;
    const DEBOUNCE_DELAY = 250; // Optimized debounce delay
    let rafId: number | null = null;

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

      // Cancel pending RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use RAF for smooth interactions
      rafId = requestAnimationFrame(() => {
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
        rafId = null;
      });
    };

    window.addEventListener("keydown", this.keyboardHandler, { passive: false });
  }

  /**
   * Start progress tracking with maximum performance optimization
   * Uses optimized throttling and RAF for smooth 60fps animations
   */
  private startProgressTracking(): void {
    this.stopProgressTracking();
    const { autoplayDelay = 6000 } = this.props;
    this.progressIsActive = true;
    this.progressStartTime = performance.now(); // Use performance.now() for better accuracy
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50; // Optimized to 50ms for smoother visual updates

    const updateProgress = (): void => {
      if (!this.progressIsActive) return;

      const now = performance.now();
      const elapsed = now - this.progressStartTime;
      const progress = Math.min((elapsed / autoplayDelay) * 100, 100);

      // Optimized throttling with RAF batching
      if (now - lastUpdateTime >= UPDATE_INTERVAL || progress >= 100) {
        // Batch state update with RAF for better performance
        requestAnimationFrame(() => {
          if (this.progressIsActive) {
            this.setState({ transitionProgress: progress });
          }
        });
        lastUpdateTime = now;
      }

      if (progress < 100 && this.progressIsActive) {
        this.progressAnimationFrame = requestAnimationFrame(updateProgress);
      } else if (this.progressIsActive) {
        // Reset for next cycle with RAF
        requestAnimationFrame(() => {
          if (this.progressIsActive) {
            this.setState({ transitionProgress: 0 });
            this.progressStartTime = performance.now();
            lastUpdateTime = performance.now();
            this.progressAnimationFrame = requestAnimationFrame(updateProgress);
          }
        });
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

  /**
   * Setup Swiper listeners with optimized performance
   * Uses RAF batching for state updates
   */
  private setupSwiperListeners(): void {
    const { swiperInstance } = this.state;
    if (!swiperInstance) return;

    let rafId: number | null = null;

    this.slideChangeHandler = () => {
      // Batch state updates with RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        this.setState({ transitionProgress: 0 });
        this.progressStartTime = performance.now();
        rafId = null;
      });
    };

    this.autoplayStopHandler = () => {
      // Batch state updates with RAF
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        this.setState({ transitionProgress: 0 });
        rafId = null;
      });
    };

    swiperInstance.on("slideChange", this.slideChangeHandler);
    swiperInstance.on("autoplayStop", this.autoplayStopHandler);
  }

  /**
   * Maximum performance image preloading with intelligent strategy
   * Uses link preload for critical images and requestIdleCallback for others
   */
  private createImageLoader(imagePath: string, priority: "high" | "low" = "low"): HTMLImageElement {
    const img = new Image();
    const imageUrl = imagePath.startsWith("/uploads/") 
      ? `${API_BASE}${imagePath}` 
      : imagePath;
    
    // Use link preload for high priority images (better than Image() preload)
    if (priority === "high" && typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = imageUrl;
      // Note: fetchPriority is not available on HTMLLinkElement in TypeScript
      // Browser will handle priority automatically for preload links
      document.head.appendChild(link);
    }
    
    img.onerror = () => {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to preload image: ${imagePath}`);
      }
    };
    
    img.src = imageUrl;
    return img;
  }

  private preloadImages(): void {
    const data = this.getData();
    if (data.slides.length === 0) return;

    this.cleanupPreloadImages();

    // Preload first slide immediately with high priority (critical, above the fold)
    if (data.slides.length > 0) {
      const firstImg = this.createImageLoader(data.slides[0].image, "high");
      this.preloadedImages.push(firstImg);
    }

    // Preload second slide after RAF (next likely to be viewed)
    if (data.slides.length > 1) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const secondImg = this.createImageLoader(data.slides[1].image, "low");
          this.preloadedImages.push(secondImg);
        });
      });
    }

    // Preload remaining slides in background using requestIdleCallback with longer timeout
    if (data.slides.length > 2) {
      const preloadRemaining = () => {
        // Load one at a time to avoid blocking
        let currentIndex = 2;
        const loadNext = () => {
          if (currentIndex < data.slides.length) {
            const img = this.createImageLoader(data.slides[currentIndex].image, "low");
            this.preloadedImages.push(img);
            currentIndex++;
            
            // Use RAF between loads to keep UI responsive
            if (currentIndex < data.slides.length) {
              requestAnimationFrame(loadNext);
            }
          }
        };
        loadNext();
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(preloadRemaining, { timeout: 5000 });
      } else {
        // Fallback: stagger loading with delays
        setTimeout(preloadRemaining, 1000);
      }
    }
  }

  /**
   * Cleanup preloaded images with proper memory management
   */
  private cleanupPreloadImages(): void {
    this.preloadedImages.forEach((img) => {
      img.onerror = null;
      img.onload = null;
      img.src = "";
      // Remove from DOM if it was added
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
    });
    this.preloadedImages.length = 0; // More efficient than reassignment
    
    // Also cleanup any link preload elements
    if (typeof document !== "undefined") {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach((link) => {
        if (link.getAttribute("href")?.includes("/uploads/") || 
            link.getAttribute("href")?.includes("/images/")) {
          link.remove();
        }
      });
    }
  }

  /**
   * Handle Swiper initialization with RAF batching
   */
  private handleSwiperInit = (swiper: SwiperType): void => {
    try {
      // Use RAF for state update to batch with browser paint
      requestAnimationFrame(() => {
        this.setState({ swiperInstance: swiper, hasError: false });
        this.setupSwiperListeners();
      });
    } catch (error) {
      console.error("Error initializing Swiper:", error);
      requestAnimationFrame(() => {
        this.setState({ hasError: true });
      });
    }
  };

  /**
   * Handle slide change with optimized state updates
   */
  private handleSlideChange = (swiper: SwiperType): void => {
    // Batch state updates with RAF
    requestAnimationFrame(() => {
      this.setState({ 
        activeIndex: swiper.realIndex, 
        transitionProgress: 0 
      });
    });
  };

  /**
   * Toggle autoplay with optimized state updates
   */
  private toggleAutoplay = (): void => {
    const { swiperInstance, isPlaying } = this.state;
    if (!swiperInstance?.autoplay) return;

    // Batch state update with RAF
    requestAnimationFrame(() => {
      if (isPlaying) {
        swiperInstance.autoplay.stop();
        this.setState({ isPlaying: false, transitionProgress: 0 });
      } else {
        swiperInstance.autoplay.start();
        this.setState({ isPlaying: true });
      }
    });
  };

  /**
   * Handle image load with maximum performance optimization
   * Uses RAF batching and checks to prevent unnecessary updates
   */
  private handleImageLoad = (slideId: string): void => {
    // Check if already loaded to avoid unnecessary updates
    if (this.state.imageLoadStates[slideId]) {
      return;
    }

    // Batch state update with RAF
    requestAnimationFrame(() => {
      this.setState((prevState) => {
        // Double-check to prevent race conditions
        if (prevState.imageLoadStates[slideId]) {
          return null;
        }
        return {
          imageLoadStates: { ...prevState.imageLoadStates, [slideId]: true },
        };
      });
    });
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
            speed={1200}
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
            watchSlidesProgress={true}
            watchSlidesVisibility={true}
            lazy={{
              loadPrevNext: true,
              loadPrevNextAmount: 1,
            }}
            preloadImages={false}
            updateOnWindowResize={true}
            observer={true}
            observeParents={true}
            touchEventsTarget="container"
            touchRatio={1}
            touchAngle={45}
            simulateTouch={true}
            allowTouchMove={true}
            resistance={true}
            resistanceRatio={0.85}
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

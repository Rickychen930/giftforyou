import { useState, useCallback, useEffect, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

interface UseHeroSliderOptions {
  autoplayDelay?: number;
  onSlideChange?: (index: number) => void;
}

/**
 * Custom hook for hero slider logic
 * Handles autoplay, visibility, progress tracking, and keyboard controls
 * Follows SOLID principles - single responsibility
 */
export const useHeroSlider = (
  swiperInstance: SwiperType | null,
  slidesCount: number,
  options: UseHeroSliderOptions = {}
) => {
  const { autoplayDelay = 6000, onSlideChange } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, boolean>>({});

  const heroRef = useRef<HTMLElement | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimationRef = useRef<number | null>(null);

  // Toggle autoplay
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
    // Capture refs in closure to avoid stale refs
    const touchTimeout = touchTimeoutRef.current;
    const focusTimeout = focusTimeoutRef.current;
    const progressAnimation = progressAnimationRef.current;

    return () => {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
      if (focusTimeout) {
        clearTimeout(focusTimeout);
      }
      if (progressAnimation !== null) {
        cancelAnimationFrame(progressAnimation);
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
    let isActive = true;

    const updateProgress = () => {
      if (!isActive) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / autoplayDelay) * 100, 100);
      setTransitionProgress(progress);

      if (progress < 100 && isActive) {
        progressAnimationRef.current = requestAnimationFrame(updateProgress);
      } else if (isActive) {
        setTransitionProgress(0);
        startTime = Date.now();
        progressAnimationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    progressAnimationRef.current = requestAnimationFrame(updateProgress);

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
      if (progressAnimationRef.current !== null) {
        cancelAnimationFrame(progressAnimationRef.current);
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
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
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
          if (slidesCount > 1 && swiperInstance.params?.loop) {
            swiperInstance.slideToLoop(0);
          } else {
            swiperInstance.slideTo(0);
          }
          break;
        case "End":
          e.preventDefault();
          if (slidesCount > 1 && swiperInstance.params?.loop) {
            swiperInstance.slideToLoop(slidesCount - 1);
          } else {
            swiperInstance.slideTo(slidesCount - 1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [swiperInstance, toggleAutoplay, slidesCount, isVisible]);

  // Handle image load
  const handleImageLoad = useCallback((slideId: string) => {
    setImageLoadStates((prev) => ({ ...prev, [slideId]: true }));
  }, []);

  // Handle slide change
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const newIndex = swiper.realIndex;
      setActiveIndex(newIndex);
      setTransitionProgress(0);
      onSlideChange?.(newIndex);
    },
    [onSlideChange]
  );

  return {
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
  };
};


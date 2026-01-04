import { API_BASE } from "../config/api";

/**
 * Utility functions for hero slider
 * Follows DRY principle - reusable functions
 */

export const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Check if in development mode (safe for TypeScript)
 */
export const isDevelopment = (): boolean => {
  return (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "development"
  );
};

/**
 * Resolves image source URL
 * - /uploads/... -> serve from backend API_BASE
 * - /images/...  -> serve from frontend public folder
 * - http...      -> keep as-is
 */
export const resolveImageSrc = (image: string): string => {
  const v = (image ?? "").trim();
  if (!v) return "/images/placeholder-bouquet.jpg";
  if (isExternal(v)) return v;

  if (v.startsWith("/uploads/")) {
    return `${API_BASE}${v}`;
  }

  return v;
};

/**
 * Preloads images for better performance
 * Returns cleanup function
 */
export const preloadImages = (
  imageUrls: string[],
  onComplete?: () => void
): (() => void) => {
  const images: HTMLImageElement[] = [];
  let loadedCount = 0;

  imageUrls.forEach((url) => {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      if (loadedCount === imageUrls.length) {
        onComplete?.();
      }
    };
    img.onerror = () => {
      // Silently handle errors
      loadedCount++;
      if (loadedCount === imageUrls.length) {
        onComplete?.();
      }
    };
    img.src = resolveImageSrc(url);
    images.push(img);
  });

  return () => {
    images.forEach((img) => {
      img.onload = null;
      img.onerror = null;
      img.src = "";
    });
  };
};

/**
 * Validates hero slide data
 */
export const validateHeroSlide = (slide: any): boolean => {
  return (
    slide &&
    typeof slide === "object" &&
    typeof slide.id === "string" &&
    slide.id.length > 0 &&
    typeof slide.title === "string" &&
    slide.title.length > 0 &&
    typeof slide.image === "string" &&
    slide.image.length > 0 &&
    slide.primaryCta &&
    typeof slide.primaryCta.label === "string" &&
    slide.primaryCta.label.length > 0 &&
    typeof slide.primaryCta.href === "string" &&
    slide.primaryCta.href.length > 0
  );
};

/**
 * Validates hero slider content
 */
export const validateHeroSliderContent = (content: any): boolean => {
  if (!content || typeof content !== "object") return false;
  if (!Array.isArray(content.slides)) return false;
  if (content.slides.length === 0) return false;
  return content.slides.every(validateHeroSlide);
};


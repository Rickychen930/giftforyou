import { API_BASE } from "../config/api";

/**
 * Image Optimization Utilities
 * Handles responsive images, format detection, and optimization
 */

const isExternal = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Resolves image source URL
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
 * Generates responsive image srcset
 * Returns srcset string for different screen sizes
 */
export const generateSrcSet = (image: string): string => {
  const baseSrc = resolveImageSrc(image);
  
  // If external URL, return as-is
  if (isExternal(baseSrc)) {
    return baseSrc;
  }

  // For uploaded images, we could generate different sizes
  // For now, return single source (can be enhanced with image CDN)
  return baseSrc;
};

/**
 * Detects if browser supports WebP
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  });
};

/**
 * Detects if browser supports AVIF
 */
export const supportsAVIF = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  });
};

/**
 * Gets optimal image format based on browser support
 */
export const getOptimalImageFormat = async (): Promise<"avif" | "webp" | "jpeg"> => {
  if (await supportsAVIF()) {
    return "avif";
  }
  if (await supportsWebP()) {
    return "webp";
  }
  return "jpeg";
};

/**
 * Generates responsive sizes attribute
 */
export const getResponsiveSizes = (): string => {
  return "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw";
};


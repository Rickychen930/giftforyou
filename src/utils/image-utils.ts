import { API_BASE } from "../config/api";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

/**
 * Builds a complete image URL from a relative path or returns the URL if it's already absolute
 * @param image - Image path or URL
 * @param fallback - Optional fallback image path (defaults to placeholder)
 * @returns Complete image URL
 */
export function buildImageUrl(image?: string, fallback?: string): string {
  if (!image) return fallback || FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("blob:")) return image;
  return `${API_BASE}${image.startsWith("/") ? image : `/${image}`}`;
}

/**
 * Builds preview URL for blob images
 * @param preview - Blob URL or image path
 * @returns Preview URL
 */
export function buildPreviewUrl(preview: string): string {
  if (!preview) return "";
  if (preview.startsWith("blob:")) return preview;
  return buildImageUrl(preview);
}

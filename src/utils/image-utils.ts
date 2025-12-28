import { API_BASE } from "../config/api";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

export function buildImageUrl(image?: string): string {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
}


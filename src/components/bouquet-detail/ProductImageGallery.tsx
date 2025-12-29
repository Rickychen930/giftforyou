import React, { useState, useEffect } from "react";
import "../../styles/bouquet-detail/ProductImageGallery.css";
import { API_BASE } from "../../config/api";

interface ProductImageGalleryProps {
  image?: string;
  name: string;
  fallbackImage?: string;
}

const buildImageUrl = (image?: string, fallback?: string): string => {
  if (!image) return fallback || "/images/placeholder-bouquet.jpg";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  image,
  name,
  fallbackImage = "/images/placeholder-bouquet.jpg",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const imageUrl = buildImageUrl(image, fallbackImage);
  const displayImage = imageError ? fallbackImage : imageUrl;

  // Reset image state when image prop changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  return (
    <>
      <div className="product-image-gallery">
        <div className="product-image-gallery__main">
          <div className="product-image-gallery__wrapper">
            <img
              src={displayImage}
              alt={name}
              className={`product-image-gallery__image ${
                imageLoaded ? "product-image-gallery__image--loaded" : ""
              }`}
              onLoad={() => {
                setImageLoaded(true);
                setImageError(false);
              }}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              onClick={() => setShowLightbox(true)}
              loading="eager"
              decoding="async"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowLightbox(true);
                }
              }}
            />
            {!imageLoaded && (
              <div className="product-image-gallery__placeholder">
                <div className="product-image-gallery__spinner"></div>
              </div>
            )}
            <button
              type="button"
              className="product-image-gallery__zoom"
              onClick={() => setShowLightbox(true)}
              aria-label="Perbesar gambar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showLightbox && (
        <div
          className="product-image-gallery__lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLightbox(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowLightbox(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox gambar"
          tabIndex={-1}
        >
          <div className="product-image-gallery__lightbox-content">
            <button
              type="button"
              className="product-image-gallery__lightbox-close"
              onClick={() => setShowLightbox(false)}
              aria-label="Tutup lightbox"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <img
              src={displayImage}
              alt={name}
              className="product-image-gallery__lightbox-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;


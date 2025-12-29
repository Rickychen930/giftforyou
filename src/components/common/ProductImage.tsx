import React, { useState, useEffect } from "react";
import "../../styles/common/ProductImage.css";
import { buildImageUrl } from "../../utils/image-utils";
import ImageLightbox from "./ImageLightbox";

export interface ProductImageProps {
  image?: string;
  alt: string;
  fallbackImage?: string;
  className?: string;
  aspectRatio?: string;
  showLightbox?: boolean;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

const ProductImage: React.FC<ProductImageProps> = ({
  image,
  alt,
  fallbackImage = "/images/placeholder-bouquet.jpg",
  className = "",
  aspectRatio = "4 / 5",
  showLightbox = true,
  loading = "lazy",
  onLoad,
  onError,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLightboxState, setShowLightboxState] = useState(false);

  const imageUrl = image ? buildImageUrl(image, fallbackImage) : buildImageUrl(fallbackImage);
  const displayImage = imageError ? buildImageUrl(fallbackImage) : imageUrl;

  // Reset image state when image prop changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [image]);

  const handleLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setImageLoaded(true);
    onError?.();
  };

  return (
    <>
      <div
        className={`product-image ${className}`}
        style={{ aspectRatio }}
      >
        <div className="product-image__wrapper">
          <img
            src={displayImage}
            alt={alt}
            className={`product-image__img ${
              imageLoaded ? "product-image__img--loaded" : ""
            }`}
            onLoad={handleLoad}
            onError={handleError}
            onClick={() => showLightbox && setShowLightboxState(true)}
            loading={loading}
            decoding="async"
            role={showLightbox ? "button" : undefined}
            tabIndex={showLightbox ? 0 : undefined}
            onKeyDown={
              showLightbox
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setShowLightboxState(true);
                    }
                  }
                : undefined
            }
          />
          {!imageLoaded && (
            <div className="product-image__placeholder">
              <div className="product-image__spinner"></div>
            </div>
          )}
          {showLightbox && imageLoaded && (
            <button
              type="button"
              className="product-image__zoom"
              onClick={() => setShowLightboxState(true)}
              aria-label="Perbesar gambar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {showLightbox && (
        <ImageLightbox
          isOpen={showLightboxState}
          imageUrl={displayImage}
          imageAlt={alt}
          onClose={() => setShowLightboxState(false)}
        />
      )}
    </>
  );
};

export default ProductImage;


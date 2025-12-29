import React, { useEffect, useCallback } from "react";
import "../../styles/common/ImageLightbox.css";

export interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt?: string;
  onClose: () => void;
  showDownload?: boolean;
  className?: string;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  imageUrl,
  imageAlt = "Image",
  onClose,
  showDownload = false,
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className={`image-lightbox ${className}`}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
    >
      <div className="image-lightbox__container">
        <button
          type="button"
          className="image-lightbox__close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="image-lightbox__image-wrapper">
          <img
            src={imageUrl}
            alt={imageAlt}
            className="image-lightbox__image"
            loading="eager"
          />
        </div>
        {showDownload && (
          <div className="image-lightbox__actions">
            <a
              href={imageUrl}
              download
              className="image-lightbox__action-btn"
              aria-label="Download image"
              onClick={(e) => e.stopPropagation()}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 17V3M12 17l-4-4m4 4l4-4M20 21H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;


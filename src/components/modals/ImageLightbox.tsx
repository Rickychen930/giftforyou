/**
 * Image Lightbox Component (OOP)
 * Extends BaseModal following SOLID principles
 */

import React from "react";
import { BaseModal, BaseModalProps } from "../base/BaseModal";
import "../../styles/common/ImageLightbox.css";

interface ImageLightboxProps extends Omit<BaseModalProps, "title"> {
  imageUrl: string;
  imageAlt?: string;
  showDownload?: boolean;
}

interface ImageLightboxState {
  isVisible: boolean;
  isExiting: boolean;
}

/**
 * Image Lightbox Component
 * Class-based component extending BaseModal
 */
class ImageLightbox extends BaseModal<ImageLightboxProps, ImageLightboxState> {
  protected baseClass: string = "image-lightbox";


  protected renderBody(): React.ReactNode {
    const { imageUrl, imageAlt = "Image", showDownload = false, className = "" } = this.props;

    return (
      <div className={`${this.baseClass}__container ${className}`}>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
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
        <div className={`${this.baseClass}__image-wrapper`}>
          <img
            src={imageUrl}
            alt={imageAlt}
            className={`${this.baseClass}__image`}
            loading="eager"
          />
        </div>
        {showDownload && (
          <div className={`${this.baseClass}__actions`}>
            <a
              href={imageUrl}
              download
              className={`${this.baseClass}__action-btn`}
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
    );
  }

  protected renderHeader(): React.ReactNode {
    return null; // No header for lightbox
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer for lightbox
  }

  render(): React.ReactNode {
    if (!this.props.isOpen) return null;

    return (
      <div
        className={this.getOverlayClasses()}
        onClick={this.handleOverlayClick}
        onKeyDown={this.handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="Image lightbox"
        tabIndex={-1}
      >
        {this.renderBody()}
      </div>
    );
  }
}

export default ImageLightbox;
export type { ImageLightboxProps };


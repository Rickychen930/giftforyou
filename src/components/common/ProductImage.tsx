/**
 * Product Image Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
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

interface ProductImageState {
  imageLoaded: boolean;
  imageError: boolean;
  showLightbox: boolean;
}

/**
 * Product Image Component
 * Class-based component for product images with lightbox
 */
class ProductImage extends Component<ProductImageProps, ProductImageState> {
  private baseClass: string = "product-image";

  constructor(props: ProductImageProps) {
    super(props);
    this.state = {
      imageLoaded: false,
      imageError: false,
      showLightbox: false,
    };
  }

  componentDidUpdate(prevProps: ProductImageProps): void {
    if (prevProps.image !== this.props.image) {
      this.setState({
        imageLoaded: false,
        imageError: false,
      });
    }
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private getImageUrl(): string {
    const { image, fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;
    return image ? buildImageUrl(image, fallbackImage) : buildImageUrl(fallbackImage);
  }

  private getDisplayImage(): string {
    const { fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;
    const { imageError } = this.state;
    return imageError ? buildImageUrl(fallbackImage) : this.getImageUrl();
  }

  private handleLoad = (): void => {
    this.setState({
      imageLoaded: true,
      imageError: false,
    });
    this.props.onLoad?.();
  };

  private handleError = (): void => {
    this.setState({
      imageError: true,
      imageLoaded: true,
    });
    this.props.onError?.();
  };

  private handleImageClick = (): void => {
    const { showLightbox = true } = this.props;
    if (showLightbox) {
      this.setState({ showLightbox: true });
    }
  };

  private handleKeyDown = (e: React.KeyboardEvent<HTMLImageElement>): void => {
    const { showLightbox = true } = this.props;
    if (showLightbox && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      this.setState({ showLightbox: true });
    }
  };

  private handleCloseLightbox = (): void => {
    this.setState({ showLightbox: false });
  };

  private renderPlaceholder(): React.ReactNode {
    const { imageLoaded } = this.state;
    if (imageLoaded) return null;

    return (
      <div className={`${this.baseClass}__placeholder`}>
        <div className={`${this.baseClass}__spinner`}></div>
      </div>
    );
  }

  private renderZoomButton(): React.ReactNode {
    const { showLightbox = true } = this.props;
    const { imageLoaded } = this.state;
    if (!showLightbox || !imageLoaded) return null;

    return (
      <button
        type="button"
        className={`${this.baseClass}__zoom`}
        onClick={this.handleImageClick}
        aria-label="Perbesar gambar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  render(): React.ReactNode {
    const { alt, aspectRatio = "4 / 5", showLightbox = true, loading = "lazy" } = this.props;
    const { imageLoaded, showLightbox: showLightboxState } = this.state;

    return (
      <>
        <div className={this.getClasses()} style={{ aspectRatio }}>
          <div className={`${this.baseClass}__wrapper`}>
            <img
              src={this.getDisplayImage()}
              alt={alt}
              className={`${this.baseClass}__img ${
                imageLoaded ? `${this.baseClass}__img--loaded` : ""
              }`}
              onLoad={this.handleLoad}
              onError={this.handleError}
              onClick={this.handleImageClick}
              loading={loading}
              decoding="async"
              role={showLightbox ? "button" : undefined}
              tabIndex={showLightbox ? 0 : undefined}
              onKeyDown={showLightbox ? this.handleKeyDown : undefined}
            />
            {this.renderPlaceholder()}
            {this.renderZoomButton()}
          </div>
        </div>

        {showLightbox && (
          <ImageLightbox
            isOpen={showLightboxState}
            imageUrl={this.getDisplayImage()}
            imageAlt={alt}
            onClose={this.handleCloseLightbox}
          />
        )}
      </>
    );
  }
}

export default ProductImage;

/**
 * Product Image Gallery Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/bouquet-detail/ProductImageGallery.css";
import ProductImage from "../common/ProductImage";

interface ProductImageGalleryProps {
  image?: string;
  name: string;
  fallbackImage?: string;
}

interface ProductImageGalleryState {
  // No state needed, but keeping for consistency
}

/**
 * Product Image Gallery Component
 * Class-based component for product image gallery
 */
class ProductImageGallery extends Component<ProductImageGalleryProps, ProductImageGalleryState> {
  private baseClass: string = "product-image-gallery";

  render(): React.ReactNode {
    const { image, name, fallbackImage = "/images/placeholder-bouquet.jpg" } = this.props;

    return (
      <div className={this.baseClass}>
        <ProductImage
          image={image}
          alt={name}
          fallbackImage={fallbackImage}
          aspectRatio="4 / 5"
          showLightbox={true}
          loading="eager"
          className={`${this.baseClass}__image`}
        />
      </div>
    );
  }
}

export default ProductImageGallery;

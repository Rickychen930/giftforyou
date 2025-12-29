import React from "react";
import "../../styles/bouquet-detail/ProductImageGallery.css";
import ProductImage from "../common/ProductImage";

interface ProductImageGalleryProps {
  image?: string;
  name: string;
  fallbackImage?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  image,
  name,
  fallbackImage = "/images/placeholder-bouquet.jpg",
}) => {
  return (
    <div className="product-image-gallery">
      <ProductImage
        image={image}
        alt={name}
        fallbackImage={fallbackImage}
        aspectRatio="4 / 5"
        showLightbox={true}
        loading="eager"
        className="product-image-gallery__image"
      />
    </div>
  );
};

export default ProductImageGallery;

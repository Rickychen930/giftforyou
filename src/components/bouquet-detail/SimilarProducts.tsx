import React, { memo } from "react";
import { Link } from "react-router-dom";
import "../../styles/bouquet-detail/SimilarProducts.css";
import { formatIDR } from "../../utils/money";
import { API_BASE } from "../../config/api";
import type { Bouquet } from "../../models/domain/bouquet";

interface SimilarProductsProps {
  bouquets: Bouquet[];
}

const buildImageUrl = (image?: string) => {
  if (!image) return "/images/placeholder-bouquet.jpg";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};


/**
 * Similar Products Component
 * Optimized for performance with memoization
 * Uses regular grid for better UX (virtualization not needed for small lists)
 */
const SimilarProducts: React.FC<SimilarProductsProps> = memo(({ bouquets }) => {

  if (bouquets.length === 0) return null;

  // Use regular grid for small lists (better UX)
  if (bouquets.length <= 4) {
    return (
      <section className="similar-products">
        <h2 className="similar-products__title">Produk Serupa</h2>
        <div className="similar-products__grid">
          {bouquets.map((bouquet) => (
            <Link
              key={bouquet._id}
              to={`/bouquet/${bouquet._id}`}
              className="similar-products__card"
              aria-label={`Lihat detail ${bouquet.name}`}
            >
              <div className="similar-products__image-wrapper">
                <img
                  src={buildImageUrl(bouquet.image)}
                  alt={bouquet.name}
                  className="similar-products__image"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/placeholder-bouquet.jpg";
                  }}
                />
                <span
                  className={`similar-products__badge ${
                    bouquet.status === "ready" ? "similar-products__badge--ready" : "similar-products__badge--preorder"
                  }`}
                >
                  {bouquet.status === "ready" ? "Siap" : "Preorder"}
                </span>
              </div>
              <div className="similar-products__body">
                <h3 className="similar-products__name">{bouquet.name}</h3>
                <p className="similar-products__price">{formatIDR(bouquet.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // For larger lists, use regular grid (virtualization not needed for small lists)
  // Regular grid provides better UX and is more performant for small-medium lists
  return (
    <section className="similar-products">
      <h2 className="similar-products__title">Produk Serupa</h2>
      <div className="similar-products__grid">
        {bouquets.map((bouquet) => (
          <Link
            key={bouquet._id}
            to={`/bouquet/${bouquet._id}`}
            className="similar-products__card"
            aria-label={`Lihat detail ${bouquet.name}`}
          >
            <div className="similar-products__image-wrapper">
              <img
                src={buildImageUrl(bouquet.image)}
                alt={bouquet.name}
                className="similar-products__image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/placeholder-bouquet.jpg";
                }}
              />
              <span
                className={`similar-products__badge ${
                  bouquet.status === "ready" ? "similar-products__badge--ready" : "similar-products__badge--preorder"
                }`}
              >
                {bouquet.status === "ready" ? "Siap" : "Preorder"}
              </span>
            </div>
            <div className="similar-products__body">
              <h3 className="similar-products__name">{bouquet.name}</h3>
              <p className="similar-products__price">{formatIDR(bouquet.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});

SimilarProducts.displayName = "SimilarProducts";

export default SimilarProducts;


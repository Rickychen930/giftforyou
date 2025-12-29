import React from "react";
import { Link } from "react-router-dom";
import "../../styles/bouquet-detail/SimilarProducts.css";
import { formatIDR } from "../../utils/money";
import type { Bouquet } from "../../models/domain/bouquet";
import ProductImage from "../common/ProductImage";
import StatusBadge from "../common/StatusBadge";

interface SimilarProductsProps {
  bouquets: Bouquet[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ bouquets }) => {
  if (bouquets.length === 0) return null;

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
              <ProductImage
                image={bouquet.image}
                alt={bouquet.name}
                aspectRatio="4 / 5"
                showLightbox={false}
                loading="lazy"
                className="similar-products__image"
              />
              <StatusBadge
                type={bouquet.status === "ready" ? "ready" : "preorder"}
                size="sm"
                className="similar-products__badge"
              />
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
};

export default SimilarProducts;

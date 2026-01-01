/**
 * Similar Products Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/bouquet-detail/SimilarProducts.css";
import { formatIDR } from "../../utils/money";
import type { Bouquet } from "../../models/domain/bouquet";
import ProductImage from "../common/ProductImage";
import StatusBadge from "../common/StatusBadge";

interface SimilarProductsProps {
  bouquets: Bouquet[];
}

interface SimilarProductsState {
  // No state needed, but keeping for consistency
}

/**
 * Similar Products Component
 * Class-based component for similar products display
 */
class SimilarProducts extends Component<SimilarProductsProps, SimilarProductsState> {
  private baseClass: string = "similar-products";

  private renderProductCard(bouquet: Bouquet): React.ReactNode {
    return (
      <Link
        key={bouquet._id}
        to={`/bouquet/${bouquet._id}`}
        className={`${this.baseClass}__card`}
        aria-label={`Lihat detail ${bouquet.name}`}
      >
        <div className={`${this.baseClass}__image-wrapper`}>
          <ProductImage
            image={bouquet.image}
            alt={bouquet.name}
            aspectRatio="4 / 5"
            showLightbox={false}
            loading="lazy"
            className={`${this.baseClass}__image`}
          />
          <StatusBadge
            type={bouquet.status === "ready" ? "ready" : "preorder"}
            size="sm"
            className={`${this.baseClass}__badge`}
          />
        </div>
        <div className={`${this.baseClass}__body`}>
          <h3 className={`${this.baseClass}__name`}>{bouquet.name}</h3>
          <p className={`${this.baseClass}__price`}>{formatIDR(bouquet.price)}</p>
        </div>
      </Link>
    );
  }

  render(): React.ReactNode {
    const { bouquets } = this.props;

    if (bouquets.length === 0) return null;

    return (
      <section className={this.baseClass}>
        <h2 className={`${this.baseClass}__title`}>Produk Serupa</h2>
        <div className={`${this.baseClass}__grid`}>
          {bouquets.map((bouquet) => this.renderProductCard(bouquet))}
        </div>
      </section>
    );
  }
}

export default SimilarProducts;

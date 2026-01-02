/**
 * Bouquet Card Body Component
 * Reusable body section for bouquet cards
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and fully responsive
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../../../utils/money";
import { formatBouquetName, formatTag } from "../../../utils/text-formatter";
import "../../../styles/cards/bouquet/BouquetCardBody.css";

export interface BouquetCardBodyProps {
  name: string;
  price: number;
  detailHref: string;
  tags: string[];
  customPenanda: string[];
}

interface BouquetCardBodyState {
  // No state needed, but keeping for consistency
}

/**
 * Bouquet Card Body Component
 * Displays name, price, and tags
 * Follows Single Responsibility Principle: only handles body content rendering
 */
export class BouquetCardBody extends Component<BouquetCardBodyProps, BouquetCardBodyState> {
  private baseClass: string = "bouquet-card-body";

  render(): React.ReactNode {
    const { name, price, detailHref, tags, customPenanda } = this.props;
    const allTags = [...tags, ...customPenanda];
    const displayTags = allTags.slice(0, 2);
    const remainingCount = allTags.length - 2;

    return (
      <div className={this.baseClass}>
        <h3 className={`${this.baseClass}__name`}>
          <Link
            to={detailHref}
            className={`${this.baseClass}__name-link`}
            aria-label={`Buka detail ${formatBouquetName(name)}`}
          >
            {formatBouquetName(name)}
          </Link>
        </h3>

        <div className={`${this.baseClass}__price-wrapper`}>
          <p className={`${this.baseClass}__price`} aria-label={`Harga ${formatIDR(price)}`}>
            {formatIDR(price)}
          </p>
        </div>

        {allTags.length > 0 && (
          <div className={`${this.baseClass}__meta`} aria-label="Bouquet details">
            {displayTags.map((tag) => (
              <span key={tag} className={`${this.baseClass}__chip`} title={tag}>
                {formatTag(tag)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                className={`${this.baseClass}__chip ${this.baseClass}__chip--more`}
                title={allTags.slice(2).join(", ")}
              >
                +{remainingCount}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default BouquetCardBody;


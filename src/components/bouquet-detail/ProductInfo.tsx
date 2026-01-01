/**
 * Product Info Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/bouquet-detail/ProductInfo.css";
import {
  formatBouquetType,
  formatBouquetSize,
  formatCollectionName,
  formatOccasion,
  formatFlowerName,
} from "../../utils/text-formatter";
import type { Bouquet } from "../../models/domain/bouquet";
import StatusBadge from "../common/StatusBadge";

interface ProductInfoProps {
  bouquet: Bouquet;
}

interface ProductInfoState {
  // No state needed, but keeping for consistency
}

/**
 * Product Info Component
 * Class-based component for product information
 */
class ProductInfo extends Component<ProductInfoProps, ProductInfoState> {
  private baseClass: string = "product-info";

  private renderChip(icon: React.ReactNode, label: string, variant?: string): React.ReactNode {
    return (
      <div
        className={`${this.baseClass}__chip ${variant ? `${this.baseClass}__chip--${variant}` : ""}`}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  private renderDetailItem(
    icon: React.ReactNode,
    title: string,
    content: string
  ): React.ReactNode {
    return (
      <div className={`${this.baseClass}__detail-item`}>
        <div className={`${this.baseClass}__detail-icon`}>{icon}</div>
        <div className={`${this.baseClass}__detail-content`}>
          <h3 className={`${this.baseClass}__detail-title`}>{title}</h3>
          <p className={`${this.baseClass}__detail-text`}>{content}</p>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { bouquet } = this.props;

    return (
      <div className={this.baseClass}>
        <div className={`${this.baseClass}__chips`}>
          {bouquet.size && this.renderChip(
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            formatBouquetSize(bouquet.size)
          )}
          {bouquet.type && this.renderChip(
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            formatBouquetType(bouquet.type)
          )}
          {bouquet.collectionName && this.renderChip(
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" />
            </svg>,
            formatCollectionName(bouquet.collectionName),
            "collection"
          )}
          {bouquet.isNewEdition && (
            <StatusBadge
              type="new"
              label="Edisi Baru"
              size="sm"
              className={`${this.baseClass}__chip`}
            />
          )}
          {bouquet.isFeatured && (
            <StatusBadge
              type="featured"
              size="sm"
              className={`${this.baseClass}__chip`}
            />
          )}
        </div>

        {bouquet.description && (
          <div className={`${this.baseClass}__description`}>
            <p>{bouquet.description}</p>
          </div>
        )}

        <div className={`${this.baseClass}__details`}>
          {Array.isArray(bouquet.occasions) && bouquet.occasions.length > 0 && this.renderDetailItem(
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            "Cocok Untuk",
            bouquet.occasions.map(formatOccasion).join(", ")
          )}

          {Array.isArray(bouquet.flowers) && bouquet.flowers.length > 0 && this.renderDetailItem(
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>,
            "Jenis Bunga",
            bouquet.flowers.map(formatFlowerName).join(", ")
          )}
        </div>
      </div>
    );
  }
}

export default ProductInfo;

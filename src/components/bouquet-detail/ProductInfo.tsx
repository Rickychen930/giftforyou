import React from "react";
import "../../styles/bouquet-detail/ProductInfo.css";
import {
  formatBouquetType,
  formatBouquetSize,
  formatCollectionName,
  formatOccasion,
  formatFlowerName,
} from "../../utils/text-formatter";
import type { Bouquet } from "../../models/domain/bouquet";

interface ProductInfoProps {
  bouquet: Bouquet;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ bouquet }) => {
  return (
    <div className="product-info">
      <div className="product-info__chips">
        {bouquet.size && (
          <div className="product-info__chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatBouquetSize(bouquet.size)}</span>
          </div>
        )}
        {bouquet.type && (
          <div className="product-info__chip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{formatBouquetType(bouquet.type)}</span>
          </div>
        )}
        {bouquet.collectionName && (
          <div className="product-info__chip product-info__chip--collection">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{formatCollectionName(bouquet.collectionName)}</span>
          </div>
        )}
        {bouquet.isNewEdition && (
          <div className="product-info__chip product-info__chip--new">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Edisi Baru</span>
          </div>
        )}
        {bouquet.isFeatured && (
          <div className="product-info__chip product-info__chip--featured">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Featured</span>
          </div>
        )}
      </div>

      {bouquet.description && (
        <div className="product-info__description">
          <p>{bouquet.description}</p>
        </div>
      )}

      <div className="product-info__details">
        {Array.isArray(bouquet.occasions) && bouquet.occasions.length > 0 && (
          <div className="product-info__detail-item">
            <div className="product-info__detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="product-info__detail-content">
              <h3 className="product-info__detail-title">Cocok Untuk</h3>
              <p className="product-info__detail-text">
                {bouquet.occasions.map(formatOccasion).join(", ")}
              </p>
            </div>
          </div>
        )}

        {Array.isArray(bouquet.flowers) && bouquet.flowers.length > 0 && (
          <div className="product-info__detail-item">
            <div className="product-info__detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="product-info__detail-content">
              <h3 className="product-info__detail-title">Jenis Bunga</h3>
              <p className="product-info__detail-text">
                {bouquet.flowers.map(formatFlowerName).join(", ")}
              </p>
            </div>
          </div>
        )}

        {bouquet.careInstructions && (
          <div className="product-info__detail-item product-info__detail-item--care">
            <div className="product-info__detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="product-info__detail-content">
              <h3 className="product-info__detail-title">Tips Perawatan</h3>
              <p className="product-info__detail-text">{bouquet.careInstructions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;


import React from "react";
import "../../styles/bouquet-detail/BouquetDetailSkeleton.css";

/**
 * Skeleton Loading Component for Bouquet Detail Page
 * Provides elegant loading state while data is being fetched
 */
const BouquetDetailSkeleton: React.FC = () => {
  return (
    <section className="bouquet-detail-skeleton">
      <div className="bouquet-detail-skeleton__container">
        <div className="bouquet-detail-skeleton__breadcrumb">
          <div className="bouquet-detail-skeleton__breadcrumb-item"></div>
          <div className="bouquet-detail-skeleton__breadcrumb-item"></div>
        </div>

        <div className="bouquet-detail-skeleton__layout">
          {/* Left Column - Product Display */}
          <div className="bouquet-detail-skeleton__main">
            <div className="bouquet-detail-skeleton__gallery">
              <div className="bouquet-detail-skeleton__image"></div>
            </div>

            <div className="bouquet-detail-skeleton__header">
              <div className="bouquet-detail-skeleton__title"></div>
              <div className="bouquet-detail-skeleton__title-short"></div>
            </div>

            <div className="bouquet-detail-skeleton__price-row">
              <div className="bouquet-detail-skeleton__price"></div>
              <div className="bouquet-detail-skeleton__status"></div>
            </div>

            <div className="bouquet-detail-skeleton__chips">
              <div className="bouquet-detail-skeleton__chip"></div>
              <div className="bouquet-detail-skeleton__chip"></div>
              <div className="bouquet-detail-skeleton__chip"></div>
            </div>

            <div className="bouquet-detail-skeleton__description">
              <div className="bouquet-detail-skeleton__line"></div>
              <div className="bouquet-detail-skeleton__line"></div>
              <div className="bouquet-detail-skeleton__line-short"></div>
            </div>
          </div>

          {/* Right Column - Order Section */}
          <div className="bouquet-detail-skeleton__sidebar">
            <div className="bouquet-detail-skeleton__order-card">
              <div className="bouquet-detail-skeleton__order-title"></div>
              <div className="bouquet-detail-skeleton__order-item"></div>
              <div className="bouquet-detail-skeleton__order-item"></div>
              <div className="bouquet-detail-skeleton__order-button"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BouquetDetailSkeleton;


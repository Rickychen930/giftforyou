/**
 * Bouquet Detail Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { isAuthenticated } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import type { OrderFormData } from "../components/bouquet-detail/OrderForm";

// Reusable Components
import ProductImageGallery from "../components/bouquet-detail/ProductImageGallery";
import ProductHeader from "../components/bouquet-detail/ProductHeader";
import ProductInfo from "../components/bouquet-detail/ProductInfo";
import OrderForm from "../components/bouquet-detail/OrderForm";
import PriceSummary from "../components/bouquet-detail/PriceSummary";
import SimilarProducts from "../components/bouquet-detail/SimilarProducts";
import Breadcrumb from "../components/bouquet-detail/Breadcrumb";
import SocialProof from "../components/common/SocialProof";
import UrgencyIndicator from "../components/common/UrgencyIndicator";
import EmptyState from "../components/common/EmptyState";
import IconButton from "../components/common/IconButton";
import AlertMessage from "../components/common/AlertMessage";
import LuxuryButton from "../components/buttons/LuxuryButton";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface BouquetDetailPageViewProps {
  bouquet: Bouquet | null;
  loading: boolean;
  error: string | null;
  detailUrl: string;
  similarBouquets: Bouquet[];
  formData: OrderFormData;
  formErrors: Partial<Record<keyof OrderFormData, string>>;
  isFormValid: boolean;
  isFavorite: boolean;
  showOrderModal: boolean;
  formProgress: number;
  getDefaultDate: () => string;
  onFormChange: (field: keyof OrderFormData, value: string | number) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFavoriteToggle: () => void;
  onOrderSubmit: () => void;
  onShowOrderModal: () => void;
  onCloseOrderModal: () => void;
}

/**
 * Bouquet Detail Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class BouquetDetailPageView extends Component<BouquetDetailPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="bouquet-detail-page">
        <div className="bouquet-detail-page__container">
          <div className="bouquet-detail-page__loading">
            <div className="bouquet-detail-page__spinner"></div>
            <span>Memuat bouquet…</span>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Render error state
   */
  private renderError(error: string | null): React.ReactNode {
    return (
      <section className="bouquet-detail-page">
        <div className="bouquet-detail-page__container">
          <EmptyState
            title={error ?? "Bouquet tidak ditemukan."}
            description="Coba kembali ke katalog atau periksa tautan yang Anda gunakan."
            actionLabel="Kembali ke Katalog"
            actionPath="/collection"
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
              </svg>
            }
            className="bouquet-detail-page__error"
          />
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      bouquet,
      loading,
      error,
      detailUrl,
      similarBouquets,
      formData,
      formErrors,
      isFormValid,
      isFavorite,
      showOrderModal,
      formProgress,
      getDefaultDate,
      onFormChange,
      onAddressChange,
      onFavoriteToggle,
      onOrderSubmit,
      onShowOrderModal,
      onCloseOrderModal,
    } = this.props;

    if (loading) {
      return this.renderLoading();
    }

    if (error || !bouquet) {
      return this.renderError(error);
    }

    const isAdmin = isAuthenticated();

  return (
    <section className="bouquet-detail-page" aria-labelledby="bouquet-title">
      <div className="bouquet-detail-page__container">
        <Breadcrumb currentPage={bouquet.name} />

        <div className="bouquet-detail-page__layout">
          {/* Left Column - Product Display */}
          <div className="bouquet-detail-page__main">
            <div className="bouquet-detail-page__gallery">
              <ProductImageGallery
                image={bouquet.image}
                name={bouquet.name}
                fallbackImage={FALLBACK_IMAGE}
              />
            </div>

            <div className="bouquet-detail-page__header">
              <ProductHeader
                name={bouquet.name}
                price={bouquet.price}
                status={bouquet.status}
                isFavorite={isFavorite}
                onFavoriteToggle={onFavoriteToggle}
              />
            </div>

            <div className="bouquet-detail-page__indicators">
              <SocialProof bouquetId={bouquet._id} />
              {bouquet.status === "ready" && bouquet.quantity !== undefined && bouquet.quantity > 0 && bouquet.quantity <= 5 && (
                <UrgencyIndicator type="limited-stock" stockCount={bouquet.quantity} />
              )}
              {bouquet.status === "preorder" && (
                <UrgencyIndicator type="preorder" />
              )}
            </div>

            <div className="bouquet-detail-page__info">
              <ProductInfo bouquet={bouquet} />
            </div>
          </div>

          {/* Right Column - Order Section */}
          <div className="bouquet-detail-page__sidebar">
            <div className="bouquet-detail-page__order-card">
              <PriceSummary
                bouquetName={bouquet.name}
                price={bouquet.price}
                formData={formData}
                isFormValid={isFormValid}
                formProgress={formProgress}
              />

              <LuxuryButton
                variant="primary"
                size="lg"
                onClick={onShowOrderModal}
                className="bouquet-detail-page__order-btn"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                  </svg>
                }
                iconPosition="left"
              >
                Pesan Sekarang
              </LuxuryButton>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarBouquets.length > 0 && (
          <div className="bouquet-detail-page__similar">
            <SimilarProducts bouquets={similarBouquets} />
          </div>
        )}

        {/* Admin Links */}
        {isAdmin && (
          <div className="bouquet-detail-page__admin">
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(detailUrl);
                toast.success("Tautan disalin");
              }}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              ariaLabel="Salin Tautan"
              tooltip="Salin Tautan"
              className="bouquet-detail-page__admin-link"
            />
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && (
          <div
            className="bouquet-detail-page__modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onCloseOrderModal();
              }
            }}
          >
            <div className="bouquet-detail-page__modal">
              <div className="bouquet-detail-page__modal-header">
                <h2>Form Pemesanan</h2>
                <IconButton
                  variant="ghost"
                  size="md"
                  onClick={onCloseOrderModal}
                  ariaLabel="Tutup"
                  className="bouquet-detail-page__modal-close"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                />
              </div>

              <div className="bouquet-detail-page__modal-content">
                <OrderForm
                  formData={formData}
                  errors={formErrors}
                  onFormChange={onFormChange}
                  onAddressChange={onAddressChange}
                  getDefaultDate={getDefaultDate}
                />
              </div>

              <div className="bouquet-detail-page__modal-footer">
                {!isFormValid && (
                  <AlertMessage
                    variant="warning"
                    message="Lengkapi semua field yang wajib untuk melanjutkan"
                    className="bouquet-detail-page__modal-warning"
                  />
                )}
                <div className="bouquet-detail-page__modal-actions">
                  <LuxuryButton
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onCloseOrderModal}
                    className="bouquet-detail-page__modal-btn bouquet-detail-page__modal-btn--secondary"
                  >
                    Batal
                  </LuxuryButton>
                  <LuxuryButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={onOrderSubmit}
                    disabled={!isFormValid}
                    className={`bouquet-detail-page__modal-btn bouquet-detail-page__modal-btn--primary ${!isFormValid ? "bouquet-detail-page__modal-btn--disabled" : ""}`}
                    icon={
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                      </svg>
                    }
                    iconPosition="left"
                  >
                    Kirim ke WhatsApp
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
    );
  }
}

export default BouquetDetailPageView;

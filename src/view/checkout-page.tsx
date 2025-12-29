/**
 * Checkout Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import "../styles/CheckoutPage.css";
import { formatIDR } from "../utils/money";
import { buildImageUrl } from "../utils/image-utils";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import type { CartItem } from "../utils/cart";
import type { DeliveryPriceResult } from "../utils/delivery-calculator";
import type { SavedAddress, CheckoutFormState } from "../models/checkout-page-model";
import AddressAutocomplete from "../components/AddressAutocomplete";
import DeliveryTimeSlot from "../components/DeliveryTimeSlot";
import LuxuryButton from "../components/LuxuryButton";
import SkeletonLoader from "../components/SkeletonLoader";
import OrderSummaryModal from "../components/OrderSummaryModal";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface CheckoutPageViewProps {
  items: CartItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  deliveryType: CheckoutFormState["deliveryType"];
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  orderNotes: string;
  formErrors: Partial<Record<keyof CheckoutFormState, string>>;
  isFormValid: boolean;
  deliveryPriceResult?: DeliveryPriceResult;
  savedAddresses: SavedAddress[];
  loadingAddresses: boolean;
  showPreviewModal: boolean;
  canUseExpressCheckout?: boolean;
  calculateItemTotal: (item: CartItem) => number;
  calculateGrandTotal: () => number;
  getDefaultDate: () => string;
  onFormChange: (field: keyof CheckoutFormState, value: string | undefined) => void;
  onAddressChange: (address: string, placeDetails?: {
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }) => void;
  onLocationChange: (lat: number, lng: number) => void;
  onExpressCheckout: () => void;
  onPreview: () => void;
  onClosePreviewModal: () => void;
  onConfirmSubmit: () => void;
}

/**
 * Checkout Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const CheckoutPageView: React.FC<CheckoutPageViewProps> = ({
  items,
  isLoading,
  isSubmitting,
  deliveryType,
  deliveryDate,
  deliveryTimeSlot,
  address,
  greetingCard,
  orderNotes,
  formErrors,
  isFormValid,
  deliveryPriceResult,
  savedAddresses,
  loadingAddresses,
  showPreviewModal,
  canUseExpressCheckout = false,
  calculateItemTotal,
  calculateGrandTotal,
  getDefaultDate,
  onFormChange,
  onAddressChange,
  onLocationChange,
  onExpressCheckout,
  onPreview,
  onClosePreviewModal,
  onConfirmSubmit,
}) => {
  if (isLoading) {
    return (
      <section className="checkoutPage checkoutPage--loading">
        <div className="checkoutPage__container">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </section>
    );
  }

  const grandTotal = calculateGrandTotal();
  const minDate = getDefaultDate();

  return (
    <section className="checkoutPage">
      <div className="checkoutPage__container">
        <div className="checkoutPage__header">
          <h1 className="checkoutPage__title">Checkout</h1>
          <p className="checkoutPage__subtitle">
            Lengkapi informasi pengiriman untuk menyelesaikan pesanan
          </p>
        </div>

        <div className="checkoutPage__content">
          {/* Order Items Summary */}
          <div className="checkoutPage__items">
            <h2 className="checkoutPage__sectionTitle">Pesanan Anda</h2>
            <div className="checkoutItems">
              {items.map((item) => {
                const itemTotal = calculateItemTotal(item);
                const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
                const hasDiscount = discount.discountAmount > 0;

                return (
                  <div key={item.bouquetId} className="checkoutItem">
                    <img
                      src={item.image ? buildImageUrl(item.image) : FALLBACK_IMAGE}
                      alt={item.bouquetName}
                      className="checkoutItem__image"
                      loading="lazy"
                    />
                    <div className="checkoutItem__details">
                      <h3 className="checkoutItem__name">{item.bouquetName}</h3>
                      <div className="checkoutItem__meta">
                        <span className="checkoutItem__price">
                          {formatIDR(item.bouquetPrice)} x {item.quantity}
                        </span>
                        {hasDiscount && (
                          <span className="checkoutItem__discount">
                            Diskon {discount.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="checkoutItem__total">
                      {formatIDR(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkoutPage__form">
            <h2 className="checkoutPage__sectionTitle">Informasi Pengiriman</h2>
            <div className="checkoutForm">
              <div className="checkoutForm__group">
                <label className="checkoutForm__label">
                  Metode Pengiriman
                  <span className="checkoutForm__required">*</span>
                </label>
                <div className="checkoutForm__radioGroup">
                  <label className={`checkoutForm__radio ${deliveryType === "delivery" ? "checkoutForm__radio--active" : ""}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={deliveryType === "delivery"}
                      onChange={(e) => onFormChange("deliveryType", e.target.value)}
                    />
                    <span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Diantar
                    </span>
                  </label>
                  <label className={`checkoutForm__radio ${deliveryType === "pickup" ? "checkoutForm__radio--active" : ""}`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={deliveryType === "pickup"}
                      onChange={(e) => onFormChange("deliveryType", e.target.value)}
                    />
                    <span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Ambil di Toko
                    </span>
                  </label>
                </div>
              </div>

              <div className="checkoutForm__group">
                <label className="checkoutForm__label">
                  {deliveryType === "delivery" ? "Tanggal Pengiriman" : "Tanggal Pengambilan"}
                  <span className="checkoutForm__required">*</span>
                </label>
                <input
                  type="date"
                  className={`checkoutForm__input ${formErrors.deliveryDate ? "checkoutForm__input--error" : ""}`}
                  min={minDate}
                  value={deliveryDate}
                  onChange={(e) => onFormChange("deliveryDate", e.target.value)}
                  aria-invalid={!!formErrors.deliveryDate}
                  aria-describedby={formErrors.deliveryDate ? "deliveryDate-error" : undefined}
                />
                {formErrors.deliveryDate && (
                  <span className="checkoutForm__error" id="deliveryDate-error" role="alert">
                    {formErrors.deliveryDate}
                  </span>
                )}
              </div>

              {deliveryDate && (
                <div className="checkoutForm__group">
                  <label className="checkoutForm__label">
                    {deliveryType === "delivery" ? "Waktu Pengiriman" : "Waktu Pengambilan"}
                    <span className="checkoutForm__optional">(Opsional)</span>
                  </label>
                  <DeliveryTimeSlot
                    selectedDate={deliveryDate}
                    selectedSlot={deliveryTimeSlot}
                    onSelect={(slotId) => onFormChange("deliveryTimeSlot", slotId)}
                  />
                </div>
              )}

              {deliveryType === "delivery" && (
                <div className="checkoutForm__group">
                  <label className="checkoutForm__label">
                    Alamat Pengiriman
                    <span className="checkoutForm__required">*</span>
                  </label>
                  {loadingAddresses ? (
                    <SkeletonLoader variant="text" lines={2} />
                  ) : (
                    <>
                      {savedAddresses.length > 0 && (
                        <div className="checkoutForm__savedAddresses">
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr._id}
                              type="button"
                              className={`checkoutForm__savedAddress ${addr.isDefault ? "checkoutForm__savedAddress--default" : ""}`}
                              onClick={() => {
                                onAddressChange(addr.fullAddress, {
                                  geometry: {
                                    location: {
                                      lat: () => addr.latitude || 0,
                                      lng: () => addr.longitude || 0,
                                    },
                                  },
                                });
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              {addr.fullAddress}
                              {addr.isDefault && <span className="checkoutForm__defaultBadge">Default</span>}
                            </button>
                          ))}
                        </div>
                      )}
                      <AddressAutocomplete
                        value={address}
                        onChange={onAddressChange}
                        placeholder="Masukkan alamat lengkap"
                        required
                        error={formErrors.address}
                        onLocationChange={onLocationChange}
                      />
                      {deliveryPriceResult && (
                        <div className="checkoutForm__deliveryPrice">
                          <span className="checkoutForm__deliveryPriceLabel">Ongkir:</span>
                          <span className="checkoutForm__deliveryPriceValue">
                            {deliveryPriceResult.formattedPrice}
                          </span>
                          <span className="checkoutForm__deliveryPriceDetails">
                            (~{deliveryPriceResult.distance} km • {deliveryPriceResult.estimatedTime})
                          </span>
                        </div>
                      )}
                      {formErrors.address && (
                        <span className="checkoutForm__error" id="address-error" role="alert">
                          {formErrors.address}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="checkoutForm__group">
                <label className="checkoutForm__label">
                  Kartu Ucapan
                  <span className="checkoutForm__optional">(Opsional)</span>
                </label>
                <textarea
                  className={`checkoutForm__textarea ${formErrors.greetingCard ? "checkoutForm__textarea--error" : ""}`}
                  rows={3}
                  placeholder="Tulis pesan untuk kartu ucapan..."
                  value={greetingCard}
                  onChange={(e) => onFormChange("greetingCard", e.target.value)}
                  maxLength={200}
                  aria-invalid={!!formErrors.greetingCard}
                  aria-describedby={formErrors.greetingCard ? "greetingCard-error" : undefined}
                />
                <div className="checkoutForm__charCount">
                  {greetingCard.length} / 200 karakter
                </div>
                {formErrors.greetingCard && (
                  <span className="checkoutForm__error" id="greetingCard-error" role="alert">
                    {formErrors.greetingCard}
                  </span>
                )}
              </div>

              <div className="checkoutForm__group">
                <label className="checkoutForm__label">
                  Catatan Pesanan
                  <span className="checkoutForm__optional">(Opsional)</span>
                </label>
                <textarea
                  className={`checkoutForm__textarea ${formErrors.orderNotes ? "checkoutForm__textarea--error" : ""}`}
                  rows={3}
                  placeholder="Instruksi khusus untuk pengiriman, permintaan khusus, dll..."
                  value={orderNotes}
                  onChange={(e) => onFormChange("orderNotes", e.target.value)}
                  maxLength={500}
                  aria-invalid={!!formErrors.orderNotes}
                  aria-describedby={formErrors.orderNotes ? "orderNotes-error" : undefined}
                />
                <div className="checkoutForm__charCount">
                  {orderNotes.length} / 500 karakter
                </div>
                {formErrors.orderNotes && (
                  <span className="checkoutForm__error" id="orderNotes-error" role="alert">
                    {formErrors.orderNotes}
                  </span>
                )}
                <span className="checkoutForm__hint">
                  💡 Contoh: "Tolong diletakkan di depan pintu", "Hindari jam 12-14 siang", "Ada anjing di halaman"
                </span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkoutPage__summary">
            <div className="checkoutSummary">
              <h2 className="checkoutSummary__title">Ringkasan Pesanan</h2>
              <div className="checkoutSummary__content">
                <div className="checkoutSummary__row">
                  <span className="checkoutSummary__label">Subtotal</span>
                  <span className="checkoutSummary__value">
                    {formatIDR(items.reduce((sum, item) => sum + calculateItemTotal(item), 0))}
                  </span>
                </div>
                {deliveryType === "delivery" && deliveryPriceResult && (
                  <div className="checkoutSummary__row">
                    <span className="checkoutSummary__label">Ongkir</span>
                    <span className="checkoutSummary__value">
                      {formatIDR(deliveryPriceResult.price)}
                    </span>
                  </div>
                )}
                <div className="checkoutSummary__separator"></div>
                <div className="checkoutSummary__row checkoutSummary__row--total">
                  <span className="checkoutSummary__label">Total</span>
                  <span className="checkoutSummary__value">{formatIDR(grandTotal)}</span>
                </div>
              </div>

              {canUseExpressCheckout && (
                <div className="checkoutSummary__expressCheckout">
                  <LuxuryButton
                    variant="outline"
                    onClick={onExpressCheckout}
                    disabled={isSubmitting}
                    className="checkoutSummary__expressBtn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Express Checkout
                  </LuxuryButton>
                  <p className="checkoutSummary__expressHint">
                    Gunakan alamat default dan checkout dengan cepat
                  </p>
                </div>
              )}

              <LuxuryButton
                variant="primary"
                onClick={onPreview}
                disabled={!isFormValid || isSubmitting}
                isLoading={isSubmitting}
                className="checkoutSummary__submitBtn"
              >
                {isSubmitting ? "Memproses..." : "Preview & Lanjutkan"}
              </LuxuryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Preview Modal */}
      <OrderSummaryModal
        isOpen={showPreviewModal}
        onClose={onClosePreviewModal}
        onConfirm={onConfirmSubmit}
        items={items}
        deliveryType={deliveryType}
        deliveryDate={deliveryDate}
        deliveryTimeSlot={deliveryTimeSlot}
        address={address}
        greetingCard={greetingCard}
        orderNotes={orderNotes}
        subtotal={items.reduce((sum, item) => sum + calculateItemTotal(item), 0)}
        deliveryPrice={deliveryType === "delivery" && deliveryPriceResult ? deliveryPriceResult.price : 0}
        total={grandTotal}
        isSubmitting={isSubmitting}
      />
    </section>
  );
};

export default CheckoutPageView;

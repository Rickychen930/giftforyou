/**
 * Checkout Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 * Enhanced with Container & Section components for consistent layout
 */

import React, { Component } from "react";
import "../styles/CheckoutPage.css";
import { formatIDR } from "../utils/money";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import type { CartItem } from "../utils/cart";
import type { DeliveryPriceResult } from "../utils/delivery-calculator";
import type { SavedAddress, CheckoutFormState } from "../models/checkout-page-model";
import AddressAutocomplete from "../components/AddressAutocomplete";
import DeliveryTimeSlot from "../components/common/DeliveryTimeSlot";
import LuxuryButton from "../components/buttons/LuxuryButton";
import SkeletonLoader from "../components/common/SkeletonLoader";
import OrderSummaryModal from "../components/modals/OrderSummaryModal";
import CheckoutItem from "../components/common/CheckoutItem";
import FormField from "../components/common/FormField";
import RadioGroup from "../components/common/RadioGroup";
import TextareaWithCounter from "../components/inputs/TextareaWithCounter";
import SummaryCard from "../components/common/SummaryCard";
import Section from "../components/layout/Section";
import Container from "../components/layout/Container";

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
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CheckoutPageView extends Component<CheckoutPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <Section variant="gradient" padding="lg" className="checkoutPage checkoutPage--loading">
        <Container variant="default" padding="md">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
          </div>
        </Container>
      </Section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
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
    } = this.props;

    if (isLoading) {
      return this.renderLoading();
    }

    const grandTotal = calculateGrandTotal();
    const minDate = getDefaultDate();

  return (
    <Section variant="gradient" padding="lg" className="checkoutPage">
      <Container variant="default" padding="md">
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
                return (
                  <CheckoutItem
                    key={item.bouquetId}
                    bouquetId={item.bouquetId}
                    bouquetName={item.bouquetName}
                    bouquetPrice={item.bouquetPrice}
                    quantity={item.quantity}
                    image={item.image}
                    itemTotal={itemTotal}
                    discountPercentage={discount.discountPercentage}
                    fallbackImage={FALLBACK_IMAGE}
                  />
                );
              })}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="checkoutPage__form">
            <h2 className="checkoutPage__sectionTitle">Informasi Pengiriman</h2>
            <div className="checkoutForm">
              <FormField
                label="Metode Pengiriman"
                required
                className="checkoutForm__group"
              >
                <RadioGroup
                  name="deliveryType"
                  options={[
                    {
                      value: "delivery",
                      label: "Diantar",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ),
                    },
                    {
                      value: "pickup",
                      label: "Ambil di Toko",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      ),
                    },
                  ]}
                  value={deliveryType}
                  onChange={(value) => onFormChange("deliveryType", value)}
                  className="checkoutForm__radioGroup"
                />
              </FormField>

              <FormField
                label={deliveryType === "delivery" ? "Tanggal Pengiriman" : "Tanggal Pengambilan"}
                required
                htmlFor="checkout-delivery-date"
                error={formErrors.deliveryDate}
                className="checkoutForm__group"
              >
                <input
                  type="date"
                  id="checkout-delivery-date"
                  className={`checkoutForm__input ${formErrors.deliveryDate ? "checkoutForm__input--error" : ""}`}
                  min={minDate}
                  value={deliveryDate}
                  onChange={(e) => onFormChange("deliveryDate", e.target.value)}
                />
              </FormField>

              {deliveryDate && (
                <FormField
                  label={deliveryType === "delivery" ? "Waktu Pengiriman" : "Waktu Pengambilan"}
                  htmlFor="checkout-delivery-time"
                  className="checkoutForm__group"
                >
                  <DeliveryTimeSlot
                    selectedDate={deliveryDate}
                    selectedSlot={deliveryTimeSlot}
                    onSelect={(slotId) => onFormChange("deliveryTimeSlot", slotId)}
                  />
                </FormField>
              )}

              {deliveryType === "delivery" && (
                <FormField
                  label="Alamat Pengiriman"
                  required
                  htmlFor="checkout-address"
                  error={formErrors.address}
                  className="checkoutForm__group"
                >
                  {loadingAddresses ? (
                    <SkeletonLoader variant="text" lines={2} />
                  ) : (
                    <>
                      {savedAddresses.length > 0 && (
                        <div className="checkoutForm__savedAddresses">
                          {savedAddresses.map((addr) => (
                            <LuxuryButton
                              key={addr._id}
                              type="button"
                              variant={addr.isDefault ? "primary" : "outline"}
                              size="sm"
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
                              className={`checkoutForm__savedAddress ${addr.isDefault ? "checkoutForm__savedAddress--default" : ""}`}
                              icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              }
                              iconPosition="left"
                            >
                              {addr.fullAddress}
                              {addr.isDefault && <span className="checkoutForm__defaultBadge">Default</span>}
                            </LuxuryButton>
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
                    </>
                  )}
                </FormField>
              )}

              <FormField
                label="Kartu Ucapan"
                htmlFor="checkout-greeting-card"
                error={formErrors.greetingCard}
                className="checkoutForm__group"
              >
                <TextareaWithCounter
                  id="checkout-greeting-card"
                  className={`checkoutForm__textarea ${formErrors.greetingCard ? "checkoutForm__textarea--error" : ""}`}
                  rows={3}
                  placeholder="Tulis pesan untuk kartu ucapan..."
                  value={greetingCard}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onFormChange("greetingCard", e.target.value)}
                  maxLength={200}
                  currentLength={greetingCard.length}
                  error={formErrors.greetingCard}
                />
              </FormField>

              <FormField
                label="Catatan Pesanan"
                htmlFor="checkout-order-notes"
                error={formErrors.orderNotes}
                hint="💡 Contoh: Tolong diletakkan di depan pintu, Hindari jam 12-14 siang, Ada anjing di halaman"
                className="checkoutForm__group"
              >
                <TextareaWithCounter
                  id="checkout-order-notes"
                  className={`checkoutForm__textarea ${formErrors.orderNotes ? "checkoutForm__textarea--error" : ""}`}
                  rows={3}
                  placeholder="Instruksi khusus untuk pengiriman, permintaan khusus, dll..."
                  value={orderNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onFormChange("orderNotes", e.target.value)}
                  maxLength={500}
                  currentLength={orderNotes.length}
                  error={formErrors.orderNotes}
                  hint="💡 Contoh: Tolong diletakkan di depan pintu, Hindari jam 12-14 siang, Ada anjing di halaman"
                />
              </FormField>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkoutPage__summary">
            <div className="checkoutSummary">
              <SummaryCard
                title="Ringkasan Pesanan"
                items={[
                  {
                    label: "Subtotal",
                    value: formatIDR(items.reduce((sum, item) => sum + calculateItemTotal(item), 0)),
                  },
                  ...(deliveryType === "delivery" && deliveryPriceResult
                    ? [
                        {
                          label: "Ongkir",
                          value: formatIDR(deliveryPriceResult.price),
                        },
                      ]
                    : []),
                  {
                    label: "Total",
                    value: formatIDR(grandTotal),
                    isTotal: true,
                  },
                ]}
              />

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
      </Container>

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
    </Section>
    );
  }
}

export default CheckoutPageView;

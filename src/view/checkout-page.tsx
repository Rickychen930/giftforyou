import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "../styles/CheckoutPage.css";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";
import { getCartItems, clearCart, type CartItem } from "../utils/cart";
import { buildImageUrl } from "../utils/image-utils";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import { calculateDeliveryPrice, type DeliveryPriceResult } from "../utils/delivery-calculator";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { STORE_PROFILE } from "../config/store-profile";
import { buildWhatsAppLink } from "../utils/whatsapp";
import AddressAutocomplete from "../components/AddressAutocomplete";
import DeliveryTimeSlot from "../components/DeliveryTimeSlot";
import LuxuryButton from "../components/LuxuryButton";
import SkeletonLoader from "../components/SkeletonLoader";
import OrderSummaryModal from "../components/OrderSummaryModal";
import { API_BASE } from "../config/api";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface CheckoutFormState {
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  orderNotes: string;
  deliveryLocation?: { lat: number; lng: number };
  deliveryPriceResult?: DeliveryPriceResult;
}

interface CheckoutState extends CheckoutFormState {
  items: CartItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  formErrors: Partial<Record<keyof CheckoutFormState, string>>;
  isFormValid: boolean;
  savedAddresses: Array<{
    _id: string;
    fullAddress: string;
    isDefault: boolean;
    latitude?: number;
    longitude?: number;
  }>;
  loadingAddresses: boolean;
  showPreviewModal: boolean;
}

class CheckoutPage extends Component<{}, CheckoutState> {
  private formStorageKey = "checkout_form_data";

  state: CheckoutState = {
    items: [],
    isLoading: true,
    isSubmitting: false,
    deliveryType: "delivery",
    deliveryDate: this.getDefaultDate(),
    deliveryTimeSlot: undefined,
    address: "",
    greetingCard: "",
    orderNotes: "",
    formErrors: {},
    isFormValid: false,
    savedAddresses: [],
    loadingAddresses: false,
    showPreviewModal: false,
  };

  private getDefaultDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  componentDidMount(): void {
    this.loadCart();
    this.loadSavedFormData();
    this.loadSavedAddresses();
    setSeo({
      title: "Checkout | Giftforyou.idn",
      description: "Lengkapi informasi pengiriman untuk menyelesaikan pesanan Anda",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private loadCart = (): void => {
    const items = getCartItems();
    if (items.length === 0) {
      this.setState({ isLoading: false });
      return;
    }
    this.setState({ items, isLoading: false });
    setTimeout(() => {
      this.validateForm();
    }, 100);
  };

  private loadSavedFormData = (): void => {
    try {
      const saved = localStorage.getItem(this.formStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === "object") {
          this.setState({
            deliveryType: data.deliveryType || "delivery",
            deliveryDate: data.deliveryDate || this.getDefaultDate(),
            deliveryTimeSlot: data.deliveryTimeSlot || undefined,
            address: data.address || "",
            greetingCard: data.greetingCard || "",
            orderNotes: data.orderNotes || "",
          });
        }
      }
    } catch {
      // Ignore errors
    }
  };

  private saveFormData = (): void => {
    try {
      const data = {
        deliveryType: this.state.deliveryType,
        deliveryDate: this.state.deliveryDate,
        deliveryTimeSlot: this.state.deliveryTimeSlot,
        address: this.state.address,
        greetingCard: this.state.greetingCard,
        orderNotes: this.state.orderNotes,
      };
      localStorage.setItem(this.formStorageKey, JSON.stringify(data));
    } catch {
      // Ignore errors
    }
  };

  private loadSavedAddresses = async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) return;

    this.setState({ loadingAddresses: true });
    try {
      const response = await fetch(`${API_BASE}/api/customers/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const addresses = await response.json();
        this.setState({ savedAddresses: addresses || [] });
        
        // Auto-load default address
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress && !this.state.address) {
          this.handleAddressChange(defaultAddress.fullAddress, {
            geometry: {
              location: {
                lat: () => defaultAddress.latitude || 0,
                lng: () => defaultAddress.longitude || 0,
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      this.setState({ loadingAddresses: false });
    }
  };

  private handleFormChange = (
    field: keyof CheckoutFormState,
    value: string | undefined
  ): void => {
    this.setState(
      (prevState) => {
        const newState = {
          ...prevState,
          [field]: value,
        };
        return newState;
      },
      () => {
        this.saveFormData();
        this.validateForm();
      }
    );
  };

  private handleAddressChange = (
    address: string,
    placeDetails?: {
      geometry?: {
        location?: {
          lat(): number;
          lng(): number;
        };
      };
    }
  ): void => {
    this.handleFormChange("address", address);

    if (placeDetails?.geometry?.location) {
      const lat = placeDetails.geometry.location.lat();
      const lng = placeDetails.geometry.location.lng();
      const deliveryPriceResult = calculateDeliveryPrice(lat, lng);
      this.setState({
        deliveryLocation: { lat, lng },
        deliveryPriceResult,
      });
    }
  };

  private validateForm = (): { isValid: boolean; errors: Partial<Record<keyof CheckoutFormState, string>> } => {
    const errors: Partial<Record<keyof CheckoutFormState, string>> = {};

    if (!this.state.deliveryDate) {
      errors.deliveryDate = "Tanggal harus diisi";
    } else {
      const selectedDate = new Date(this.state.deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        errors.deliveryDate = "Tanggal harus minimal besok";
      }
    }

    if (this.state.deliveryType === "delivery") {
      if (!this.state.address.trim()) {
        errors.address = "Alamat pengiriman harus diisi";
      } else if (this.state.address.trim().length < 10) {
        errors.address = "Alamat terlalu pendek, minimal 10 karakter";
      }
    }

    if (this.state.greetingCard.length > 200) {
      errors.greetingCard = "Kartu ucapan maksimal 200 karakter";
    }

    if (this.state.orderNotes.length > 500) {
      errors.orderNotes = "Catatan pesanan maksimal 500 karakter";
    }

    const isValid = Object.keys(errors).length === 0;
    this.setState({ formErrors: errors, isFormValid: isValid });
    return { isValid, errors };
  };

  private calculateItemTotal = (item: CartItem): number => {
    const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
    return discount.finalPrice;
  };

  private calculateGrandTotal = (): number => {
    const { items, deliveryPriceResult, deliveryType } = this.state;
    const subtotal = items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    const delivery = deliveryType === "delivery" && deliveryPriceResult ? deliveryPriceResult.price : 0;
    return subtotal + delivery;
  };

  private buildWhatsAppMessage = (): string => {
    const { items, deliveryType, deliveryDate, deliveryTimeSlot, address, greetingCard, orderNotes } = this.state;
    
    const getTimeSlotLabel = (slotId: string): string => {
      switch (slotId) {
        case "morning":
          return "Pagi (09:00-12:00)";
        case "afternoon":
          return "Siang (12:00-15:00)";
        case "evening":
          return "Sore (15:00-18:00)";
        default:
          return slotId;
      }
    };

    const lines = [
      `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan beberapa bouquet:`,
      ``,
      ...items.map((item, index) => {
        const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
        return [
          `${index + 1}. ${item.bouquetName}`,
          `   Harga: ${formatIDR(item.bouquetPrice)} x ${item.quantity} = ${formatIDR(discount.finalPrice)}`,
          discount.discountAmount > 0 ? `   Diskon: ${discount.discountPercentage}% (hemat ${formatIDR(discount.discountAmount)})` : "",
        ].filter(Boolean).join("\n");
      }),
      ``,
      `📦 Pengiriman: ${deliveryType === "pickup" ? "Ambil di toko" : "Diantar"}`,
      deliveryDate ? `📅 Tanggal: ${deliveryDate}` : "",
      deliveryTimeSlot ? `⏰ Waktu: ${getTimeSlotLabel(deliveryTimeSlot)}` : "",
      deliveryType === "delivery" && address ? `📍 Alamat: ${address}` : "",
      greetingCard ? `💌 Kartu Ucapan: ${greetingCard}` : "",
      orderNotes ? `📝 Catatan Pesanan: ${orderNotes}` : "",
      ``,
      `💰 Total: ${formatIDR(this.calculateGrandTotal())}`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  private handleExpressCheckout = (): void => {
    const defaultAddress = this.state.savedAddresses.find((addr) => addr.isDefault);
    if (!defaultAddress) {
      toast.error("Tidak ada alamat default tersimpan");
      return;
    }

    // Auto-fill dengan data default
    this.setState(
      {
        deliveryType: "delivery",
        deliveryDate: this.getDefaultDate(),
        address: defaultAddress.fullAddress,
        deliveryTimeSlot: undefined,
        greetingCard: "",
        orderNotes: "",
      },
      () => {
        // Calculate delivery price
        if (defaultAddress.latitude && defaultAddress.longitude) {
          const deliveryPriceResult = calculateDeliveryPrice(
            defaultAddress.latitude,
            defaultAddress.longitude
          );
          this.setState({
            deliveryLocation: {
              lat: defaultAddress.latitude,
              lng: defaultAddress.longitude,
            },
            deliveryPriceResult,
          });
        }

        // Validate and submit
        setTimeout(() => {
          this.validateForm();
          setTimeout(() => {
            if (this.state.isFormValid) {
              this.handlePreview();
            } else {
              toast.error("Harap lengkapi semua field yang wajib diisi");
            }
          }, 100);
        }, 200);
      }
    );
  };

  private handlePreview = (): void => {
    const validation = this.validateForm();
    if (!validation.isValid) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      // Scroll to first error
      const firstError = document.querySelector(".checkoutForm__input--error, .checkoutForm__textarea--error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstError as HTMLElement).focus();
      }
      return;
    }
    this.setState({ showPreviewModal: true });
  };

  private handleConfirmSubmit = (): void => {
    this.setState({ showPreviewModal: false, isSubmitting: true });
    this.processSubmit();
  };

  private processSubmit = (): void => {

    // Build WhatsApp message and open
    const message = this.buildWhatsAppMessage();
    const waLink = buildWhatsAppLink(message);

    // Save order data for confirmation page
    const orderData = {
      items: this.state.items.map((item) => ({
        name: item.bouquetName,
        price: item.bouquetPrice,
        quantity: item.quantity,
      })),
      deliveryType: this.state.deliveryType,
      deliveryDate: this.state.deliveryDate,
      deliveryTimeSlot: this.state.deliveryTimeSlot,
      address: this.state.address,
      greetingCard: this.state.greetingCard,
      orderNotes: this.state.orderNotes,
      totalPrice: this.calculateGrandTotal(),
    };

    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    localStorage.removeItem(this.formStorageKey);

    // Clear cart after successful order
    clearCart();

    // Open WhatsApp
    window.open(waLink, "_blank");

    // Redirect to confirmation page
    setTimeout(() => {
      const confirmationUrl = new URL("/order-confirmation", window.location.origin);
      Object.entries(orderData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "items") {
            confirmationUrl.searchParams.set(key, encodeURIComponent(JSON.stringify(value)));
          } else {
            confirmationUrl.searchParams.set(key, encodeURIComponent(String(value)));
          }
        }
      });
      window.location.href = confirmationUrl.toString();
    }, 500);
  };

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
    } = this.state;

    // Check if user has default address for Express Checkout
    const hasDefaultAddress = savedAddresses.some((addr) => addr.isDefault);
    const canUseExpressCheckout = hasDefaultAddress && deliveryType === "delivery" && address.trim().length >= 10;

    const isAuthenticated = !!getAccessToken();

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

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

    if (items.length === 0) {
      return <Navigate to="/cart" replace />;
    }

    const grandTotal = this.calculateGrandTotal();
    const minDate = this.getDefaultDate();

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
                  const itemTotal = this.calculateItemTotal(item);
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
                        onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
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
                        onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
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
                    onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
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
                      onSelect={(slotId) => this.handleFormChange("deliveryTimeSlot", slotId)}
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
                                  this.handleAddressChange(addr.fullAddress, {
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
                          onChange={this.handleAddressChange}
                          placeholder="Masukkan alamat lengkap"
                          required
                          error={formErrors.address}
                          onLocationChange={(lat, lng) => {
                            const deliveryPriceResult = calculateDeliveryPrice(lat, lng);
                            this.setState({
                              deliveryLocation: { lat, lng },
                              deliveryPriceResult,
                            });
                          }}
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
                    onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
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
                    value={this.state.orderNotes}
                    onChange={(e) => this.handleFormChange("orderNotes", e.target.value)}
                    maxLength={500}
                    aria-invalid={!!formErrors.orderNotes}
                    aria-describedby={formErrors.orderNotes ? "orderNotes-error" : undefined}
                  />
                  <div className="checkoutForm__charCount">
                    {this.state.orderNotes.length} / 500 karakter
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
                      {formatIDR(items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0))}
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
                      onClick={this.handleExpressCheckout}
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
                  onClick={this.handlePreview}
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
          isOpen={this.state.showPreviewModal}
          onClose={() => this.setState({ showPreviewModal: false })}
          onConfirm={this.handleConfirmSubmit}
          items={items}
          deliveryType={deliveryType}
          deliveryDate={deliveryDate}
          deliveryTimeSlot={deliveryTimeSlot}
          address={address}
          greetingCard={greetingCard}
          orderNotes={orderNotes}
          subtotal={items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0)}
          deliveryPrice={deliveryType === "delivery" && deliveryPriceResult ? deliveryPriceResult.price : 0}
          total={grandTotal}
          isSubmitting={isSubmitting}
        />
      </section>
    );
  }
}

// Wrapper to use hooks
const CheckoutPageWrapper: React.FC = () => {
  return <CheckoutPage />;
};

export default CheckoutPageWrapper;


/**
 * Checkout Page Controller
 * OOP-based controller for managing checkout page state and operations
 */

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";
import { getCartItems, clearCart, type CartItem } from "../utils/cart";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import { calculateDeliveryPrice } from "../utils/delivery-calculator";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { STORE_PROFILE } from "../config/store-profile";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { API_BASE } from "../config/api";
import {
  type CheckoutPageState,
  type CheckoutFormState,
  INITIAL_CHECKOUT_PAGE_STATE,
  getDefaultDate,
  DEFAULT_CHECKOUT_PAGE_SEO,
} from "../models/checkout-page-model";
import CheckoutPageView from "../view/checkout-page";

interface CheckoutPageControllerProps {
  // Add any props if needed in the future
}

/**
 * Checkout Page Controller Class
 * Manages all business logic, form validation, and checkout operations
 */
export class CheckoutPageController extends Component<
  CheckoutPageControllerProps,
  CheckoutPageState
> {
  private formStorageKey = "checkout_form_data";

  state: CheckoutPageState = {
    ...INITIAL_CHECKOUT_PAGE_STATE,
  };

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_CHECKOUT_PAGE_SEO);
  }

  /**
   * Load cart items
   */
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

  /**
   * Load saved form data
   */
  private loadSavedFormData = (): void => {
    try {
      const saved = localStorage.getItem(this.formStorageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === "object") {
          this.setState({
            deliveryType: data.deliveryType || "delivery",
            deliveryDate: data.deliveryDate || getDefaultDate(),
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

  /**
   * Save form data
   */
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

  /**
   * Load saved addresses
   */
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
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load addresses:", error);
      }
    } finally {
      this.setState({ loadingAddresses: false });
    }
  };

  /**
   * Validate form
   */
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

  /**
   * Calculate item total
   */
  private calculateItemTotal = (item: CartItem): number => {
    const discount = calculateBulkDiscount(item.bouquetPrice, item.quantity);
    return discount.finalPrice;
  };

  /**
   * Calculate grand total
   */
  private calculateGrandTotal = (): number => {
    const { items, deliveryPriceResult, deliveryType } = this.state;
    const subtotal = items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
    const delivery = deliveryType === "delivery" && deliveryPriceResult ? deliveryPriceResult.price : 0;
    return subtotal + delivery;
  };

  /**
   * Get time slot label
   */
  private getTimeSlotLabel = (slotId: string): string => {
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

  /**
   * Build WhatsApp message
   */
  private buildWhatsAppMessage = (): string => {
    const { items, deliveryType, deliveryDate, deliveryTimeSlot, address, greetingCard, orderNotes } = this.state;

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
      deliveryTimeSlot ? `⏰ Waktu: ${this.getTimeSlotLabel(deliveryTimeSlot)}` : "",
      deliveryType === "delivery" && address ? `📍 Alamat: ${address}` : "",
      greetingCard ? `💌 Kartu Ucapan: ${greetingCard}` : "",
      orderNotes ? `📝 Catatan Pesanan: ${orderNotes}` : "",
      ``,
      `💰 Total: ${formatIDR(this.calculateGrandTotal())}`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  /**
   * Handle form field change
   */
  handleFormChange = (field: keyof CheckoutFormState, value: string | undefined): void => {
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

  /**
   * Handle address change
   */
  handleAddressChange = (
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

  /**
   * Handle location change from AddressAutocomplete
   */
  handleLocationChange = (lat: number, lng: number): void => {
    const deliveryPriceResult = calculateDeliveryPrice(lat, lng);
    this.setState({
      deliveryLocation: { lat, lng },
      deliveryPriceResult,
    });
  };

  /**
   * Handle express checkout
   */
  handleExpressCheckout = (): void => {
    const defaultAddress = this.state.savedAddresses.find((addr) => addr.isDefault);
    if (!defaultAddress) {
      toast.error("Tidak ada alamat default tersimpan");
      return;
    }

    // Auto-fill dengan data default
    this.setState(
      {
        deliveryType: "delivery",
        deliveryDate: getDefaultDate(),
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

  /**
   * Handle preview
   */
  handlePreview = (): void => {
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

  /**
   * Handle close preview modal
   */
  handleClosePreviewModal = (): void => {
    this.setState({ showPreviewModal: false });
  };

  /**
   * Handle confirm submit
   */
  handleConfirmSubmit = (): void => {
    this.setState({ showPreviewModal: false, isSubmitting: true });
    this.processSubmit();
  };

  /**
   * Process submit
   */
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

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.initializeSeo();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      return;
    }

    this.loadCart();
    this.loadSavedFormData();
    this.loadSavedAddresses();
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const { items, isLoading, isSubmitting } = this.state;

    const isAuthenticated = !!getAccessToken();

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    if (isLoading) {
      return (
        <CheckoutPageView
          items={[]}
          isLoading={true}
          isSubmitting={false}
          deliveryType={this.state.deliveryType}
          deliveryDate={this.state.deliveryDate}
          deliveryTimeSlot={this.state.deliveryTimeSlot}
          address={this.state.address}
          greetingCard={this.state.greetingCard}
          orderNotes={this.state.orderNotes}
          formErrors={this.state.formErrors}
          isFormValid={this.state.isFormValid}
          deliveryPriceResult={this.state.deliveryPriceResult}
          savedAddresses={this.state.savedAddresses}
          loadingAddresses={this.state.loadingAddresses}
          showPreviewModal={this.state.showPreviewModal}
          calculateItemTotal={this.calculateItemTotal}
          calculateGrandTotal={this.calculateGrandTotal}
          getDefaultDate={getDefaultDate}
          onFormChange={this.handleFormChange}
          onAddressChange={this.handleAddressChange}
          onLocationChange={this.handleLocationChange}
          onExpressCheckout={this.handleExpressCheckout}
          onPreview={this.handlePreview}
          onClosePreviewModal={this.handleClosePreviewModal}
          onConfirmSubmit={this.handleConfirmSubmit}
        />
      );
    }

    if (items.length === 0) {
      return <Navigate to="/cart" replace />;
    }

    // Check if user has default address for Express Checkout
    const hasDefaultAddress = this.state.savedAddresses.some((addr) => addr.isDefault);
    const canUseExpressCheckout = hasDefaultAddress && this.state.deliveryType === "delivery" && this.state.address.trim().length >= 10;

    return (
      <CheckoutPageView
        items={items}
        isLoading={false}
        isSubmitting={isSubmitting}
        deliveryType={this.state.deliveryType}
        deliveryDate={this.state.deliveryDate}
        deliveryTimeSlot={this.state.deliveryTimeSlot}
        address={this.state.address}
        greetingCard={this.state.greetingCard}
        orderNotes={this.state.orderNotes}
        formErrors={this.state.formErrors}
        isFormValid={this.state.isFormValid}
        deliveryPriceResult={this.state.deliveryPriceResult}
        savedAddresses={this.state.savedAddresses}
        loadingAddresses={this.state.loadingAddresses}
        showPreviewModal={this.state.showPreviewModal}
        canUseExpressCheckout={canUseExpressCheckout}
        calculateItemTotal={this.calculateItemTotal}
        calculateGrandTotal={this.calculateGrandTotal}
        getDefaultDate={getDefaultDate}
        onFormChange={this.handleFormChange}
        onAddressChange={this.handleAddressChange}
        onLocationChange={this.handleLocationChange}
        onExpressCheckout={this.handleExpressCheckout}
        onPreview={this.handlePreview}
        onClosePreviewModal={this.handleClosePreviewModal}
        onConfirmSubmit={this.handleConfirmSubmit}
      />
    );
  }
}

export default CheckoutPageController;

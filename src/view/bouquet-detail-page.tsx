import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { observeFadeIn, revealOnScroll } from "../utils/luxury-enhancements";
import { formatBouquetName, formatBouquetType, formatBouquetSize, formatCollectionName, formatOccasion, formatFlowerName, formatDescription } from "../utils/text-formatter";
import SocialProof from "../components/SocialProof";
import UrgencyIndicator from "../components/UrgencyIndicator";
import { calculateBulkDiscount } from "../utils/bulk-discount";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { addToRecentlyViewed } from "../utils/recently-viewed";
import { toast } from "../utils/toast";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
import { getAccessToken } from "../utils/auth-utils";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

const formatPrice = formatIDR;

const buildImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const toAbsoluteUrl = (urlOrPath: string): string => {
  const v = (urlOrPath ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return new URL(v.startsWith("/") ? v : `/${v}`, window.location.origin).toString();
};


const buildCustomerOrderMessage = (
  b: Bouquet,
  detailUrl: string,
  formData: OrderFormState
) => {
  const lines = [
    `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan bouquet berikut:`,
    ``,
    `Nama: ${formatBouquetName(b.name)}`,
    `Harga: ${formatPrice(b.price)}`,
    b.status ? `Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    b.size ? `Ukuran: ${formatBouquetSize(b.size)}` : "",
    b.type ? `Tipe: ${formatBouquetType(b.type)}` : "",
    `Jumlah: ${formData.quantity}`,
    ``,
    `📦 Pengiriman: ${formData.deliveryType === "pickup" ? "Ambil di toko" : "Diantar"}`,
    formData.deliveryType === "delivery" && formData.deliveryDate
      ? `📅 Tanggal pengiriman: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengiriman: ${formData.deliveryTimeSlot}` : ""}`
      : formData.deliveryType === "pickup" && formData.deliveryDate
        ? `📅 Tanggal pengambilan: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengambilan: ${formData.deliveryTimeSlot}` : ""}`
        : "",
    formData.deliveryType === "delivery" && formData.address
      ? `📍 Alamat: ${formData.address}`
      : "",
    formData.greetingCard
      ? `💌 Kartu ucapan: ${formData.greetingCard}`
      : "",
    ``,
    detailUrl ? `Tautan detail: ${detailUrl}` : "",
  ].filter(Boolean);

  return lines.join("\n");
};

interface Props {
  bouquet: Bouquet | null;
  loading: boolean;
  error: string | null;
  detailUrl: string;
  similarBouquets?: Bouquet[]; // Optional similar bouquets for recommendations
}

interface OrderFormState {
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  quantity: number;
}

interface BouquetDetailState extends OrderFormState {
  formErrors: Partial<Record<keyof OrderFormState, string>>;
  isFormValid: boolean;
  isFavorite: boolean;
  showDetails: boolean; // For collapsible details section
  showOrderModal: boolean; // Order form modal
  showQuickOrderModal: boolean; // Quick order modal
  showServiceInfo: boolean; // Service info popup
  quickOrderData: {
    recipientName?: string;
    recipientPhone?: string;
  };
}

class BouquetDetailPage extends Component<Props, BouquetDetailState> {
  private formStorageKey = "bouquet_order_form_data";
  private saveFormDataTimeout: NodeJS.Timeout | null = null;
  private validateFormTimeout: NodeJS.Timeout | null = null;
  private priceBreakdownCache: { subtotal: number; delivery: number; discount: number; total: number } | null = null;
  private priceBreakdownCacheKey: string = "";

  state: BouquetDetailState = {
    deliveryType: "delivery",
    deliveryDate: this.getDefaultDate(),
    deliveryTimeSlot: undefined,
    address: "",
    greetingCard: "",
    quantity: 1,
    formErrors: {},
    isFormValid: false,
    isFavorite: false,
    showDetails: false, // Details collapsed by default for efficiency
    showOrderModal: false, // Order form in modal for efficiency
    showQuickOrderModal: false, // Quick order modal
    showServiceInfo: false, // Service info popup
    quickOrderData: {},
  };

  private getDefaultDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  private loadSavedFormData(): void {
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
            quantity: data.quantity || 1,
          });
        }
      }

      // Auto-load saved address if user is authenticated
      setTimeout(() => {
        this.loadSavedAddress();
      }, 500);
    } catch {
      // Ignore errors
    }
  }

  private loadSavedAddress = async (): Promise<void> => {
    try {
      const token = getAccessToken();
      if (!token || this.state.address) return; // Skip if already has address

      const response = await fetch(`${API_BASE}/api/customers/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const addresses = await response.json();
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress && defaultAddress.fullAddress) {
          this.setState({ address: defaultAddress.fullAddress });
          toast.info("Alamat default dimuat");
        }
      }
    } catch (error) {
      // Silently fail - not critical
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load saved address:", error);
      }
    }
  };

  private saveFormData(): void {
    try {
      const data = {
        deliveryType: this.state.deliveryType,
        deliveryDate: this.state.deliveryDate,
        deliveryTimeSlot: this.state.deliveryTimeSlot,
        address: this.state.address,
        greetingCard: this.state.greetingCard,
        quantity: this.state.quantity,
      };
      localStorage.setItem(this.formStorageKey, JSON.stringify(data));
      
      // Also save to previous orders for auto-complete
      const previousOrders = localStorage.getItem("previous_orders");
      let orders = [];
      if (previousOrders) {
        try {
          orders = JSON.parse(previousOrders);
          if (!Array.isArray(orders)) orders = [];
        } catch {
          orders = [];
        }
      }
      
      // Add current order to history (keep last 5)
      orders.push({
        ...data,
        timestamp: Date.now(),
        bouquetId: this.props.bouquet?._id,
        bouquetName: this.props.bouquet?.name,
      });
      
      // Keep only last 5 orders
      if (orders.length > 5) {
        orders = orders.slice(-5);
      }
      
      localStorage.setItem("previous_orders", JSON.stringify(orders));
    } catch {
      // Ignore errors
    }
  }

  private validateForm(): { isValid: boolean; errors: Partial<Record<keyof OrderFormState, string>> } {
    const errors: Partial<Record<keyof OrderFormState, string>> = {};
    
    if (this.state.quantity < 1 || this.state.quantity > 99) {
      errors.quantity = "Jumlah harus antara 1-99";
    }

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

    if (this.state.deliveryType === "delivery" && !this.state.address.trim()) {
      errors.address = "Alamat pengiriman harus diisi";
    } else if (this.state.deliveryType === "delivery" && this.state.address.trim().length < 10) {
      errors.address = "Alamat terlalu pendek, minimal 10 karakter";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private calculateFormProgress(): number {
    // Memoize calculation - only recalculate if state changes
    const stateKey = `${this.state.quantity}-${this.state.deliveryType}-${this.state.deliveryDate}-${this.state.address.length}`;
    if ((this as any)._formProgressCache?.key === stateKey) {
      return (this as any)._formProgressCache.value;
    }
    
    let completed = 0;
    const total = 4; // quantity, deliveryType, deliveryDate, address (if delivery)

    // Quantity (always required)
    if (this.state.quantity >= 1 && this.state.quantity <= 99) {
      completed++;
    }

    // Delivery type (always required)
    if (this.state.deliveryType) {
      completed++;
    }

    // Delivery date (always required)
    if (this.state.deliveryDate) {
      const selectedDate = new Date(this.state.deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (selectedDate >= tomorrow) {
        completed++;
      }
    }

    // Address (required only if delivery)
    if (this.state.deliveryType === "pickup") {
      completed++; // Auto-complete if pickup
    } else if (this.state.deliveryType === "delivery" && this.state.address.trim().length >= 10) {
      completed++;
    }

    const progress = Math.round((completed / total) * 100);
    
    // Cache the result
    (this as any)._formProgressCache = { key: stateKey, value: progress };
    
    return progress;
  }

  private calculateDeliveryTime(): string {
    if (!this.state.deliveryDate) return "";
    
    // Memoize calculation
    const cacheKey = this.state.deliveryDate;
    if ((this as any)._deliveryTimeCache?.key === cacheKey) {
      return (this as any)._deliveryTimeCache.value;
    }
    
    const selectedDate = new Date(this.state.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let result = "";
    if (diffDays === 1) {
      result = "Same-day delivery";
    } else if (diffDays === 2) {
      result = "Next-day delivery";
    } else if (diffDays > 2 && diffDays <= 7) {
      result = `${diffDays - 1} hari lagi`;
    } else if (diffDays > 7) {
      result = `${diffDays - 1} hari lagi (Pre-order)`;
    }
    
    // Cache the result
    (this as any)._deliveryTimeCache = { key: cacheKey, value: result };
    
    return result;
  }

  private calculatePriceBreakdown(): { subtotal: number; delivery: number; discount: number; total: number } {
    const { bouquet } = this.props;
    if (!bouquet) return { subtotal: 0, delivery: 0, discount: 0, total: 0 };
    
    // Cache key for memoization
    const cacheKey = `${bouquet.price}-${this.state.quantity}-${this.state.deliveryType}`;
    
    // Return cached result if available
    if (this.priceBreakdownCache && this.priceBreakdownCacheKey === cacheKey) {
      return this.priceBreakdownCache;
    }
    
    // Calculate bulk discount
    const bulkDiscount = calculateBulkDiscount(bouquet.price, this.state.quantity);
    const subtotal = bulkDiscount.originalPrice;
    const discount = bulkDiscount.discountAmount;
    
    // Delivery price will be calculated by admin after order confirmation
    const delivery = 0;
    
    const total = bulkDiscount.finalPrice + delivery;
    
    // Cache the result
    const result = { subtotal, delivery, discount, total };
    this.priceBreakdownCache = result;
    this.priceBreakdownCacheKey = cacheKey;
    
    return result;
  }


  private copyOrderDetails = (): void => {
    const { bouquet, detailUrl } = this.props;
    if (!bouquet) return;
    
    const orderText = buildCustomerOrderMessage(bouquet, detailUrl, this.state);
    
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(orderText).then(() => {
        // Show temporary feedback
        const btn = document.querySelector(".bdCopyOrderBtn");
        if (btn) {
          const originalText = btn.textContent;
          btn.textContent = "✓ Tersalin!";
          setTimeout(() => {
            if (btn.textContent === "✓ Tersalin!") {
              btn.textContent = originalText || "Salin Detail";
            }
          }, 2000);
        }
      }).catch(() => {});
    }
  };

  componentDidMount(): void {
    // Critical: Apply SEO immediately
    this.applySeo();
    
    // Load saved form data
    this.loadSavedFormData();
    
    // Check favorite status and track recently viewed
    const { bouquet } = this.props;
    if (bouquet) {
      this.setState({ isFavorite: isFavorite(bouquet._id) });
      // Track recently viewed (non-blocking)
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          addToRecentlyViewed(
            bouquet._id,
            bouquet.name,
            bouquet.price,
            bouquet.image
          );
        }, { timeout: 1000 });
      } else {
        setTimeout(() => {
          addToRecentlyViewed(
            bouquet._id,
            bouquet.name,
            bouquet.price,
            bouquet.image
          );
        }, 100);
      }
    }
    
    // Validate form after loading saved data (non-blocking)
    const validateForm = () => {
      const validation = this.validateForm();
      this.setState({
        formErrors: validation.errors,
        isFormValid: validation.isValid,
      });
    };
    
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(validateForm, { timeout: 200 });
    } else {
      setTimeout(validateForm, 100);
    }
    
    // Initialize luxury enhancements (non-blocking)
    const initLuxuryEnhancements = () => {
      // Make all fade-in elements visible immediately
      const fadeElements = document.querySelectorAll(".fade-in");
      fadeElements.forEach((el) => {
        el.classList.add("fade-in-visible");
      });

      // Make all reveal-on-scroll elements visible immediately
      const revealElements = document.querySelectorAll(".reveal-on-scroll");
      revealElements.forEach((el) => {
        el.classList.add("revealed");
      });

      // Then set up observers for future elements
      observeFadeIn(".fade-in");
      revealOnScroll();
    };
    
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(initLuxuryEnhancements, { timeout: 100 });
    } else {
      setTimeout(initLuxuryEnhancements, 50);
    }
  }

  componentWillUnmount(): void {
    // Cleanup timeouts
    if (this.saveFormDataTimeout) {
      clearTimeout(this.saveFormDataTimeout);
      this.saveFormDataTimeout = null;
    }
    if (this.validateFormTimeout) {
      clearTimeout(this.validateFormTimeout);
      this.validateFormTimeout = null;
    }
    
    // Clear caches
    this.priceBreakdownCache = null;
    this.priceBreakdownCacheKey = "";
    (this as any)._formProgressCache = null;
    (this as any)._deliveryTimeCache = null;
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.bouquet !== this.props.bouquet ||
      prevProps.detailUrl !== this.props.detailUrl ||
      prevProps.error !== this.props.error
    ) {
      // Critical: Apply SEO immediately
      this.applySeo();
      
      // Clear price breakdown cache when bouquet changes
      this.priceBreakdownCache = null;
      this.priceBreakdownCacheKey = "";
      
      // Re-initialize luxury enhancements on update (non-blocking)
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          observeFadeIn(".fade-in");
          revealOnScroll();
        }, { timeout: 200 });
      } else {
        setTimeout(() => {
          observeFadeIn(".fade-in");
          revealOnScroll();
        }, 100);
      }
    }
  }

  private handleFormChange = (
    field: keyof OrderFormState,
    value: string | number
  ): void => {
    this.setState((prevState) => {
      const newState = {
        ...prevState,
        [field]: value,
      };
      
      // Debounce auto-save form data
      if (this.saveFormDataTimeout) {
        clearTimeout(this.saveFormDataTimeout);
      }
      this.saveFormDataTimeout = setTimeout(() => {
        this.saveFormData();
      }, 500);
      
      // Debounce form validation
      if (this.validateFormTimeout) {
        clearTimeout(this.validateFormTimeout);
      }
      this.validateFormTimeout = setTimeout(() => {
        const validation = this.validateForm();
        this.setState({
          formErrors: validation.errors,
          isFormValid: validation.isValid,
        });
        // Clear price breakdown cache when form changes
        this.priceBreakdownCache = null;
        this.priceBreakdownCacheKey = "";
      }, 200);
      
      return newState;
    });
  };

  private handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    this.handleFormChange("address", e.target.value);
  };

  private handleFavoriteToggle = (): void => {
    const { bouquet } = this.props;
    if (!bouquet) return;
    
    const newFavoriteStatus = toggleFavorite(
      bouquet._id,
      bouquet.name,
      bouquet.price,
      bouquet.image
    );
    
    this.setState({ isFavorite: newFavoriteStatus });
  };

  private applySeo(): void {
    const { bouquet } = this.props;
    if (!bouquet) {
      setSeo({
        title: "Detail Bouquet | Giftforyou.idn",
        description: "Lihat detail bouquet dan pesan lewat WhatsApp.",
        path: window.location.pathname,
      });
      return;
    }

    const details = [formatBouquetType(bouquet.type), formatBouquetSize(bouquet.size)].filter(Boolean).join(" • ");
    const price = Number.isFinite(bouquet.price)
      ? formatPrice(bouquet.price)
      : undefined;
    const titleParts = [formatBouquetName(bouquet.name), details].filter(Boolean).join(" — ");

    const locationKeywords = "Cirebon, Jawa Barat";
    setSeo({
      title: `${titleParts} | Giftforyou.idn - Florist Cirebon`,
      description:
        `${formatBouquetName(bouquet.name)}${details ? ` (${details})` : ""}` +
        (price ? ` — ${price}.` : ".") +
        ` Tersedia di Cirebon, Jawa Barat. Pesan mudah lewat WhatsApp dengan pengiriman cepat ke seluruh Cirebon dan sekitarnya.`,
      keywords:
        `${formatBouquetName(bouquet.name).toLowerCase()}, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist cirebon, toko bunga cirebon, hadiah cirebon, kado cirebon, florist jawa barat, ${locationKeywords}`,
      path: window.location.pathname,
      ogImagePath: bouquet.image ? buildImageUrl(bouquet.image) : undefined,
      structuredData: {
        "@type": "Product",
        name: bouquet.name,
        description: bouquet.description || `${bouquet.name} tersedia di Cirebon, Jawa Barat`,
        image: bouquet.image ? buildImageUrl(bouquet.image) : undefined,
        offers: {
          "@type": "Offer",
          price: bouquet.price,
          priceCurrency: "IDR",
          availability: bouquet.status === "ready" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          url: window.location.href,
        },
        brand: {
          "@type": "Brand",
          name: STORE_PROFILE.brand.name,
        },
        category: bouquet.type || "Bouquet",
      },
    });
  }

  private copyToClipboard = (text: string): void => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    // Optional: Show brief feedback (could add toast notification)
  };

  private renderOrderModal(): React.ReactNode {
    const { bouquet, detailUrl } = this.props;
    if (!bouquet || !this.state.showOrderModal) return null;

    const breakdown = this.calculatePriceBreakdown();
    const waOrderLink = buildWhatsAppLink(
      buildCustomerOrderMessage(bouquet, detailUrl, this.state)
    );

    return (
      <div
        className="bdOrderModalOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            this.setState({ showOrderModal: false });
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-order-modal-title"
      >
        <div className="bdOrderModal">
          <div className="bdOrderModal__header">
            <h2 id="bd-order-modal-title" className="bdOrderModal__title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Form Pemesanan
            </h2>
            <button
              type="button"
              className="bdOrderModal__close"
              onClick={() => this.setState({ showOrderModal: false })}
              aria-label="Tutup form pemesanan"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="bdOrderModal__content">
            {/* Delivery Type */}
            <div className="bdFormGroup">
              <label className="bdFormLabel">
                Tipe Pengiriman <span className="bdFormLabel__required">*</span>
              </label>
              <div className="bdFormRadioGroup">
                <label className="bdFormRadio">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={this.state.deliveryType === "delivery"}
                    onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
                  />
                  <span className="bdFormRadio__label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Diantar
                  </span>
                </label>
                <label className="bdFormRadio">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={this.state.deliveryType === "pickup"}
                    onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
                  />
                  <span className="bdFormRadio__label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ambil di Toko
                  </span>
                </label>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="bdFormGroup">
              <label htmlFor="bd-delivery-date" className="bdFormLabel">
                {this.state.deliveryType === "delivery" ? "Tanggal Pengiriman" : "Tanggal Pengambilan"} <span className="bdFormLabel__required">*</span>
              </label>
              <input
                id="bd-delivery-date"
                type="date"
                className="bdFormInput"
                value={this.state.deliveryDate}
                min={this.getDefaultDate()}
                onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
                aria-invalid={!!this.state.formErrors.deliveryDate}
                aria-describedby={this.state.formErrors.deliveryDate ? "bd-delivery-date-error" : undefined}
              />
              {this.state.formErrors.deliveryDate && (
                <span id="bd-delivery-date-error" className="bdFormError" role="alert">
                  {this.state.formErrors.deliveryDate}
                </span>
              )}
            </div>

            {/* Delivery Time - Simplified */}
            {this.state.deliveryDate && (
              <div className="bdFormGroup">
                <label htmlFor="bd-delivery-time" className="bdFormLabel">
                  {this.state.deliveryType === "delivery" ? "Waktu Pengiriman (Opsional)" : "Waktu Pengambilan (Opsional)"}
                </label>
                <input
                  id="bd-delivery-time"
                  type="time"
                  className="bdFormInput"
                  value={this.state.deliveryTimeSlot || ""}
                  onChange={(e) => this.handleFormChange("deliveryTimeSlot", e.target.value)}
                />
              </div>
            )}

            {/* Address - Only for delivery */}
            {this.state.deliveryType === "delivery" && (
              <div className="bdFormGroup">
                <label htmlFor="bd-address" className="bdFormLabel">
                  Alamat Pengiriman <span className="bdFormLabel__required">*</span>
                </label>
                <textarea
                  id="bd-address"
                  className="bdFormInput"
                  rows={3}
                  value={this.state.address}
                  onChange={this.handleAddressChange}
                  placeholder="Masukkan alamat lengkap (contoh: Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos)"
                  aria-invalid={!!this.state.formErrors.address}
                  aria-describedby={this.state.formErrors.address ? "bd-address-error" : undefined}
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
                {this.state.formErrors.address && (
                  <span id="bd-address-error" className="bdFormError" role="alert">
                    {this.state.formErrors.address}
                  </span>
                )}
                <div className="bdFormHint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pastikan alamat lengkap dan jelas untuk memudahkan pengiriman
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="bdFormGroup">
              <label htmlFor="bd-quantity" className="bdFormLabel">
                Jumlah <span className="bdFormLabel__required">*</span>
              </label>
              <div className="bdQuantityControls">
                <button
                  type="button"
                  className="bdQuantityBtn"
                  onClick={() => {
                    if (this.state.quantity > 1) {
                      this.handleFormChange("quantity", this.state.quantity - 1);
                    }
                  }}
                  aria-label="Kurangi jumlah"
                  disabled={this.state.quantity <= 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <input
                  id="bd-quantity"
                  type="number"
                  className="bdQuantityInput"
                  min="1"
                  max="99"
                  value={this.state.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    this.handleFormChange("quantity", Math.max(1, Math.min(99, val)));
                  }}
                  aria-invalid={!!this.state.formErrors.quantity}
                  aria-describedby={this.state.formErrors.quantity ? "bd-quantity-error" : undefined}
                />
                <button
                  type="button"
                  className="bdQuantityBtn"
                  onClick={() => {
                    if (this.state.quantity < 99) {
                      this.handleFormChange("quantity", this.state.quantity + 1);
                    }
                  }}
                  aria-label="Tambah jumlah"
                  disabled={this.state.quantity >= 99}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              {this.state.formErrors.quantity && (
                <span id="bd-quantity-error" className="bdFormError" role="alert">
                  {this.state.formErrors.quantity}
                </span>
              )}
            </div>

            {/* Greeting Card */}
            <div className="bdFormGroup">
              <label htmlFor="bd-greeting-card" className="bdFormLabel">
                Kartu Ucapan (Opsional)
              </label>
              <textarea
                id="bd-greeting-card"
                className="bdFormTextarea"
                rows={3}
                value={this.state.greetingCard}
                onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
                placeholder="Tulis pesan untuk kartu ucapan..."
                maxLength={200}
              />
              <div className="bdFormHint">
                {this.state.greetingCard.length}/200 karakter
              </div>
            </div>
          </div>

          <div className="bdOrderModal__footer">
            {!this.state.isFormValid && (
              <div className="bdOrderModal__warning" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Lengkapi semua field yang wajib untuk melanjutkan</span>
              </div>
            )}
            <div className="bdOrderModal__summary">
              <div className="bdOrderModal__total">
                <span className="bdOrderModal__totalLabel">Total:</span>
                <span className="bdOrderModal__totalValue">{formatPrice(breakdown.total)}</span>
              </div>
            </div>
            <div className="bdOrderModal__actions">
              <button
                type="button"
                className="bdBtn bdBtn--secondary"
                onClick={() => this.setState({ showOrderModal: false })}
              >
                Batal
              </button>
              <a
                href={waOrderLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`bdBtn bdBtn--primary ${!this.state.isFormValid ? "bdBtn--disabled" : ""}`}
                onClick={(e) => {
                  if (!this.state.isFormValid) {
                    e.preventDefault();
                    toast.error("Lengkapi semua field yang wajib terlebih dahulu");
                  } else {
                    this.setState({ showOrderModal: false });
                  }
                }}
                aria-disabled={!this.state.isFormValid}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                </svg>
                Kirim ke WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { bouquet, loading, error, detailUrl, similarBouquets = [] } = this.props;

    if (loading) {
      return (
        <section className="bdPage">
          <div className="bdContainer">
            <div className="bdState" aria-live="polite" aria-busy="true">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                <div className="becSpinner" style={{ width: "24px", height: "24px", borderWidth: "3px" }}></div>
                <span>Memuat bouquet…</span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (error || !bouquet) {
      return (
        <section className="bdPage">
          <div className="bdContainer">
            <div className="bdState bdState--error" role="alert" aria-live="assertive">
              <div className="bdState__icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                </svg>
              </div>
              <h2>{error ?? "Bouquet tidak ditemukan."}</h2>
              <p>Coba kembali ke katalog atau periksa tautan yang Anda gunakan.</p>
            </div>

            <Link to="/collection" className="bdBackLink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </section>
      );
    }

    const imageUrl = toAbsoluteUrl(buildImageUrl(bouquet.image));
    const { isAuthenticated } = require("../utils/auth-utils");
    const isAdmin = isAuthenticated();


    return (
      <section className="bdPage" aria-labelledby="bd-title">
        <div className="bdContainer">
          <nav className="bdBreadcrumb" aria-label="Breadcrumb / navigasi jalur">
            <Link to="/" className="bdBreadcrumb__link">
              Beranda
            </Link>
            <span className="bdBreadcrumb__sep">/</span>
            <Link to="/collection" className="bdBreadcrumb__link">
              Katalog
            </Link>
            <span className="bdBreadcrumb__sep">/</span>
            <span className="bdBreadcrumb__current">{bouquet.name}</span>
          </nav>

          {/* New Luxury Layout - Single Column with Sticky Order Section */}
          <div className="bdLayoutNew">
            {/* Main Content Area */}
            <div className="bdMainContent">
              {/* Hero Section - Image + Key Info */}
              <div className="bdHero">
                <div className="bdHero__media">
                  <div className="bdMedia__wrapper">
                    <img
                      src={buildImageUrl(bouquet.image)}
                      alt={bouquet.name}
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      width="600"
                      height="750"
                      style={{ aspectRatio: "4 / 5" }}
                      className="bdMedia__image"
                      onLoad={(e) => {
                        e.currentTarget.classList.add("bdMedia__image--loaded");
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder && placeholder.classList.contains("bdMedia__placeholder")) {
                          setTimeout(() => {
                            placeholder.style.opacity = "0";
                            setTimeout(() => {
                              placeholder.style.display = "none";
                            }, 300);
                          }, 100);
                        }
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                        e.currentTarget.classList.add("bdMedia__image--loaded");
                      }}
                    />
                    <div className="bdMedia__placeholder" aria-hidden="true">
                      <div className="bdMedia__spinner"></div>
                    </div>
                  </div>
                  <span
                    className={`bdBadge ${
                      bouquet.status === "ready" ? "is-ready" : "is-preorder"
                    }`}
                  >
                    {bouquet.status === "ready" ? "Siap" : "Preorder"}
                  </span>
                </div>

                  {/* Title & Favorite */}
                  <div className="bdHero__titleRow">
                    <h1 id="bd-title" className="bdHero__title gradient-text">
                      {formatBouquetName(bouquet.name)}
                    </h1>
                    <button
                      type="button"
                      onClick={this.handleFavoriteToggle}
                      className={`bdHero__favorite ${this.state.isFavorite ? "bdHero__favorite--active" : ""}`}
                      aria-label={this.state.isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                      title={this.state.isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill={this.state.isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Price & Status */}
                  <div className="bdHero__priceRow">
                    <p className="bdHero__price">{formatPrice(bouquet.price)}</p>
                    {bouquet.status && (
                      <span className={`bdHero__status bdHero__status--${bouquet.status}`}>
                        {bouquet.status === "ready" ? "✓ Siap Kirim" : "📅 Preorder"}
                      </span>
                    )}
                  </div>

                  {/* Quick Info Chips - Compact */}
                  <div className="bdHero__chips">
                    {bouquet.size && (
                      <span className="bdHero__chip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {formatBouquetSize(bouquet.size)}
                      </span>
                    )}
                    {bouquet.type && (
                      <span className="bdHero__chip">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {formatBouquetType(bouquet.type)}
                      </span>
                    )}
                    {bouquet.status === "ready" && typeof (bouquet as any).quantity === "number" && (bouquet as any).quantity > 0 && (
                      <span className="bdHero__chip bdHero__chip--stock">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {(bouquet as any).quantity} tersedia
                      </span>
                    )}
                  </div>

                  {/* Social Proof & Urgency - Compact */}
                  <div className="bdHero__indicators">
                    <SocialProof bouquetId={bouquet._id} />
                    {bouquet.status === "ready" && bouquet.quantity !== undefined && bouquet.quantity > 0 && bouquet.quantity <= 5 && (
                      <UrgencyIndicator type="limited-stock" stockCount={bouquet.quantity} />
                    )}
                    {bouquet.status === "preorder" && (
                      <UrgencyIndicator type="preorder" />
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {bouquet.description && (
                <div className="bdDescription">
                  <p className="bdDescription__text">{formatDescription(bouquet.description)}</p>
                </div>
              )}

              {/* Order Action Buttons - Compact */}
              <div className="bdOrderActions">
                <button
                  type="button"
                  className="bdOrderBtn bdOrderBtn--primary btn-luxury"
                  onClick={() => this.setState({ showOrderModal: true })}
                  aria-label="Buka form pemesanan"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Pesan Sekarang</span>
                </button>
                <button
                  type="button"
                  className="bdOrderBtn bdOrderBtn--secondary"
                  onClick={() => this.setState({ showQuickOrderModal: true })}
                  aria-label="Order langsung lewat WhatsApp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                  </svg>
                  <span>Order Langsung</span>
                </button>
              </div>

              {/* Details Section - Collapsible for Efficiency */}
              <div className="bdDetailsSection">
                <button
                  type="button"
                  className="bdDetailsSection__toggle"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  aria-expanded={this.state.showDetails}
                  aria-controls="bd-details-content"
                >
                  <h2 className="bdDetailsSection__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Detail Produk
                  </h2>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`bdDetailsSection__icon ${this.state.showDetails ? "bdDetailsSection__icon--open" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                <div 
                  id="bd-details-content" 
                  className="bdDetailsSection__content"
                  aria-expanded={this.state.showDetails}
                >
                    {/* Additional Info Chips */}
                    {(bouquet.collectionName || bouquet.isNewEdition || bouquet.isFeatured) && (
                      <div className="bdDetailsSection__chips">
                        {bouquet.collectionName && (
                          <span className="bdDetailsSection__chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {formatCollectionName(bouquet.collectionName)}
                          </span>
                        )}
                        {bouquet.isNewEdition && (
                          <span className="bdDetailsSection__chip bdDetailsSection__chip--new">✨ Edisi Baru</span>
                        )}
                        {bouquet.isFeatured && (
                          <span className="bdDetailsSection__chip bdDetailsSection__chip--featured">⭐ Featured</span>
                        )}
                      </div>
                    )}

                    {/* Details List */}
                    <dl className="bdDetailsSection__list">
                      {Array.isArray((bouquet as any).occasions) &&
                        (bouquet as any).occasions.length > 0 && (
                          <div className="bdDetailsSection__item">
                            <dt className="bdDetailsSection__term">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Acara
                            </dt>
                            <dd className="bdDetailsSection__desc">{(bouquet as any).occasions.map(formatOccasion).join(", ")}</dd>
                          </div>
                        )}

                      {Array.isArray((bouquet as any).flowers) &&
                        (bouquet as any).flowers.length > 0 && (
                          <div className="bdDetailsSection__item">
                            <dt className="bdDetailsSection__term">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Bunga
                            </dt>
                            <dd className="bdDetailsSection__desc">{(bouquet as any).flowers.map(formatFlowerName).join(", ")}</dd>
                          </div>
                        )}
                    </dl>

                    {/* Care Instructions */}
                    {typeof (bouquet as any).careInstructions === "string" &&
                      (bouquet as any).careInstructions.trim() && (
                        <div className="bdDetailsSection__care">
                          <h3 className="bdDetailsSection__careTitle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Tips Perawatan
                          </h3>
                          <p className="bdDetailsSection__careText">{(bouquet as any).careInstructions.trim()}</p>
                        </div>
                      )}

                    {/* Service Info - Compact */}
                    <div className="bdDetailsSection__services">
                      <button
                        type="button"
                        className="bdDetailsSection__service bdServiceInfoBtn"
                        onClick={() => this.setState({ showServiceInfo: true })}
                        aria-label="Info layanan pengiriman"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <strong>Pengiriman</strong>
                          <span>Area Cirebon & sekitarnya</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="bdDetailsSection__service bdServiceInfoBtn"
                        onClick={() => this.setState({ showServiceInfo: true })}
                        aria-label="Info layanan pembayaran"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <strong>Pembayaran</strong>
                          <span>Transfer Bank • E-Wallet • COD</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="bdDetailsSection__service bdServiceInfoBtn"
                        onClick={() => this.setState({ showServiceInfo: true })}
                        aria-label="Info layanan garansi"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <strong>Garansi</strong>
                          <span>Kualitas terjamin • 100% uang kembali</span>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
              </div>

            </div>

            {/* Sticky Order Summary Sidebar - Desktop Only */}
            <div className="bdOrderSidebar">
              {/* Order Summary - Always Visible with Useful Info */}
              <div className="bdOrderSidebar__summary" aria-label="Ringkasan pesanan">
                <div className="bdOrderSidebar__header">
                  <h3 className="bdOrderSidebar__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {this.state.isFormValid ? "Ringkasan" : "Info Cepat"}
                  </h3>
                  {this.state.isFormValid && (
                    <button
                      type="button"
                      className="bdOrderSidebar__copy"
                      onClick={this.copyOrderDetails}
                      aria-label="Salin detail pesanan"
                      title="Salin detail pesanan"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 19h9a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
                <div className="bdOrderSidebar__content">
                  {this.state.isFormValid ? (
                    <>
                      <div className="bdOrderSidebar__item">
                        <span className="bdOrderSidebar__label">Bouquet</span>
                        <span className="bdOrderSidebar__value">{formatBouquetName(bouquet.name)}</span>
                      </div>
                      <div className="bdOrderSidebar__item">
                        <span className="bdOrderSidebar__label">Jumlah</span>
                        <span className="bdOrderSidebar__value">{this.state.quantity} pcs</span>
                      </div>
                      
                      {/* Price Breakdown */}
                      {(() => {
                        const breakdown = this.calculatePriceBreakdown();
                        const bulkDiscount = calculateBulkDiscount(bouquet.price, this.state.quantity);
                        return (
                          <>
                            <div className="bdOrderSidebar__item bdOrderSidebar__item--breakdown">
                              <span className="bdOrderSidebar__label">Subtotal</span>
                              <span className="bdOrderSidebar__value">{formatPrice(breakdown.subtotal)}</span>
                            </div>
                            {breakdown.discount > 0 && (
                              <div className="bdOrderSidebar__item bdOrderSidebar__item--discount">
                                <span className="bdOrderSidebar__label">
                                  Diskon ({bulkDiscount.discountPercentage}%)
                                </span>
                                <span className="bdOrderSidebar__value bdOrderSidebar__value--discount">
                                  -{formatPrice(breakdown.discount)}
                                </span>
                              </div>
                            )}
                            {this.state.deliveryType === "delivery" && (
                              <div className="bdOrderSidebar__item bdOrderSidebar__item--breakdown">
                                <span className="bdOrderSidebar__label">Ongkir</span>
                                <span className="bdOrderSidebar__value">
                                  Akan dihitung setelah konfirmasi
                                </span>
                              </div>
                            )}
                            <div className="bdOrderSidebar__item bdOrderSidebar__item--total">
                              <span className="bdOrderSidebar__label">Total</span>
                              <span className="bdOrderSidebar__value bdOrderSidebar__value--total">
                                {formatPrice(breakdown.total)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                      
                      {/* Delivery Time Estimate */}
                      {this.state.deliveryDate && this.calculateDeliveryTime() && (
                        <div className="bdOrderSidebar__deliveryTime">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <span>{this.calculateDeliveryTime()}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bdOrderSidebar__quickInfo">
                      <div className="bdOrderSidebar__quickInfoItem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <span className="bdOrderSidebar__quickInfoLabel">Harga</span>
                          <span className="bdOrderSidebar__quickInfoValue">{formatPrice(bouquet.price)}</span>
                        </div>
                      </div>
                      <div className="bdOrderSidebar__quickInfoItem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <span className="bdOrderSidebar__quickInfoLabel">Status</span>
                          <span className="bdOrderSidebar__quickInfoValue">{bouquet.status === "ready" ? "✓ Siap Kirim" : "📅 Preorder"}</span>
                        </div>
                      </div>
                      <div className="bdOrderSidebar__quickInfoItem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <span className="bdOrderSidebar__quickInfoLabel">Progress</span>
                          <span className="bdOrderSidebar__quickInfoValue">{Math.round(this.calculateFormProgress())}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          {/* Similar Bouquets Section */}
          {similarBouquets.length > 0 && (
            <div className="bdSimilar reveal-on-scroll" style={{ opacity: 1, visibility: 'visible' }} aria-label="Bouquet serupa">
              <h2 className="bdSimilar__title">Bouquet Serupa</h2>
              <div className="bdSimilar__grid">
                {similarBouquets.slice(0, 4).map((b) => (
                  <Link
                    key={b._id}
                    to={`/bouquet/${b._id}`}
                    className="bdSimilar__card"
                    aria-label={`Lihat detail ${b.name}`}
                  >
                    <div className="bdSimilar__media">
                      <img
                        src={buildImageUrl(b.image)}
                        alt={b.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <span
                        className={`bdSimilar__badge ${
                          b.status === "ready" ? "is-ready" : "is-preorder"
                        }`}
                      >
                        {b.status === "ready" ? "Siap" : "Preorder"}
                      </span>
                    </div>
                    <div className="bdSimilar__body">
                      <h3 className="bdSimilar__name">{b.name}</h3>
                      <p className="bdSimilar__price">{formatPrice(b.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Admin Links - Only visible to admins, minimal design */}
          {isAdmin && (
            <div className="bdAdminLinks" aria-label="Tautan admin">
                  <button
                    type="button"
                    className="bdAdminLink"
                    onClick={() => this.copyToClipboard(detailUrl)}
                    aria-label="Salin tautan bouquet"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Salin tautan</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      className="bdAdminLink"
                      onClick={() => this.copyToClipboard(imageUrl)}
                      aria-label="Salin tautan gambar"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Salin gambar</span>
                    </button>
                  )}
                </div>
              )}

          {/* Order Form Modal */}
          {this.renderOrderModal()}
          
          {/* Quick Order Modal */}
          {this.renderQuickOrderModal()}
          
          {/* Service Info Popup */}
          {this.renderServiceInfoPopup()}
        </div>
      </section>
    );
  }

  private renderQuickOrderModal(): React.ReactNode {
    const { bouquet, detailUrl } = this.props;
    if (!bouquet || !this.state.showQuickOrderModal) return null;

    const quickOrderType = this.state.quickOrderData.recipientName ? "delivery" : "pickup";
    
    const buildQuickOrderMessage = () => {
      const lines = [
        `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan:`,
        ``,
        `Nama: ${formatBouquetName(bouquet.name)}`,
        `Harga: ${formatPrice(bouquet.price)}`,
        `Jumlah: 1`,
        ``,
        `📦 ${quickOrderType === "delivery" ? "Dikirim" : "Ambil di Toko"}`,
      ];
      
      if (quickOrderType === "delivery") {
        if (this.state.quickOrderData.recipientName) {
          lines.push(`👤 Penerima: ${this.state.quickOrderData.recipientName}`);
        }
        if (this.state.quickOrderData.recipientPhone) {
          lines.push(`📱 No. HP Penerima: ${this.state.quickOrderData.recipientPhone}`);
        }
        if (this.state.address) {
          lines.push(`📍 Alamat: ${this.state.address}`);
        }
        if (this.state.deliveryDate) {
          lines.push(`📅 Tanggal: ${this.state.deliveryDate}`);
        }
        if (this.state.deliveryTimeSlot) {
          lines.push(`⏰ Waktu: ${this.state.deliveryTimeSlot}`);
        }
        if (this.state.greetingCard) {
          lines.push(`💌 Kartu Ucapan: ${this.state.greetingCard}`);
        }
      } else {
        if (this.state.deliveryDate) {
          lines.push(`📅 Tanggal: ${this.state.deliveryDate}`);
        }
        if (this.state.deliveryTimeSlot) {
          lines.push(`⏰ Jam: ${this.state.deliveryTimeSlot}`);
        }
      }
      
      lines.push(``, `Link: ${detailUrl}`);
      return lines.filter(Boolean).join("\n");
    };

    const waLink = buildWhatsAppLink(buildQuickOrderMessage());

    return (
      <div
        className="bdOrderModalOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            this.setState({ showQuickOrderModal: false });
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-quick-order-modal-title"
      >
        <div className="bdOrderModal bdOrderModal--quick">
          <div className="bdOrderModal__header">
            <h2 id="bd-quick-order-modal-title" className="bdOrderModal__title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
              </svg>
              Order Langsung
            </h2>
            <button
              type="button"
              className="bdOrderModal__close"
              onClick={() => this.setState({ showQuickOrderModal: false })}
              aria-label="Tutup"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="bdOrderModal__content">
            <div className="bdFormGroup">
              <label className="bdFormLabel">Tipe Pengiriman</label>
              <div className="bdFormRadioGroup">
                <label className="bdFormRadio">
                  <input
                    type="radio"
                    name="quickOrderType"
                    value="delivery"
                    checked={quickOrderType === "delivery"}
                    onChange={() => this.setState({ quickOrderData: { recipientName: "", recipientPhone: "" } })}
                  />
                  <span className="bdFormRadio__label">Dikirim</span>
                </label>
                <label className="bdFormRadio">
                  <input
                    type="radio"
                    name="quickOrderType"
                    value="pickup"
                    checked={quickOrderType === "pickup"}
                    onChange={() => this.setState({ quickOrderData: {} })}
                  />
                  <span className="bdFormRadio__label">Ambil di Toko</span>
                </label>
              </div>
            </div>

            {quickOrderType === "delivery" ? (
              <>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Nama Penerima (Opsional)</label>
                  <input
                    type="text"
                    className="bdFormInput"
                    value={this.state.quickOrderData.recipientName || ""}
                    onChange={(e) => this.setState({ quickOrderData: { ...this.state.quickOrderData, recipientName: e.target.value } })}
                    placeholder="Nama penerima"
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">No. HP Penerima (Opsional)</label>
                  <input
                    type="tel"
                    className="bdFormInput"
                    value={this.state.quickOrderData.recipientPhone || ""}
                    onChange={(e) => this.setState({ quickOrderData: { ...this.state.quickOrderData, recipientPhone: e.target.value } })}
                    placeholder="08xx xxxx xxxx"
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Alamat (Opsional)</label>
                  <textarea
                    className="bdFormInput"
                    rows={3}
                    value={this.state.address}
                    onChange={this.handleAddressChange}
                    placeholder="Alamat lengkap"
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Tanggal Pengiriman (Opsional)</label>
                  <input
                    type="date"
                    className="bdFormInput"
                    value={this.state.deliveryDate}
                    min={this.getDefaultDate()}
                    onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Waktu Pengiriman (Opsional)</label>
                  <input
                    type="time"
                    className="bdFormInput"
                    value={this.state.deliveryTimeSlot || ""}
                    onChange={(e) => this.handleFormChange("deliveryTimeSlot", e.target.value)}
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Kartu Ucapan (Opsional)</label>
                  <textarea
                    className="bdFormInput"
                    rows={2}
                    value={this.state.greetingCard}
                    onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
                    placeholder="Pesan untuk kartu ucapan"
                    maxLength={200}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Tanggal Pengambilan (Opsional)</label>
                  <input
                    type="date"
                    className="bdFormInput"
                    value={this.state.deliveryDate}
                    min={this.getDefaultDate()}
                    onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
                  />
                </div>
                <div className="bdFormGroup">
                  <label className="bdFormLabel">Jam Pengambilan (Opsional)</label>
                  <input
                    type="time"
                    className="bdFormInput"
                    value={this.state.deliveryTimeSlot || ""}
                    onChange={(e) => this.handleFormChange("deliveryTimeSlot", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="bdOrderModal__footer">
            <button
              type="button"
              className="bdBtn bdBtn--secondary"
              onClick={() => this.setState({ showQuickOrderModal: false })}
            >
              Batal
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bdBtn bdBtn--primary"
              onClick={() => this.setState({ showQuickOrderModal: false })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
              </svg>
              Kirim ke WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  private renderServiceInfoPopup(): React.ReactNode {
    if (!this.state.showServiceInfo) return null;

    return (
      <div
        className="bdOrderModalOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            this.setState({ showServiceInfo: false });
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bd-service-info-title"
      >
        <div className="bdOrderModal bdOrderModal--info">
          <div className="bdOrderModal__header">
            <h2 id="bd-service-info-title" className="bdOrderModal__title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Informasi Layanan
            </h2>
            <button
              type="button"
              className="bdOrderModal__close"
              onClick={() => this.setState({ showServiceInfo: false })}
              aria-label="Tutup"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="bdOrderModal__content">
            <div className="bdServiceInfo">
              <div className="bdServiceInfo__item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong>Pengiriman</strong>
                  <p>Area Cirebon & sekitarnya. Pengiriman dilakukan dengan hati-hati untuk menjaga kualitas bouquet.</p>
                </div>
              </div>
              <div className="bdServiceInfo__item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong>Pembayaran</strong>
                  <p>Transfer Bank, E-Wallet (OVO, DANA, GoPay), atau Cash on Delivery (COD) untuk area tertentu.</p>
                </div>
              </div>
              <div className="bdServiceInfo__item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <strong>Garansi</strong>
                  <p>Kualitas terjamin. Jika tidak sesuai ekspektasi, kami siap mengganti atau mengembalikan uang 100%.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bdOrderModal__footer">
            <button
              type="button"
              className="bdBtn bdBtn--primary"
              onClick={() => this.setState({ showServiceInfo: false })}
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default BouquetDetailPage;

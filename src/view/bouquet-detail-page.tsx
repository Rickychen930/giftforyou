import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { observeFadeIn, revealOnScroll, createRipple } from "../utils/luxury-enhancements";
import { formatBouquetName, formatBouquetType, formatBouquetSize, formatCollectionName, formatOccasion, formatFlowerName, formatDescription, formatTag } from "../utils/text-formatter";
import { generateBouquetPDF } from "../utils/pdf-generator";
import AddressAutocomplete from "../components/AddressAutocomplete";
import SocialProof from "../components/SocialProof";
import UrgencyIndicator from "../components/UrgencyIndicator";
import { calculateDeliveryPrice, type DeliveryPriceResult } from "../utils/delivery-calculator";
import { calculateBulkDiscount, getBulkDiscountMessage } from "../utils/bulk-discount";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { addToRecentlyViewed } from "../utils/recently-viewed";
import { toast } from "../utils/toast";
import DeliveryTimeSlot from "../components/DeliveryTimeSlot";

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

const getTimeSlotLabel = (slotId?: string): string => {
  if (!slotId) return "";
  const labels: Record<string, string> = {
    morning: "Pagi (09:00-12:00)",
    afternoon: "Siang (12:00-15:00)",
    evening: "Sore (15:00-18:00)",
  };
  return labels[slotId] || slotId;
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
      ? `📅 Tanggal pengiriman: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengiriman: ${getTimeSlotLabel(formData.deliveryTimeSlot)}` : ""}`
      : formData.deliveryType === "pickup" && formData.deliveryDate
        ? `📅 Tanggal pengambilan: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengambilan: ${getTimeSlotLabel(formData.deliveryTimeSlot)}` : ""}`
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

// Quick order message - minimal info for instant ordering
const buildQuickOrderMessage = (
  b: Bouquet,
  detailUrl: string
) => {
  const lines = [
    `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan:`,
    ``,
    `✨ ${b.name}`,
    `💰 Harga: ${formatPrice(b.price)}`,
    b.status ? `📦 Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    ``,
    `Mohon info lebih lanjut mengenai:`,
    `• Jumlah yang diinginkan`,
    `• Tipe pengiriman (diantar/ambil di toko)`,
    `• Tanggal pengiriman/pengambilan`,
    `• Alamat (jika diantar)`,
    ``,
    detailUrl ? `🔗 Detail: ${detailUrl}` : "",
  ].filter(Boolean);

  return lines.join("\n");
};

// Download PDF Button Component for Bouquet
const BouquetDownloadPDFButton: React.FC<{ bouquet: Bouquet }> = ({ bouquet }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);

  const handleDownload = async (withWatermark: boolean) => {
    setIsGenerating(true);
    setShowOptions(false);

    try {
      // Add timeout protection (30 seconds for single bouquet PDF)
      const pdfPromise = generateBouquetPDF(
        {
          _id: bouquet._id,
          name: bouquet.name,
          price: bouquet.price,
          image: bouquet.image,
          description: bouquet.description,
          type: bouquet.type,
          size: bouquet.size,
          status: bouquet.status,
          isFeatured: bouquet.isFeatured,
          isNewEdition: bouquet.isNewEdition,
          occasions: Array.isArray(bouquet.occasions) ? bouquet.occasions : [],
          flowers: Array.isArray(bouquet.flowers) ? bouquet.flowers : [],
        },
        { withWatermark }
      );
      
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error("PDF generation timeout. Silakan coba lagi.")), 30000);
      });

      await Promise.race([pdfPromise, timeoutPromise]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to generate PDF:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Gagal menghasilkan PDF. Silakan coba lagi.";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={isGenerating}
        aria-label="Download PDF"
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid rgba(212, 140, 156, 0.3)",
          background: "linear-gradient(135deg, rgba(212, 140, 156, 0.1) 0%, rgba(168, 213, 186, 0.1) 100%)",
          color: "var(--ink-800)",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isGenerating ? "Generating..." : "Download PDF"}
      </button>

      {showOptions && (
        <>
          {/* Backdrop overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
            onClick={() => setShowOptions(false)}
          />
          {/* Modal content */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)",
              border: "2px solid rgba(212, 140, 156, 0.3)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25), 0 12px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.9) inset",
              zIndex: 10001,
              display: "flex",
              flexDirection: "column",
              minWidth: "240px",
              maxWidth: "90vw",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              overflow: "hidden",
              isolation: "isolate",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                handleDownload(false);
                setShowOptions(false);
              }}
              disabled={isGenerating}
              style={{
                padding: "0.85rem 1.25rem",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--ink-800)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.08) 100%)";
                e.currentTarget.style.color = "var(--brand-rose-700)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink-800)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tanpa Watermark
            </button>
            <button
              type="button"
              onClick={() => {
                handleDownload(true);
                setShowOptions(false);
              }}
              disabled={isGenerating}
              style={{
                padding: "0.85rem 1.25rem",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "var(--ink-800)",
                borderTop: "1px solid rgba(212, 140, 156, 0.15)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 140, 156, 0.12) 0%, rgba(168, 213, 186, 0.08) 100%)";
                e.currentTarget.style.color = "var(--brand-rose-700)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink-800)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dengan Watermark
            </button>
          </div>
        </>
      )}
    </div>
  );
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
  activeTab: "overview" | "order";
  formErrors: Partial<Record<keyof OrderFormState, string>>;
  showPreview: boolean;
  isFormValid: boolean;
  deliveryLocation?: { lat: number; lng: number };
  deliveryPriceResult?: DeliveryPriceResult;
  isFavorite: boolean;
}

class BouquetDetailPage extends Component<Props, BouquetDetailState> {
  private formStorageKey = "bouquet_order_form_data";

  state: BouquetDetailState = {
    deliveryType: "delivery",
    deliveryDate: this.getDefaultDate(),
    deliveryTimeSlot: undefined,
    address: "",
    greetingCard: "",
    quantity: 1,
    activeTab: "overview",
    formErrors: {},
    showPreview: false,
    isFormValid: false,
    isFavorite: false,
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

    return Math.round((completed / total) * 100);
  }

  private calculateDeliveryTime(): string {
    if (!this.state.deliveryDate) return "";
    
    const selectedDate = new Date(this.state.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return "Same-day delivery (jika order sebelum 14:00)";
    } else if (diffDays === 2) {
      return "Next-day delivery";
    } else if (diffDays > 2 && diffDays <= 7) {
      return `${diffDays - 1} hari lagi`;
    } else if (diffDays > 7) {
      return `${diffDays - 1} hari lagi (Pre-order)`;
    }
    
    return "";
  }

  private calculatePriceBreakdown(): { subtotal: number; delivery: number; discount: number; total: number } {
    const { bouquet } = this.props;
    if (!bouquet) return { subtotal: 0, delivery: 0, discount: 0, total: 0 };
    
    // Calculate bulk discount
    const bulkDiscount = calculateBulkDiscount(bouquet.price, this.state.quantity);
    const subtotal = bulkDiscount.originalPrice;
    const discount = bulkDiscount.discountAmount;
    
    // Calculate delivery price
    const delivery = this.state.deliveryType === "delivery" && this.state.deliveryPriceResult
      ? this.state.deliveryPriceResult.price
      : 0;
    
    const total = bulkDiscount.finalPrice + delivery;
    
    return { subtotal, delivery, discount, total };
  }

  private getSmartSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.state.deliveryType === "delivery" && !this.state.address) {
      suggestions.push("💡 Masukkan alamat lengkap untuk estimasi ongkir yang akurat");
    }
    
    if (this.state.quantity > 5) {
      suggestions.push("💡 Order banyak? Hubungi kami untuk diskon khusus!");
    }
    
    if (this.state.deliveryDate) {
      const selectedDate = new Date(this.state.deliveryDate);
      const today = new Date();
      const diffDays = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        suggestions.push("⚡ Same-day delivery tersedia untuk order sebelum 14:00");
      } else if (diffDays > 7) {
        suggestions.push("📅 Pre-order memungkinkan customisasi lebih detail");
      }
    }
    
    if (!this.state.greetingCard) {
      suggestions.push("💌 Tambahkan kartu ucapan untuk membuat hadiah lebih personal");
    }
    
    return suggestions;
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
    this.applySeo();
    this.loadSavedFormData();
    
    // Check favorite status and track recently viewed
    const { bouquet } = this.props;
    if (bouquet) {
      this.setState({ isFavorite: isFavorite(bouquet._id) });
      // Track recently viewed
      addToRecentlyViewed(
        bouquet._id,
        bouquet.name,
        bouquet.price,
        bouquet.image
      );
    }
    
    // Validate form after loading saved data
    setTimeout(() => {
      const validation = this.validateForm();
      this.setState({
        formErrors: validation.errors,
        isFormValid: validation.isValid,
      });
    }, 100);
    
    // Initialize luxury enhancements - ensure elements are visible
    setTimeout(() => {
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
    }, 50);
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.bouquet !== this.props.bouquet ||
      prevProps.detailUrl !== this.props.detailUrl ||
      prevProps.error !== this.props.error
    ) {
      this.applySeo();
      
      // Re-initialize luxury enhancements on update
      setTimeout(() => {
        observeFadeIn(".fade-in");
        revealOnScroll();
      }, 100);
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
      
      // Auto-save form data
      setTimeout(() => {
        this.saveFormData();
      }, 300);
      
      // Validate form in real-time
      const validation = this.validateForm();
      
      return {
        ...newState,
        formErrors: validation.errors,
        isFormValid: validation.isValid,
      };
    });
  };

  private handleAddressChange = (address: string, placeDetails?: {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }): void => {
    this.handleFormChange("address", address);
    
    // If place details have coordinates, calculate delivery price
    if (placeDetails?.geometry?.location) {
      const lat = placeDetails.geometry.location.lat();
      const lng = placeDetails.geometry.location.lng();
      this.handleLocationChange(lat, lng);
    }
  };

  private handleLocationChange = (lat: number, lng: number): void => {
    const deliveryPriceResult = calculateDeliveryPrice(lat, lng);
    this.setState({
      deliveryLocation: { lat, lng },
      deliveryPriceResult,
    });
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

    const { isAuthenticated } = require("../utils/auth-utils");
    const isAdmin = isAuthenticated();
    const imageUrl = toAbsoluteUrl(buildImageUrl(bouquet.image));

    const waCustomer = buildWhatsAppLink(
      buildCustomerOrderMessage(bouquet, this.props.detailUrl, this.state)
    );

    // Quick order link - instant order without filling form
    const waQuickOrder = buildWhatsAppLink(
      buildQuickOrderMessage(bouquet, this.props.detailUrl)
    );

    // Get tomorrow's date as default min date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

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

          <div className="bdLayout">
            <div className="bdMedia reveal-on-scroll" style={{ opacity: 1, visibility: 'visible' }}>
              <img
                src={buildImageUrl(bouquet.image)}
                alt={bouquet.name}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="600"
                height="750"
                style={{ aspectRatio: "4 / 5" }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />

              <span
                className={`bdBadge ${
                  bouquet.status === "ready" ? "is-ready" : "is-preorder"
                }`}
              >
                {bouquet.status === "ready" ? "Siap" : "Preorder"}
              </span>
            </div>

            <div className="bdInfo reveal-on-scroll">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <h1 id="bd-title" className="bdTitle gradient-text" style={{ margin: 0, flex: 1 }}>
                      {formatBouquetName(bouquet.name)}
                    </h1>
                    <button
                      type="button"
                      onClick={this.handleFavoriteToggle}
                      className={`bdFavoriteBtn ${this.state.isFavorite ? "bdFavoriteBtn--active" : ""}`}
                      aria-label={this.state.isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                      title={this.state.isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill={this.state.isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <p className="bdPrice">{formatPrice(bouquet.price)}</p>
                  <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <SocialProof bouquetId={bouquet._id} />
                    {bouquet.quantity !== undefined && bouquet.quantity > 0 && bouquet.quantity <= 5 && (
                      <UrgencyIndicator type="limited-stock" stockCount={bouquet.quantity} />
                    )}
                    {this.state.deliveryDate && (() => {
                      const selectedDate = new Date(this.state.deliveryDate);
                      const today = new Date();
                      const diffDays = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      if (diffDays === 1) {
                        return <UrgencyIndicator type="same-day" deadlineTime="14:00" />;
                      }
                      return null;
                    })()}
                    {bouquet.status === "preorder" && (
                      <UrgencyIndicator type="preorder" />
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <BouquetDownloadPDFButton bouquet={bouquet} />
                )}
              </div>

              {bouquet.description && (
                <p className="bdDesc">{formatDescription(bouquet.description)}</p>
              )}

              {/* Tab Navigation */}
              <div className="bdTabs" role="tablist" aria-label="Detail bouquet tabs">
                <button
                  type="button"
                  role="tab"
                  aria-selected={this.state.activeTab === "overview"}
                  aria-controls="bd-tabpanel-overview"
                  id="bd-tab-overview"
                  className={`bdTab ${this.state.activeTab === "overview" ? "bdTab--active" : ""}`}
                  onClick={() => this.setState({ activeTab: "overview" })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Overview</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={this.state.activeTab === "order"}
                  aria-controls="bd-tabpanel-order"
                  id="bd-tab-order"
                  className={`bdTab ${this.state.activeTab === "order" ? "bdTab--active" : ""}`}
                  onClick={() => this.setState({ activeTab: "order" })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Pesan</span>
                </button>
              </div>

              {/* Tab Panel: Overview */}
              {this.state.activeTab === "overview" && (
                <div
                  role="tabpanel"
                  id="bd-tabpanel-overview"
                  aria-labelledby="bd-tab-overview"
                  className="bdTabPanel"
                >
              <div className="bdMeta" aria-label="Ringkasan bouquet">
                {bouquet.size && <span className="bdChip">Ukuran: {formatBouquetSize(bouquet.size)}</span>}
                {bouquet.type && <span className="bdChip">Tipe: {formatBouquetType(bouquet.type)}</span>}
                {bouquet.collectionName && (
                  <span className="bdChip">Koleksi: {formatCollectionName(bouquet.collectionName)}</span>
                )}
                {bouquet.isNewEdition && (
                  <span className="bdChip bdChip--new">Edisi Baru</span>
                )}
                {bouquet.isFeatured && (
                  <span className="bdChip bdChip--featured">Featured</span>
                )}
              </div>

              {/* Stock & Tags - Compact */}
              <div className="bdMetaSecondary">
                {typeof (bouquet as any).quantity === "number" && (
                  <div className="bdStockCompact" aria-label="Ketersediaan stok">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {(bouquet as any).quantity > 0 ? (
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                    <span>
                      {(bouquet as any).quantity > 0 
                        ? `${(bouquet as any).quantity} tersedia` 
                        : "Stok habis"}
                    </span>
                  </div>
                )}
                {Array.isArray((bouquet as any).customPenanda) && (bouquet as any).customPenanda.length > 0 && (
                  <div className="bdPenandaCompact" aria-label="Tag kustom">
                    {(bouquet as any).customPenanda.map((tag: string, idx: number) => (
                      <span key={idx} className="bdPenandaCompact__tag">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bdDetails" aria-label="Rincian bouquet">
                <h2 className="bdSectionTitle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Rincian
                </h2>
                <dl className="bdDl">
                  {Array.isArray((bouquet as any).occasions) &&
                    (bouquet as any).occasions.length > 0 && (
                      <>
                        <dt>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Acara
                        </dt>
                        <dd>{(bouquet as any).occasions.map(formatOccasion).join(", ")}</dd>
                      </>
                    )}

                  {Array.isArray((bouquet as any).flowers) &&
                    (bouquet as any).flowers.length > 0 && (
                      <>
                        <dt>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Bunga
                        </dt>
                        <dd>{(bouquet as any).flowers.map(formatFlowerName).join(", ")}</dd>
                      </>
                    )}
                </dl>
              </div>

              {/* Care Instructions */}
              {typeof (bouquet as any).careInstructions === "string" &&
                (bouquet as any).careInstructions.trim() && (
                  <div className="bdCare" aria-label="Instruksi perawatan">
                    <h2 className="bdSectionTitle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Tips Perawatan
                    </h2>
                    <p className="bdCare__text">{(bouquet as any).careInstructions.trim()}</p>
                  </div>
                )}

              {/* Service Info - Consolidated */}
              <div className="bdService" aria-label="Informasi layanan">
                <h2 className="bdSectionTitle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Layanan & Informasi
                </h2>
                <div className="bdService__grid">
                  <div className="bdService__item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Pengiriman</strong>
                      <span>Area Cirebon & sekitarnya • Same-day delivery tersedia</span>
                    </div>
                  </div>
                  <div className="bdService__item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Pembayaran</strong>
                      <span>Transfer Bank • E-Wallet • COD (area tertentu)</span>
                    </div>
                  </div>
                  <div className="bdService__item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div>
                      <strong>Garansi</strong>
                      <span>Kualitas terjamin • 100% uang kembali jika tidak puas</span>
                    </div>
                  </div>
                </div>
              </div>

                </div>
              )}

              {/* Tab Panel: Order */}
              {this.state.activeTab === "order" && (
                <div
                  role="tabpanel"
                  id="bd-tabpanel-order"
                  aria-labelledby="bd-tab-order"
                  className="bdTabPanel"
                >
              {/* Quick Order Button - Instant order without form */}
              <div className="bdQuickOrder" aria-label="Order langsung">
                <a
                  className="bdBtn bdBtn--quickOrder btn-luxury"
                  href={waQuickOrder}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Order langsung lewat WhatsApp tanpa isi form"
                  onClick={(e) => createRipple(e)}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                  </svg>
                  <span>Order Langsung</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ marginLeft: 'auto' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <p className="bdQuickOrderHint">
                  Klik untuk langsung chat WhatsApp tanpa isi form. Detail bisa dibahas langsung.
                </p>
              </div>

              {/* Smart Suggestions */}
              {this.getSmartSuggestions().length > 0 && (
                <div className="bdSmartSuggestions" aria-label="Saran">
                  <h3 className="bdSmartSuggestions__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                    </svg>
                    Tips & Saran
                  </h3>
                  <ul className="bdSmartSuggestions__list">
                    {this.getSmartSuggestions().map((suggestion, idx) => (
                      <li key={idx} className="bdSmartSuggestions__item">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Order Summary - Sticky Summary */}
              {this.state.isFormValid && (
                <div className="bdOrderSummary" aria-label="Ringkasan pesanan">
                  <div className="bdOrderSummary__header">
                    <h3 className="bdOrderSummary__title">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ringkasan Pesanan
                    </h3>
                    <button
                      type="button"
                      className="bdCopyOrderBtn"
                      onClick={this.copyOrderDetails}
                      aria-label="Salin detail pesanan"
                      title="Salin detail pesanan"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 19h9a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="bdOrderSummary__content">
                    <div className="bdOrderSummary__item">
                      <span className="bdOrderSummary__label">Bouquet</span>
                      <span className="bdOrderSummary__value">{formatBouquetName(bouquet.name)}</span>
                    </div>
                    <div className="bdOrderSummary__item">
                      <span className="bdOrderSummary__label">Jumlah</span>
                      <span className="bdOrderSummary__value">{this.state.quantity} pcs</span>
                    </div>
                    
                    {/* Price Breakdown */}
                    {(() => {
                      const breakdown = this.calculatePriceBreakdown();
                      const bulkDiscount = calculateBulkDiscount(bouquet.price, this.state.quantity);
                      const discountMessage = getBulkDiscountMessage(this.state.quantity);
                      return (
                        <>
                          <div className="bdOrderSummary__item bdOrderSummary__item--breakdown">
                            <span className="bdOrderSummary__label">Subtotal</span>
                            <span className="bdOrderSummary__value">{formatPrice(breakdown.subtotal)}</span>
                          </div>
                          {breakdown.discount > 0 && (
                            <div className="bdOrderSummary__item bdOrderSummary__item--discount">
                              <span className="bdOrderSummary__label">
                                Diskon ({bulkDiscount.discountPercentage}%)
                              </span>
                              <span className="bdOrderSummary__value bdOrderSummary__value--discount">
                                -{formatPrice(breakdown.discount)}
                              </span>
                            </div>
                          )}
                          {discountMessage && breakdown.discount === 0 && (
                            <div className="bdOrderSummary__hint">
                              {discountMessage}
                            </div>
                          )}
                          {this.state.deliveryType === "delivery" && (
                            <div className="bdOrderSummary__item bdOrderSummary__item--breakdown">
                              <span className="bdOrderSummary__label">Ongkir</span>
                              <span className="bdOrderSummary__value">
                                {breakdown.delivery > 0 ? formatPrice(breakdown.delivery) : "Akan dihitung"}
                              </span>
                            </div>
                          )}
                          <div className="bdOrderSummary__item bdOrderSummary__item--total">
                            <span className="bdOrderSummary__label">Total</span>
                            <span className="bdOrderSummary__value bdOrderSummary__value--total">
                              {formatPrice(breakdown.total)}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                    
                    {/* Delivery Time Estimate */}
                    {this.state.deliveryDate && this.calculateDeliveryTime() && (
                      <div className="bdOrderSummary__deliveryTime">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{this.calculateDeliveryTime()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Form */}
              <div className="bdOrderForm" aria-label="Form pemesanan">
                <div className="bdOrderForm__header">
                  <h2 className="bdSectionTitle">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Form Pemesanan Detail
                  </h2>
                  
                  {/* Progress Indicator */}
                  <div className="bdOrderForm__progress" aria-label="Progress form">
                    <div className="bdOrderForm__progressBar">
                      <div 
                        className="bdOrderForm__progressFill"
                        style={{ 
                          width: `${this.calculateFormProgress()}%`,
                          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                      />
                    </div>
                    <span className="bdOrderForm__progressText">
                      {this.calculateFormProgress()}% Lengkap
                    </span>
                  </div>
                </div>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">
                    Jumlah
                    <span className="bdFormLabel__required" aria-label="Wajib diisi">*</span>
                  </label>
                  <div className="bdFormInputWrapper">
                    <button
                      type="button"
                      className="bdFormQuantityBtn"
                      onClick={() => this.handleFormChange("quantity", Math.max(1, this.state.quantity - 1))}
                      aria-label="Kurangi jumlah"
                      disabled={this.state.quantity <= 1}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <input
                      type="number"
                      className={`bdFormInput ${this.state.formErrors.quantity ? "bdFormInput--error" : ""}`}
                      min="1"
                      max="99"
                      value={this.state.quantity}
                      onChange={(e) =>
                        this.handleFormChange(
                          "quantity",
                          Math.max(1, Math.min(99, parseInt(e.target.value) || 1))
                        )
                      }
                      aria-label="Jumlah bouquet"
                      aria-invalid={!!this.state.formErrors.quantity}
                      aria-describedby={this.state.formErrors.quantity ? "quantity-error" : undefined}
                    />
                    <button
                      type="button"
                      className="bdFormQuantityBtn"
                      onClick={() => this.handleFormChange("quantity", Math.min(99, this.state.quantity + 1))}
                      aria-label="Tambah jumlah"
                      disabled={this.state.quantity >= 99}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  {this.state.formErrors.quantity && (
                    <span className="bdFormError" id="quantity-error" role="alert">
                      {this.state.formErrors.quantity}
                    </span>
                  )}
                  <span className="bdFormHint">
                    Pilih jumlah bouquet yang ingin dipesan (1-99)
                  </span>
                </div>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">
                    Tipe Pengiriman
                    <span className="bdFormLabel__required" aria-label="Wajib diisi">*</span>
                  </label>
                  <div className="bdFormRadioGroup">
                    <label className={`bdFormRadio ${this.state.deliveryType === "delivery" ? "bdFormRadio--active" : ""}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={this.state.deliveryType === "delivery"}
                        onChange={(e) =>
                          this.handleFormChange("deliveryType", e.target.value)
                        }
                      />
                      <span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Diantar
                      </span>
                    </label>
                    <label className={`bdFormRadio ${this.state.deliveryType === "pickup" ? "bdFormRadio--active" : ""}`}>
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={this.state.deliveryType === "pickup"}
                        onChange={(e) =>
                          this.handleFormChange("deliveryType", e.target.value)
                        }
                      />
                      <span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Ambil di Toko
                      </span>
                    </label>
                  </div>
                  <span className="bdFormHint">
                    Pilih metode pengiriman yang diinginkan
                  </span>
                </div>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">
                    {this.state.deliveryType === "delivery"
                      ? "Tanggal Pengiriman"
                      : "Tanggal Pengambilan"}
                    <span className="bdFormLabel__required" aria-label="Wajib diisi">*</span>
                  </label>
                  <div className="bdFormInputWrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bdFormInputIcon" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <input
                      type="date"
                      className={`bdFormInput ${this.state.formErrors.deliveryDate ? "bdFormInput--error" : ""}`}
                      min={minDate}
                      value={this.state.deliveryDate}
                      onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
                      aria-label={
                        this.state.deliveryType === "delivery"
                          ? "Tanggal pengiriman"
                          : "Tanggal pengambilan"
                      }
                      aria-invalid={!!this.state.formErrors.deliveryDate}
                      aria-describedby={this.state.formErrors.deliveryDate ? "deliveryDate-error" : undefined}
                    />
                  </div>
                  {this.state.formErrors.deliveryDate && (
                    <span className="bdFormError" id="deliveryDate-error" role="alert">
                      {this.state.formErrors.deliveryDate}
                    </span>
                  )}
                  <div className="bdFormHintWrapper">
                    <span className="bdFormHint">
                      Pilih tanggal {this.state.deliveryType === "delivery" ? "pengiriman" : "pengambilan"} (minimal besok)
                    </span>
                    {this.state.deliveryDate && this.calculateDeliveryTime() && (
                      <span className="bdFormHint bdFormHint--deliveryTime">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {this.calculateDeliveryTime()}
                      </span>
                    )}
                  </div>
                </div>

                {this.state.deliveryDate && (
                  <div className="bdFormGroup">
                    <label className="bdFormLabel">
                      {this.state.deliveryType === "delivery"
                        ? "Waktu Pengiriman"
                        : "Waktu Pengambilan"}
                      <span className="bdFormLabel__optional">(Opsional)</span>
                    </label>
                    <DeliveryTimeSlot
                      selectedDate={this.state.deliveryDate}
                      selectedSlot={this.state.deliveryTimeSlot}
                      onSelect={(slotId) => this.handleFormChange("deliveryTimeSlot", slotId)}
                    />
                    <span className="bdFormHint">
                      Pilih slot waktu yang nyaman untuk {this.state.deliveryType === "delivery" ? "pengiriman" : "pengambilan"}
                    </span>
                  </div>
                )}

                {this.state.deliveryType === "delivery" && (
                  <div className="bdFormGroup">
                    <label className="bdFormLabel">
                      Alamat Pengiriman
                      <span className="bdFormLabel__required" aria-label="Wajib diisi">*</span>
                    </label>
                    <AddressAutocomplete
                      value={this.state.address}
                      onChange={this.handleAddressChange}
                      placeholder="Masukkan alamat lengkap atau pilih dari alamat tersimpan"
                      required
                      error={this.state.formErrors.address}
                      onLocationChange={this.handleLocationChange}
                    />
                    {getAccessToken() && (
                      <button
                        type="button"
                        onClick={this.loadSavedAddress}
                        className="bdFormAddressHelper"
                        aria-label="Gunakan alamat default"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Gunakan Alamat Tersimpan
                      </button>
                    )}
                    {this.state.deliveryPriceResult && (
                      <div className="bdDeliveryPrice">
                        <div className="bdDeliveryPrice__info">
                          <span className="bdDeliveryPrice__label">Ongkir:</span>
                          <span className="bdDeliveryPrice__value">
                            {this.state.deliveryPriceResult.formattedPrice}
                          </span>
                        </div>
                        <div className="bdDeliveryPrice__details">
                          <span>Jarak: ~{this.state.deliveryPriceResult.distance} km</span>
                          <span>•</span>
                          <span>Estimasi: {this.state.deliveryPriceResult.estimatedTime}</span>
                        </div>
                      </div>
                    )}
                    {this.state.formErrors.address && (
                      <span className="bdFormError" id="address-error" role="alert">
                        {this.state.formErrors.address}
                      </span>
                    )}
                    <span className="bdFormHint">
                      Gunakan autocomplete untuk alamat yang lebih akurat dan estimasi ongkir otomatis.
                    </span>
                  </div>
                )}

                <div className="bdFormGroup">
                  <label className="bdFormLabel">
                    Kartu Ucapan
                    <span className="bdFormLabel__optional">(Opsional)</span>
                  </label>
                  <textarea
                    className="bdFormTextarea"
                    rows={3}
                    placeholder="Tulis pesan untuk kartu ucapan... (contoh: Selamat ulang tahun! Semoga selalu bahagia)"
                    value={this.state.greetingCard}
                    onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
                    aria-label="Kartu ucapan"
                    maxLength={200}
                  />
                  <span className="bdFormHint">
                    Pesan akan ditulis di kartu ucapan yang menyertai bouquet. Maksimal 200 karakter.
                  </span>
                  {this.state.greetingCard.length > 0 && (
                    <div className="bdFormCharCount">
                      {this.state.greetingCard.length} / 200 karakter
                    </div>
                  )}
                </div>

                {/* Preview Message */}
                {this.state.showPreview && (
                  <div className="bdOrderPreview" aria-label="Preview pesan">
                    <div className="bdOrderPreview__header">
                      <h3 className="bdOrderPreview__title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Preview Pesan WhatsApp
                      </h3>
                      <button
                        type="button"
                        className="bdOrderPreview__close"
                        onClick={() => this.setState({ showPreview: false })}
                        aria-label="Tutup preview"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="bdOrderPreview__content">
                      <pre className="bdOrderPreview__message">
                        {buildCustomerOrderMessage(bouquet, this.props.detailUrl, this.state)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="bdActions">
                <div className="bdActions__buttons">
                  <button
                    type="button"
                    className="bdBtn bdBtn--secondary"
                    onClick={() => this.setState({ showPreview: !this.state.showPreview })}
                    aria-label="Lihat preview pesan"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>{this.state.showPreview ? "Sembunyikan" : "Lihat"} Preview</span>
                  </button>
                  
                  <a
                    className={`bdBtn bdBtn--primary btn-luxury ${!this.state.isFormValid ? "bdBtn--disabled" : ""}`}
                    href={this.state.isFormValid ? waCustomer : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Pesan bouquet ini lewat WhatsApp"
                    onClick={(e) => {
                      if (!this.state.isFormValid) {
                        e.preventDefault();
                        // Scroll to first error
                        const firstError = document.querySelector(".bdFormInput--error, .bdFormTextarea--error");
                        if (firstError) {
                          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
                          (firstError as HTMLElement).focus();
                        }
                        return;
                      }
                      createRipple(e);
                      
                      // Save order data and prepare confirmation page URL
                      const orderData = {
                        bouquetName: bouquet.name,
                        quantity: this.state.quantity,
                        deliveryType: this.state.deliveryType,
                        deliveryDate: this.state.deliveryDate,
                        deliveryTimeSlot: this.state.deliveryTimeSlot,
                        address: this.state.address,
                        greetingCard: this.state.greetingCard,
                        totalPrice: bouquet.price * this.state.quantity,
                      };
                      
                      // Store in sessionStorage for confirmation page
                      sessionStorage.setItem("orderData", JSON.stringify(orderData));
                      
                      // Clear saved form after successful order
                      localStorage.removeItem(this.formStorageKey);
                      
                      // Build confirmation URL
                      const confirmationUrl = new URL("/order-confirmation", window.location.origin);
                      Object.entries(orderData).forEach(([key, value]) => {
                        if (value !== null && value !== undefined && value !== "") {
                          confirmationUrl.searchParams.set(key, encodeURIComponent(String(value)));
                        }
                      });
                      
                      // Store confirmation URL to redirect after WhatsApp opens
                      sessionStorage.setItem("confirmationUrl", confirmationUrl.toString());
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                    </svg>
                    <span>Pesan lewat WhatsApp</span>
                    {!this.state.isFormValid && (
                      <span className="bdBtn__badge" aria-label="Form belum lengkap">
                        !
                      </span>
                    )}
                  </a>
                </div>

                {!this.state.isFormValid && (
                  <div className="bdActionWarning" role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Lengkapi semua field yang wajib diisi untuk melanjutkan pemesanan.</span>
                  </div>
                )}
                
                <p className={`bdActionHint ${this.state.isFormValid ? "bdActionHint--success" : ""}`}>
                  {this.state.isFormValid 
                    ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "inline-block", marginRight: "0.5rem", verticalAlign: "middle" }}>
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>Form sudah lengkap! Klik tombol di atas untuk mengirim pesan ke WhatsApp.</span>
                      </>
                    )
                    : "Lengkapi form di atas, lalu klik tombol untuk mengirim pesan ke WhatsApp."}
                </p>
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
        </div>
      </section>
    );
  }
}

export default BouquetDetailPage;

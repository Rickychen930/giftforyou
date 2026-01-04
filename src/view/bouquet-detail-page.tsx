import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { observeFadeIn, revealOnScroll } from "../utils/luxury-enhancements";
import { formatBouquetName } from "../utils/text-formatter";
import SocialProof from "../components/SocialProof";
import UrgencyIndicator from "../components/UrgencyIndicator";
import { isFavorite as checkIsFavorite, toggleFavorite } from "../utils/favorites";
import { addToRecentlyViewed } from "../utils/recently-viewed";
import { toast } from "../utils/toast";
import { API_BASE } from "../config/api";
import { getAccessToken, isAuthenticated } from "../utils/auth-utils";

// Reusable Components
import ProductImageGallery from "../components/bouquet-detail/ProductImageGallery";
import ProductHeader from "../components/bouquet-detail/ProductHeader";
import ProductInfo from "../components/bouquet-detail/ProductInfo";
import OrderForm, { OrderFormData } from "../components/bouquet-detail/OrderForm";
import PriceSummary from "../components/bouquet-detail/PriceSummary";
import SimilarProducts from "../components/bouquet-detail/SimilarProducts";
import Breadcrumb from "../components/bouquet-detail/Breadcrumb";
import BouquetDetailSkeleton from "../components/bouquet-detail/BouquetDetailSkeleton";
import ShareButton from "../components/bouquet-detail/ShareButton";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";
const formatPrice = formatIDR;
const FORM_STORAGE_KEY = "bouquet_order_form_data";

const buildImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const buildCustomerOrderMessage = (
  b: Bouquet,
  detailUrl: string,
  formData: OrderFormData
) => {
  const lines = [
    `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan bouquet berikut:`,
    ``,
    `Nama: ${formatBouquetName(b.name)}`,
    `Harga: ${formatPrice(b.price)}`,
    b.status ? `Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    b.size ? `Ukuran: ${b.size}` : "",
    b.type ? `Tipe: ${b.type}` : "",
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
  similarBouquets?: Bouquet[];
  onRetry?: () => void;
}

/**
 * Get default date (tomorrow)
 */
const getDefaultDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

/**
 * Validate form data
 */
const validateFormWithData = (
  formData: OrderFormData
): { isValid: boolean; errors: Partial<Record<keyof OrderFormData, string>> } => {
  const errors: Partial<Record<keyof OrderFormData, string>> = {};

  // Validate quantity
  if (formData.quantity < 1 || formData.quantity > 99) {
    errors.quantity = "Jumlah harus antara 1-99";
  }

  // Validate delivery date
  if (!formData.deliveryDate) {
    errors.deliveryDate = "Tanggal harus diisi";
  } else {
    const selectedDate = new Date(formData.deliveryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      errors.deliveryDate = "Tanggal harus minimal besok";
    }
  }

  // Validate address only for delivery
  if (formData.deliveryType === "delivery") {
    if (!formData.address.trim()) {
      errors.address = "Alamat pengiriman harus diisi";
    } else if (formData.address.trim().length < 10) {
      errors.address = "Alamat terlalu pendek, minimal 10 karakter";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Calculate form progress percentage
 */
const calculateFormProgress = (formData: OrderFormData): number => {
  let completed = 0;
  const total = 4;

  // Quantity validation
  if (formData.quantity >= 1 && formData.quantity <= 99) {
    completed++;
  }

  // Delivery type validation
  if (formData.deliveryType) {
    completed++;
  }

  // Delivery date validation
  if (formData.deliveryDate) {
    const selectedDate = new Date(formData.deliveryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate >= tomorrow) {
      completed++;
    }
  }

  // Address validation (only for delivery, auto-complete for pickup)
  if (formData.deliveryType === "pickup") {
    completed++;
  } else if (formData.deliveryType === "delivery" && formData.address.trim().length >= 10) {
    completed++;
  }

  return Math.round((completed / total) * 100);
};

/**
 * Bouquet Detail Page Component
 * Modern functional component with hooks for optimal performance
 * Follows SOLID, DRY, MVP principles
 */
const BouquetDetailPage: React.FC<Props> = ({
  bouquet,
  loading,
  error,
  detailUrl,
  similarBouquets = [],
  onRetry,
}) => {
  const [formData, setFormData] = useState<OrderFormData>(() => {
    // Load from localStorage on mount
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === "object") {
          return {
            deliveryType: data.deliveryType || "delivery",
            deliveryDate: data.deliveryDate || getDefaultDate(),
            deliveryTimeSlot: data.deliveryTimeSlot || undefined,
            address: data.address || "",
            greetingCard: data.greetingCard || "",
            quantity: data.quantity || 1,
          };
        }
      }
    } catch {
      // Ignore errors
    }
    return {
      deliveryType: "delivery",
      deliveryDate: getDefaultDate(),
      deliveryTimeSlot: undefined,
      address: "",
      greetingCard: "",
      quantity: 1,
    };
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const saveFormDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved address from API
  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const token = getAccessToken();
        if (!token || formData.address) return;

        const response = await fetch(`${API_BASE}/api/customers/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const addresses = await response.json();
          const defaultAddress = addresses.find((addr: any) => addr.isDefault);
          if (defaultAddress && defaultAddress.fullAddress) {
            setFormData((prev) => ({
              ...prev,
              address: defaultAddress.fullAddress,
            }));
            toast.info("Alamat default dimuat");
          }
        }
      } catch {
        // Silently fail
      }
    };

    const timer = setTimeout(loadSavedAddress, 500);
    return () => clearTimeout(timer);
  }, [formData.address]);


  // Calculate form progress
  const formProgress = useMemo(() => calculateFormProgress(formData), [formData]);

  // Handle form field changes
  const handleFormChange = useCallback(
    (field: keyof OrderFormData, value: string | number) => {
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          [field]: value,
        };

        // Clear address when switching to pickup
        if (field === "deliveryType" && value === "pickup") {
          newFormData.address = "";
        }

        // Validate immediately
        const validation = validateFormWithData(newFormData);
        setFormErrors(validation.errors);
        setIsFormValid(validation.isValid);

        // Debounce save to localStorage
        if (saveFormDataTimeoutRef.current) {
          clearTimeout(saveFormDataTimeoutRef.current);
        }
        saveFormDataTimeoutRef.current = setTimeout(() => {
          localStorage.setItem(
            FORM_STORAGE_KEY,
            JSON.stringify({
              deliveryType: newFormData.deliveryType,
              deliveryDate: newFormData.deliveryDate,
              deliveryTimeSlot: newFormData.deliveryTimeSlot,
              address: newFormData.address,
              greetingCard: newFormData.greetingCard,
              quantity: newFormData.quantity,
            })
          );
        }, 500);

        return newFormData;
      });
    },
    []
  );

  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      handleFormChange("address", e.target.value);
    },
    [handleFormChange]
  );

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (!bouquet) return;

    const newFavoriteStatus = toggleFavorite(
      bouquet._id,
      bouquet.name,
      bouquet.price,
      bouquet.image
    );

    setIsFavorite(newFavoriteStatus);
  }, [bouquet]);

  // Apply SEO
  useEffect(() => {
    if (!bouquet) {
      setSeo({
        title: "Detail Bouquet | Giftforyou.idn",
        description: "Lihat detail bouquet dan pesan lewat WhatsApp.",
        path: window.location.pathname,
      });
      return;
    }

    const details = [bouquet.type, bouquet.size].filter(Boolean).join(" • ");
    const price = Number.isFinite(bouquet.price) ? formatPrice(bouquet.price) : undefined;
    const titleParts = [formatBouquetName(bouquet.name), details].filter(Boolean).join(" — ");

    setSeo({
      title: `${titleParts} | Giftforyou.idn - Florist Cirebon`,
      description:
        `${formatBouquetName(bouquet.name)}${details ? ` (${details})` : ""}` +
        (price ? ` — ${price}.` : ".") +
        ` Tersedia di Cirebon, Jawa Barat. Pesan mudah lewat WhatsApp dengan pengiriman cepat ke seluruh Cirebon dan sekitarnya.`,
      keywords:
        `${formatBouquetName(bouquet.name).toLowerCase()}, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist cirebon, toko bunga cirebon, hadiah cirebon, kado cirebon, florist jawa barat`,
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
  }, [bouquet]);

  // Initialize favorite status and recently viewed
  useEffect(() => {
    if (bouquet) {
      setIsFavorite(checkIsFavorite(bouquet._id));

      // Add to recently viewed (deferred for performance)
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(
          () => {
            addToRecentlyViewed(bouquet._id, bouquet.name, bouquet.price, bouquet.image);
          },
          { timeout: 1000 }
        );
      } else {
        setTimeout(() => {
          addToRecentlyViewed(bouquet._id, bouquet.name, bouquet.price, bouquet.image);
        }, 100);
      }
    }
  }, [bouquet]);

  // Validate form on mount and when formData changes
  useEffect(() => {
    const validation = validateFormWithData(formData);
    setFormErrors(validation.errors);
    setIsFormValid(validation.isValid);
  }, [formData]);

  // Initialize luxury enhancements
  useEffect(() => {
    const initLuxuryEnhancements = () => {
      observeFadeIn(".fade-in");
      revealOnScroll();
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(initLuxuryEnhancements, { timeout: 100 });
    } else {
      setTimeout(initLuxuryEnhancements, 50);
    }
  }, [bouquet]);

  // Cleanup timeouts
  useEffect(() => {
    const saveTimeout = saveFormDataTimeoutRef.current;
    
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, []);

  // Handle order submit
  const handleOrderSubmit = useCallback(() => {
    if (!bouquet || !isFormValid) {
      toast.error("Lengkapi semua field yang wajib terlebih dahulu");
      return;
    }

    const waOrderLink = buildWhatsAppLink(buildCustomerOrderMessage(bouquet, detailUrl, formData));
    window.open(waOrderLink, "_blank", "noopener,noreferrer");
    setShowOrderModal(false);
  }, [bouquet, isFormValid, detailUrl, formData]);

  // Check if admin
  const isAdmin = useMemo(() => isAuthenticated(), []);

  // Loading state - Use skeleton for better UX
  if (loading) {
    return <BouquetDetailSkeleton />;
  }

  // Error state
  if (error || !bouquet) {
    return (
      <section className="bouquet-detail-page">
        <div className="bouquet-detail-page__container">
          <div className="bouquet-detail-page__error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
            <h2>{error ?? "Bouquet tidak ditemukan."}</h2>
            <p>Coba kembali ke katalog atau periksa tautan yang Anda gunakan.</p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="bouquet-detail-page__retry-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    border: "1.5px solid rgba(212, 140, 156, 0.3)",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))",
                    color: "var(--brand-rose-600)",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 4v6h6M23 20v-6h-6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Coba Lagi</span>
                </button>
              )}
              <Link to="/collection" className="bouquet-detail-page__back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 12H5M12 19l-7-7 7-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Kembali ke Katalog</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main render
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
                onFavoriteToggle={handleFavoriteToggle}
              />
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <ShareButton
                  title={formatBouquetName(bouquet.name)}
                  url={detailUrl}
                  text={`Lihat ${formatBouquetName(bouquet.name)} di Giftforyou.idn`}
                />
              </div>
            </div>

            <div className="bouquet-detail-page__indicators">
              <SocialProof bouquetId={bouquet._id} />
              {bouquet.status === "ready" &&
                bouquet.quantity !== undefined &&
                bouquet.quantity > 0 &&
                bouquet.quantity <= 5 && (
                  <UrgencyIndicator type="limited-stock" stockCount={bouquet.quantity} />
                )}
              {bouquet.status === "preorder" && <UrgencyIndicator type="preorder" />}
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

              <button
                type="button"
                className="bouquet-detail-page__order-btn"
                onClick={() => setShowOrderModal(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Pesan Sekarang</span>
              </button>
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
            <button
              type="button"
              className="bouquet-detail-page__admin-link"
              onClick={() => {
                navigator.clipboard?.writeText(detailUrl);
                toast.success("Tautan disalin");
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 17V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Salin Tautan</span>
            </button>
          </div>
        )}

        {/* Order Modal */}
        {showOrderModal && (
          <div
            className="bouquet-detail-page__modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowOrderModal(false);
              }
            }}
          >
            <div className="bouquet-detail-page__modal">
              <div className="bouquet-detail-page__modal-header">
                <h2>Form Pemesanan</h2>
                <button
                  type="button"
                  className="bouquet-detail-page__modal-close"
                  onClick={() => setShowOrderModal(false)}
                  aria-label="Tutup"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="bouquet-detail-page__modal-content">
                <OrderForm
                  formData={formData}
                  errors={formErrors}
                  onFormChange={handleFormChange}
                  onAddressChange={handleAddressChange}
                  getDefaultDate={getDefaultDate}
                />
              </div>

              <div className="bouquet-detail-page__modal-footer">
                {!isFormValid && (
                  <div className="bouquet-detail-page__modal-warning">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 9v4M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Lengkapi semua field yang wajib untuk melanjutkan</span>
                  </div>
                )}
                <div className="bouquet-detail-page__modal-actions">
                  <button
                    type="button"
                    className="bouquet-detail-page__modal-btn bouquet-detail-page__modal-btn--secondary"
                    onClick={() => setShowOrderModal(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`bouquet-detail-page__modal-btn bouquet-detail-page__modal-btn--primary ${
                      !isFormValid ? "bouquet-detail-page__modal-btn--disabled" : ""
                    }`}
                    onClick={handleOrderSubmit}
                    disabled={!isFormValid}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                        fill="currentColor"
                      />
                    </svg>
                    Kirim ke WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(BouquetDetailPage);

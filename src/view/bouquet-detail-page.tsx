import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { observeFadeIn, revealOnScroll, createRipple } from "../utils/luxury-enhancements";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
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
    `Nama: ${b.name}`,
    `Harga: ${formatPrice(b.price)}`,
    b.status ? `Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    b.size ? `Ukuran: ${b.size}` : "",
    b.type ? `Tipe: ${b.type}` : "",
    `Jumlah: ${formData.quantity}`,
    ``,
    `📦 Pengiriman: ${formData.deliveryType === "pickup" ? "Ambil di toko" : "Diantar"}`,
    formData.deliveryType === "delivery" && formData.deliveryDate
      ? `📅 Tanggal pengiriman: ${formData.deliveryDate}`
      : formData.deliveryType === "pickup" && formData.deliveryDate
        ? `📅 Tanggal pengambilan: ${formData.deliveryDate}`
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
  address: string;
  greetingCard: string;
  quantity: number;
}

class BouquetDetailPage extends Component<Props> {
  state: OrderFormState = {
    deliveryType: "delivery",
    deliveryDate: "",
    address: "",
    greetingCard: "",
    quantity: 1,
  };

  componentDidMount(): void {
    this.applySeo();
    
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
    this.setState({ [field]: value } as Partial<OrderFormState>);
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

    const details = [bouquet.type, bouquet.size].filter(Boolean).join(" • ");
    const price = Number.isFinite(bouquet.price)
      ? formatPrice(bouquet.price)
      : undefined;
    const titleParts = [bouquet.name, details].filter(Boolean).join(" — ");

    const locationKeywords = "Cirebon, Jawa Barat";
    setSeo({
      title: `${titleParts} | Giftforyou.idn - Florist Cirebon`,
      description:
        `${bouquet.name}${details ? ` (${details})` : ""}` +
        (price ? ` — ${price}.` : ".") +
        ` Tersedia di Cirebon, Jawa Barat. Pesan mudah lewat WhatsApp dengan pengiriman cepat ke seluruh Cirebon dan sekitarnya.`,
      keywords:
        `${bouquet.name.toLowerCase()}, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist cirebon, toko bunga cirebon, hadiah cirebon, kado cirebon, florist jawa barat, ${locationKeywords}`,
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
      buildCustomerOrderMessage(bouquet, detailUrl, this.state)
    );

    // Quick order link - instant order without filling form
    const waQuickOrder = buildWhatsAppLink(
      buildQuickOrderMessage(bouquet, detailUrl)
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
              <h1 id="bd-title" className="bdTitle gradient-text">
                {bouquet.name}
              </h1>

              <p className="bdPrice">{formatPrice(bouquet.price)}</p>

              {bouquet.description && (
                <p className="bdDesc">{bouquet.description}</p>
              )}

              <div className="bdMeta" aria-label="Ringkasan bouquet">
                {bouquet.size && <span className="bdChip">Ukuran: {bouquet.size}</span>}
                {bouquet.type && <span className="bdChip">Tipe: {bouquet.type}</span>}
                {bouquet.collectionName && (
                  <span className="bdChip">Koleksi: {bouquet.collectionName}</span>
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
                        {tag}
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
                        <dd>{(bouquet as any).occasions.join(", ")}</dd>
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
                        <dd>{(bouquet as any).flowers.join(", ")}</dd>
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

              {/* Order Form */}
              <div className="bdOrderForm" aria-label="Form pemesanan">
                <h2 className="bdSectionTitle">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Form Pemesanan Detail
                </h2>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">Jumlah</label>
                  <input
                    type="number"
                    className="bdFormInput"
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
                  />
                </div>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">Tipe Pengiriman</label>
                  <div className="bdFormRadioGroup">
                    <label className="bdFormRadio">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="delivery"
                        checked={this.state.deliveryType === "delivery"}
                        onChange={(e) =>
                          this.handleFormChange("deliveryType", e.target.value)
                        }
                      />
                      <span>Diantar</span>
                    </label>
                    <label className="bdFormRadio">
                      <input
                        type="radio"
                        name="deliveryType"
                        value="pickup"
                        checked={this.state.deliveryType === "pickup"}
                        onChange={(e) =>
                          this.handleFormChange("deliveryType", e.target.value)
                        }
                      />
                      <span>Ambil di Toko</span>
                    </label>
                  </div>
                </div>

                <div className="bdFormGroup">
                  <label className="bdFormLabel">
                    {this.state.deliveryType === "delivery"
                      ? "Tanggal Pengiriman"
                      : "Tanggal Pengambilan"}
                  </label>
                  <input
                    type="date"
                    className="bdFormInput"
                    min={minDate}
                    value={this.state.deliveryDate}
                    onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
                    aria-label={
                      this.state.deliveryType === "delivery"
                        ? "Tanggal pengiriman"
                        : "Tanggal pengambilan"
                    }
                  />
                </div>

                {this.state.deliveryType === "delivery" && (
                  <div className="bdFormGroup">
                    <label className="bdFormLabel">Alamat Pengiriman</label>
                    <textarea
                      className="bdFormTextarea"
                      rows={3}
                      placeholder="Masukkan alamat lengkap pengiriman"
                      value={this.state.address}
                      onChange={(e) => this.handleFormChange("address", e.target.value)}
                      aria-label="Alamat pengiriman"
                    />
                  </div>
                )}

                <div className="bdFormGroup">
                  <label className="bdFormLabel">Kartu Ucapan (Opsional)</label>
                  <textarea
                    className="bdFormTextarea"
                    rows={2}
                    placeholder="Tulis pesan untuk kartu ucapan..."
                    value={this.state.greetingCard}
                    onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
                    aria-label="Kartu ucapan"
                  />
                  <span className="bdFormHint">
                    Pesan akan ditulis di kartu ucapan yang menyertai bouquet
                  </span>
                </div>
              </div>

              <div className="bdActions">
                <a
                  className="bdBtn bdBtn--primary btn-luxury"
                  href={waCustomer}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pesan bouquet ini lewat WhatsApp"
                  onClick={(e) => createRipple(e)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
                  </svg>
                  <span>Pesan lewat WhatsApp</span>
                </a>

                <p className="bdActionHint">
                  Lengkapi form di atas, lalu klik tombol untuk mengirim pesan ke WhatsApp.
                </p>
              </div>

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

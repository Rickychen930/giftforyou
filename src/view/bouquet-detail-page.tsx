import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";
import { buildWhatsAppLink } from "../utils/whatsapp";

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

const buildCustomerOrderMessage = (b: Bouquet, detailUrl: string) => {
  const lines = [
    `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan bouquet berikut:`,
    ``,
    `Nama: ${b.name}`,
    `Harga: ${formatPrice(b.price)}`,
    b.status ? `Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    b.size ? `Ukuran: ${b.size}` : "",
    b.type ? `Tipe: ${b.type}` : "",
    `Jumlah: 1`,
    `Tanggal dibutuhkan / acara: `,
    `Catatan (warna/tema/custom): `,
    detailUrl ? `Tautan detail: ${detailUrl}` : "",
  ].filter(Boolean);

  return lines.join("\n");
};

const buildAdminSellerMessage = (
  b: Bouquet,
  detailUrl: string,
  imageUrl: string
) => {
  const occasions = Array.isArray((b as any).occasions)
    ? (b as any).occasions.filter((x: unknown) => typeof x === "string" && x.trim())
    : [];
  const flowers = Array.isArray((b as any).flowers)
    ? (b as any).flowers.filter((x: unknown) => typeof x === "string" && x.trim())
    : [];
  const qty = typeof (b as any).quantity === "number" ? (b as any).quantity : undefined;
  const care = typeof (b as any).careInstructions === "string" ? (b as any).careInstructions.trim() : "";

  const lines = [
    `ADMIN — Kirim info bouquet ke seller`,
    `Tanggal: ${new Date().toLocaleString("id-ID")}`,
    ``,
    `Nama: ${b.name}`,
    `Harga: ${formatPrice(b.price)}`,
    b.status ? `Status: ${b.status === "ready" ? "Siap" : "Preorder"}` : "",
    b.size ? `Ukuran: ${b.size}` : "",
    b.type ? `Tipe: ${b.type}` : "",
    b.collectionName ? `Koleksi: ${b.collectionName}` : "",
    typeof qty === "number" ? `Stok: ${qty}` : "",
    occasions.length ? `Acara: ${occasions.join(", ")}` : "",
    flowers.length ? `Bunga: ${flowers.join(", ")}` : "",
    care ? `Perawatan: ${care}` : "",
    ``,
    detailUrl ? `Tautan detail: ${detailUrl}` : "",
    imageUrl ? `Tautan gambar: ${imageUrl}` : "",
  ].filter(Boolean);

  return lines.join("\n");
};

interface Props {
  bouquet: Bouquet | null;
  loading: boolean;
  error: string | null;
  detailUrl: string;
}

class BouquetDetailPage extends Component<Props> {
  componentDidMount(): void {
    this.applySeo();
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.bouquet !== this.props.bouquet ||
      prevProps.detailUrl !== this.props.detailUrl ||
      prevProps.error !== this.props.error
    ) {
      this.applySeo();
    }
  }

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

    setSeo({
      title: `${titleParts} | Giftforyou.idn`,
      description:
        `${bouquet.name}${details ? ` (${details})` : ""}` +
        (price ? ` — ${price}.` : ".") +
        " Pesan mudah lewat WhatsApp.",
      path: window.location.pathname,
      ogImagePath: bouquet.image ? buildImageUrl(bouquet.image) : undefined,
    });
  }

  render(): React.ReactNode {
    const { bouquet, loading, error, detailUrl } = this.props;

    if (loading) {
      return (
        <section className="bdPage">
          <div className="bdContainer">
            <div className="bdState" aria-live="polite">
              Memuat bouquet…
            </div>
          </div>
        </section>
      );
    }

    if (error || !bouquet) {
      return (
        <section className="bdPage">
          <div className="bdContainer">
            <div className="bdState bdState--error" role="alert">
              {error ?? "Bouquet tidak ditemukan."}
            </div>

            <Link to="/collection" className="bdBackLink">
              Kembali ke Katalog
            </Link>
          </div>
        </section>
      );
    }

    const isAdmin = Boolean(localStorage.getItem("authToken"));
    const imageUrl = toAbsoluteUrl(buildImageUrl(bouquet.image));

    const waCustomer = buildWhatsAppLink(
      buildCustomerOrderMessage(bouquet, detailUrl)
    );
    const waAdmin = buildWhatsAppLink(
      buildAdminSellerMessage(bouquet, detailUrl, imageUrl)
    );

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
            <div className="bdMedia">
              <img
                src={buildImageUrl(bouquet.image)}
                alt={bouquet.name}
                loading="eager"
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

            <div className="bdInfo">
              <h1 id="bd-title" className="bdTitle">
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
              </div>

              <div className="bdDetails" aria-label="Rincian bouquet">
                <h2 className="bdSectionTitle">Rincian</h2>
                <dl className="bdDl">
                  {typeof (bouquet as any).quantity === "number" && (
                    <>
                      <dt>Stok</dt>
                      <dd>{(bouquet as any).quantity}</dd>
                    </>
                  )}

                  {Array.isArray((bouquet as any).occasions) &&
                    (bouquet as any).occasions.length > 0 && (
                      <>
                        <dt>Acara</dt>
                        <dd>{(bouquet as any).occasions.join(", ")}</dd>
                      </>
                    )}

                  {Array.isArray((bouquet as any).flowers) &&
                    (bouquet as any).flowers.length > 0 && (
                      <>
                        <dt>Bunga</dt>
                        <dd>{(bouquet as any).flowers.join(", ")}</dd>
                      </>
                    )}

                  {typeof (bouquet as any).careInstructions === "string" &&
                    (bouquet as any).careInstructions.trim() && (
                      <>
                        <dt>Perawatan</dt>
                        <dd>{(bouquet as any).careInstructions.trim()}</dd>
                      </>
                    )}
                </dl>
              </div>

              <div className="bdActions">
                <a
                  className="bdBtn bdBtn--primary"
                  href={waCustomer}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Pesan lewat WhatsApp
                </a>

                <p className="bdActionHint">
                  Isi jumlah, tanggal dibutuhkan, dan catatan custom — lalu kirim.
                </p>

                {isAdmin && (
                  <a
                    className="bdBtn bdBtn--seller"
                    href={waAdmin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kirim info ke Seller (Admin)
                  </a>
                )}

                <Link className="bdBtn bdBtn--secondary" to="/collection">
                  Kembali ke Katalog
                </Link>
              </div>

              <div className="bdLinkRow">
                <span className="bdLinkLabel">Tautan bouquet:</span>
                <a
                  className="bdLink"
                  href={detailUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {detailUrl}
                </a>
              </div>

              {isAdmin && imageUrl && (
                <div className="bdLinkRow">
                  <span className="bdLinkLabel">Tautan gambar:</span>
                  <a
                    className="bdLink"
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {imageUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default BouquetDetailPage;

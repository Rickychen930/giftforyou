import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetDetailPage.css";
import type { Bouquet } from "../models/domain/bouquet";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";
const WA_NUMBER = "6285161428911";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const buildImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const buildWhatsAppLink = (b: Bouquet, detailUrl: string) => {
  const lines = [
    `Halo Giftforyou.idn, saya ingin order bouquet berikut:`,
    ``,
    `Nama: ${b.name}`,
    `Harga: ${formatPrice(b.price)}`,
    b.size ? `Size: ${b.size}` : "",
    b.type ? `Type: ${b.type}` : "",
    detailUrl ? `Link detail: ${detailUrl}` : "",
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WA_NUMBER}?text=${message}`;
};

interface Props {
  bouquet: Bouquet | null;
  loading: boolean;
  error: string | null;
  detailUrl: string;
}

class BouquetDetailPage extends Component<Props> {
  render(): React.ReactNode {
    const { bouquet, loading, error, detailUrl } = this.props;

    if (loading) {
      return (
        <section className="bdPage">
          <div className="bdContainer">
            <div className="bdState" aria-live="polite">
              Loading bouquet…
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
              {error ?? "Bouquet not found."}
            </div>

            <Link to="/collection" className="bdBackLink">
              Back to catalog
            </Link>
          </div>
        </section>
      );
    }

    const waLink = buildWhatsAppLink(bouquet, detailUrl);

    return (
      <section className="bdPage" aria-labelledby="bd-title">
        <div className="bdContainer">
          <nav className="bdBreadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="bdBreadcrumb__link">
              Home
            </Link>
            <span className="bdBreadcrumb__sep">/</span>
            <Link to="/collection" className="bdBreadcrumb__link">
              Catalog
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
                {bouquet.status === "ready" ? "Ready" : "Preorder"}
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

              <div className="bdMeta" aria-label="Bouquet details">
                {bouquet.size && (
                  <span className="bdChip">Size: {bouquet.size}</span>
                )}
                {bouquet.type && (
                  <span className="bdChip">Type: {bouquet.type}</span>
                )}
                {bouquet.collectionName && (
                  <span className="bdChip">{bouquet.collectionName}</span>
                )}
              </div>

              <div className="bdActions">
                <a
                  className="bdBtn bdBtn--primary"
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Order on WhatsApp
                </a>

                <Link className="bdBtn bdBtn--secondary" to="/collection">
                  Back to Catalog
                </Link>
              </div>

              <div className="bdLinkRow">
                <span className="bdLinkLabel">Bouquet link:</span>
                <a
                  className="bdLink"
                  href={detailUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {detailUrl}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default BouquetDetailPage;

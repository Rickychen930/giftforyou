import React, { Component } from "react";
import "../../styles/StoreLocationSection.css";
import type { StoreData } from "../../models/store-model";
import { storeData } from "../../models/store-model";

interface StoreLocationSectionProps {
  data?: StoreData;
}

interface StoreLocationSectionState {
  copiedAddress: boolean;
}

const DEFAULT_STORE_DATA: StoreData = storeData;

class StoreLocationSection extends Component<StoreLocationSectionProps, StoreLocationSectionState> {
  public state: StoreLocationSectionState = {
    copiedAddress: false,
  };

  private copyResetTimer: number | undefined;

  public componentWillUnmount(): void {
    if (this.copyResetTimer) {
      window.clearTimeout(this.copyResetTimer);
    }
  }

  private copyToClipboard = async (text: string): Promise<void> => {
    const trimmed = String(text ?? "").trim();
    if (!trimmed) return;

    const setCopied = () => {
      this.setState({ copiedAddress: true });
      if (this.copyResetTimer) {
        window.clearTimeout(this.copyResetTimer);
      }
      this.copyResetTimer = window.setTimeout(() => {
        this.setState({ copiedAddress: false });
      }, 1800);
    };

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trimmed);
        setCopied();
        return;
      }
    } catch {
      // fall back below
    }

    const textarea = document.createElement("textarea");
    textarea.value = trimmed;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const ok = document.execCommand("copy");
      if (ok) setCopied();
    } finally {
      document.body.removeChild(textarea);
    }
  };

  protected renderStoreInfo(data: StoreData): React.ReactNode {
    const {
      name,
      address,
      city,
      phone,
      email,
      hours,
      mapDirectionsUrl,
      social,
    } = data;

    const phoneForTel = String(phone ?? "").replace(/\s+/g, "");
    const fullAddress = [address, city].filter(Boolean).join(", ");

    return (
      <div
        className="storeLocation__info"
        aria-labelledby="storeLocation-title"
      >
        {/* Decorative floating elements */}
        <div
          className="storeLocation__decorFloater storeLocation__decorFloater--1"
          aria-hidden="true"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.15" />
            <path
              d="M20 10 L25 18 L20 16 L15 18 Z"
              fill="currentColor"
              opacity="0.3"
            />
          </svg>
        </div>
        <div
          className="storeLocation__decorFloater storeLocation__decorFloater--2"
          aria-hidden="true"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.12" />
          </svg>
        </div>

        <p className="storeLocation__kicker">
          Toko & Kontak
        </p>

        <h2 id="storeLocation-title" className="storeLocation__title">
          Kunjungi Toko Kami di Cirebon
        </h2>

        <div className="storeLocation__cards">
          {/* Store Location Card */}
          <div className="storeLocation__card storeLocation__card--location">
            <div className="storeLocation__cardIcon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="storeLocation__cardTitle">{name}</h3>
            <p className="storeLocation__text storeLocation__text--address">
              {address}
            </p>
            <p className="storeLocation__text storeLocation__text--city">
              {city}
            </p>

            <div className="storeLocation__actionsRow">
              <button
                type="button"
                className="storeLocation__copyBtn"
                onClick={() => this.copyToClipboard(fullAddress)}
                aria-label="Salin alamat toko"
                title="Salin alamat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Salin alamat</span>
              </button>

              <span className="storeLocation__copyHint" aria-live="polite">
                {this.state.copiedAddress ? "Tersalin" : ""}
              </span>
            </div>

            {mapDirectionsUrl && (
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="storeLocation__directionsBtn"
                aria-label="Petunjuk arah ke toko"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 11l19-9-9 19-2-8-8-2z" />
                </svg>
                Petunjuk Arah
              </a>
            )}
          </div>

          {/* Contact Card */}
          <div className="storeLocation__card storeLocation__card--contact">
            <div className="storeLocation__cardIcon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="storeLocation__cardTitle">Hubungi Kami</h3>
            <p className="storeLocation__text storeLocation__text--phone">
              <a href={`tel:${phoneForTel}`} aria-label={`Telepon ${phone}`}>
                {phone}
              </a>
            </p>
            <p className="storeLocation__text storeLocation__text--email">
              <a href={`mailto:${email}`} aria-label={`Email ${email}`}>
                {email}
              </a>
            </p>
            {social?.whatsapp && (
              <a
                href={social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="storeLocation__whatsappBtn"
                aria-label="Chat lewat WhatsApp"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat lewat WhatsApp
              </a>
            )}
          </div>

          {/* Opening Hours Card */}
          <div className="storeLocation__card storeLocation__card--hours">
            <div className="storeLocation__cardIcon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="storeLocation__cardTitle">Jam Operasional</h3>
            <p className="storeLocation__text storeLocation__text--hours">
              {hours.weekdays}
            </p>
            <p className="storeLocation__text storeLocation__text--hours">
              {hours.saturday}
            </p>
            <p className="storeLocation__text storeLocation__text--hours storeLocation__text--closed">
              {hours.sunday}
            </p>
          </div>
        </div>

        {/* Social Media Links */}
        {social && (social.instagram || social.tiktok) && (
          <div className="storeLocation__social">
            <p className="storeLocation__socialTitle">Follow Us</p>
            <div className="storeLocation__socialLinks">
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="storeLocation__socialLink storeLocation__socialLink--instagram"
                  aria-label="Follow us on Instagram"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="storeLocation__socialLink storeLocation__socialLink--tiktok"
                  aria-label="Follow us on TikTok"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  public render(): React.ReactNode {
    const data = this.props.data ?? DEFAULT_STORE_DATA;

    return (
      <section className="storeLocation" id="Location">
        <div className="storeLocation__container">
          {this.renderStoreInfo(data)}
        </div>
      </section>
    );
  }
}

export default StoreLocationSection;

/**
 * Contact Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import "../styles/ContactPage.css";
import type { ContactFormData, ContactFormStatus } from "../models/contact-page-model";
import { STORE_PROFILE } from "../config/store-profile";
import { CONTACT_INFO, SOCIAL_MEDIA, BUSINESS_HOURS } from "../constants/app-constants";
import { SocialIcon } from "../components/icons/SocialIcons";
import { PhoneIcon, EmailIcon, ClockIcon } from "../components/icons/UIIcons";
import ContactInfoItem from "../components/common/ContactInfoItem";
import FormField from "../components/common/FormField";
import AlertMessage from "../components/common/AlertMessage";
import LuxuryButton from "../components/buttons/LuxuryButton";
import WhatsAppButton from "../components/common/WhatsAppButton";

interface ContactPageViewProps {
  formData: ContactFormData;
  status: ContactFormStatus;
  errorMessage: string;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

/**
 * Contact Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const ContactPageView: React.FC<ContactPageViewProps> = ({
  formData,
  status,
  errorMessage,
  onFormChange,
  onFormSubmit,
}) => {
  return (
    <main className="contact-page">
      <div className="contact-container">
        <header className="contact-header reveal-on-scroll">
          <h1 className="contact-title gradient-text">Hubungi Kami</h1>
          <p className="contact-subtitle">
            Kami siap membantu Anda dengan berbagai kebutuhan bouquet, gift box, dan dekorasi
          </p>
        </header>

        <div className="contact-content">
          {/* Contact Information */}
          <section className="contact-info reveal-on-scroll">
            <div className="contact-info-card">
              <h2 className="contact-info-title">Informasi Kontak</h2>

              <div className="contact-info-list">
                <ContactInfoItem
                  icon={<PhoneIcon />}
                  label="Telepon"
                  value={CONTACT_INFO.phoneDisplay}
                  href={CONTACT_INFO.phoneLink}
                />
                <ContactInfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={CONTACT_INFO.email}
                  href={CONTACT_INFO.emailLink}
                />
                <ContactInfoItem
                  icon={<ClockIcon />}
                  label="Jam Operasional"
                  value={BUSINESS_HOURS.compact}
                />
                <ContactInfoItem
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                  label="Lokasi"
                  value={`${STORE_PROFILE.location.streetAddress}, ${STORE_PROFILE.location.subLocality}, ${STORE_PROFILE.location.locality}`}
                />
              </div>

              <div className="contact-social">
                <h3 className="contact-social-title">Ikuti Kami</h3>
                <div className="contact-social-list">
                  {SOCIAL_MEDIA.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-social-link"
                      aria-label={social.label}
                    >
                      <SocialIcon name={social.name} />
                      <span>{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="contact-map">
              <h3 className="contact-map-title">Lokasi Toko</h3>
              <div className="contact-map-container">
                <iframe
                  src={STORE_PROFILE.location.maps.embedUrl}
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: "20px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Giftforyou.idn"
                />
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="contact-form-section reveal-on-scroll">
            <div className="contact-form-card">
              <h2 className="contact-form-title">Kirim Pesan</h2>
              <p className="contact-form-subtitle">
                Isi form di bawah ini atau hubungi kami langsung via WhatsApp
              </p>

              <form onSubmit={onFormSubmit} className="contact-form">
                <div className="contact-form-row">
                  <FormField
                    label="Nama"
                    required
                    htmlFor="contact-name"
                    className="contact-form-group"
                  >
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={onFormChange}
                      className="contact-form-input"
                      required
                      placeholder="Masukkan nama Anda"
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    required
                    htmlFor="contact-email"
                    className="contact-form-group"
                  >
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={onFormChange}
                      className="contact-form-input"
                      required
                      placeholder="nama@email.com"
                    />
                  </FormField>
                </div>

                <div className="contact-form-row">
                  <FormField
                    label="Telepon"
                    htmlFor="contact-phone"
                    className="contact-form-group"
                  >
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={onFormChange}
                      className="contact-form-input"
                      placeholder="08xxxxxxxxxx"
                    />
                  </FormField>

                  <FormField
                    label="Subjek"
                    htmlFor="contact-subject"
                    className="contact-form-group"
                  >
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={onFormChange}
                      className="contact-form-input"
                    >
                      <option value="">Pilih Subjek</option>
                      <option value="Pemesanan">Pemesanan</option>
                      <option value="Pertanyaan Produk">Pertanyaan Produk</option>
                      <option value="Pengiriman">Pengiriman</option>
                      <option value="Pembayaran">Pembayaran</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </FormField>
                </div>

                <FormField
                  label="Pesan"
                  required
                  htmlFor="contact-message"
                  className="contact-form-group"
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={onFormChange}
                    className="contact-form-textarea"
                    required
                    rows={6}
                    placeholder="Tuliskan pesan Anda di sini..."
                  />
                </FormField>

                {errorMessage && (
                  <AlertMessage
                    variant="error"
                    message={errorMessage}
                    className="contact-form-error"
                  />
                )}

                {status === "success" && (
                  <AlertMessage
                    variant="success"
                    message="Pesan berhasil dikirim! Kami akan membuka WhatsApp untuk Anda."
                    className="contact-form-success"
                  />
                )}

                <div className="contact-form-actions">
                  <LuxuryButton
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={status === "loading"}
                    disabled={status === "loading"}
                    className="contact-form-submit"
                    icon={
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    }
                    iconPosition="left"
                  >
                    {status === "loading" ? "Mengirim..." : "Kirim via WhatsApp"}
                  </LuxuryButton>

                  <WhatsAppButton
                    href={`https://wa.me/${STORE_PROFILE.contact.phoneE164.replace(/\D/g, "")}`}
                    variant="secondary"
                    size="md"
                    className="contact-form-whatsapp"
                  >
                    Chat Langsung
                  </WhatsAppButton>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ContactPageView;

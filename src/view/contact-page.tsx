import React, { useState, useEffect } from "react";
import { setSeo } from "../utils/seo";
import { STORE_PROFILE } from "../config/store-profile";
import { CONTACT_INFO, SOCIAL_MEDIA, BUSINESS_HOURS } from "../constants/app-constants";
import { SocialIcon } from "../components/icons/SocialIcons";
import {
  PhoneIcon,
  EmailIcon,
  ClockIcon,
} from "../components/icons/UIIcons";
import "../styles/ContactPage.css";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setSeo({
      title: "Kontak Kami - Hubungi Giftforyou.idn | Florist Cirebon",
      description:
        "Hubungi Giftforyou.idn untuk pemesanan bouquet, gift box, dan stand acrylic. Kami siap membantu Anda dengan berbagai kebutuhan hadiah dan dekorasi. Lokasi: Cirebon, Jawa Barat.",
      keywords:
        "kontak giftforyou, hubungi florist cirebon, alamat toko bunga cirebon, telepon florist cirebon",
      path: "/contact",
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage("Mohon lengkapi semua field yang wajib diisi");
      setStatus("error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Format email tidak valid");
      setStatus("error");
      return;
    }

    try {
      // Create WhatsApp message
      const whatsappMessage = encodeURIComponent(
        `Halo ${STORE_PROFILE.brand.displayName},\n\n` +
        `Saya ingin menghubungi Anda melalui form kontak:\n\n` +
        `Nama: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Telepon: ${formData.phone || "-"}\n` +
        `Subjek: ${formData.subject || "Pertanyaan Umum"}\n\n` +
        `Pesan:\n${formData.message}`
      );

      // Open WhatsApp
      window.open(
        `https://wa.me/${STORE_PROFILE.contact.phoneE164.replace(/\D/g, "")}?text=${whatsappMessage}`,
        "_blank"
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
      setStatus("error");
    }
  };

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
                <a
                  href={CONTACT_INFO.phoneLink}
                  className="contact-info-item"
                  aria-label={`Telepon ${CONTACT_INFO.phoneDisplay}`}
                >
                  <div className="contact-info-icon">
                    <PhoneIcon />
                  </div>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Telepon</span>
                    <span className="contact-info-value">{CONTACT_INFO.phoneDisplay}</span>
                  </div>
                </a>

                <a
                  href={CONTACT_INFO.emailLink}
                  className="contact-info-item"
                  aria-label={`Email ${CONTACT_INFO.email}`}
                >
                  <div className="contact-info-icon">
                    <EmailIcon />
                  </div>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Email</span>
                    <span className="contact-info-value">{CONTACT_INFO.email}</span>
                  </div>
                </a>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <ClockIcon />
                  </div>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Jam Operasional</span>
                    <span className="contact-info-value">{BUSINESS_HOURS.compact}</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Lokasi</span>
                    <span className="contact-info-value">
                      {STORE_PROFILE.location.streetAddress}, {STORE_PROFILE.location.subLocality}, {STORE_PROFILE.location.locality}
                    </span>
                  </div>
                </div>
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

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label htmlFor="contact-name" className="contact-form-label">
                      Nama <span className="contact-form-required">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="contact-form-input"
                      required
                      placeholder="Masukkan nama Anda"
                    />
                  </div>

                  <div className="contact-form-group">
                    <label htmlFor="contact-email" className="contact-form-label">
                      Email <span className="contact-form-required">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="contact-form-input"
                      required
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="contact-form-row">
                  <div className="contact-form-group">
                    <label htmlFor="contact-phone" className="contact-form-label">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="contact-form-input"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div className="contact-form-group">
                    <label htmlFor="contact-subject" className="contact-form-label">
                      Subjek
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="contact-form-input"
                    >
                      <option value="">Pilih Subjek</option>
                      <option value="Pemesanan">Pemesanan</option>
                      <option value="Pertanyaan Produk">Pertanyaan Produk</option>
                      <option value="Pengiriman">Pengiriman</option>
                      <option value="Pembayaran">Pembayaran</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-message" className="contact-form-label">
                    Pesan <span className="contact-form-required">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="contact-form-textarea"
                    required
                    rows={6}
                    placeholder="Tuliskan pesan Anda di sini..."
                  />
                </div>

                {errorMessage && (
                  <div className="contact-form-error" role="alert">
                    {errorMessage}
                  </div>
                )}

                {status === "success" && (
                  <div className="contact-form-success" role="alert">
                    Pesan berhasil dikirim! Kami akan membuka WhatsApp untuk Anda.
                  </div>
                )}

                <div className="contact-form-actions">
                  <button
                    type="submit"
                    className="contact-form-submit"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <>
                        <svg
                          className="contact-form-spinner"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="32"
                            strokeDashoffset="32"
                          >
                            <animate
                              attributeName="stroke-dasharray"
                              dur="2s"
                              values="0 32;16 16;0 32;0 32"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="stroke-dashoffset"
                              dur="2s"
                              values="0;-16;-32;-32"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
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
                        Kirim via WhatsApp
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/${STORE_PROFILE.contact.phoneE164.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-form-whatsapp"
                  >
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
                    Chat Langsung
                  </a>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;


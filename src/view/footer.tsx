// src/view/footer.tsx - Optimized Footer Component
import React, { useEffect, useState } from "react";
import {
  BRAND_INFO,
  CONTACT_INFO,
  SOCIAL_MEDIA,
  QUICK_LINKS,
  BUSINESS_HOURS,
} from "../constants/app-constants";
import { SocialIcon } from "../components/icons/SocialIcons";
import {
  PhoneIcon,
  EmailIcon,
  ClockIcon,
  ArrowUpIcon,
} from "../components/icons/UIIcons";
import "../styles/Footer.css";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setShowBackToTop(y > 420);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribeStatus("success");
      setEmail("");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    } else {
      setSubscribeStatus("error");
      setTimeout(() => setSubscribeStatus("idle"), 3000);
    }
  };

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="footer" aria-label="Footer website">
      <div className="footer__container">
        {/* Main Content - 3 Columns */}
        <div className="footer__main">
          {/* Brand & About */}
          <div className="footer__section footer__section--brand">
            <div className="footer__brand">
              <img
                src={BRAND_INFO.logoPath}
                alt={`${BRAND_INFO.fullName} logo`}
                className="footer__logo"
                loading="lazy"
              />
              <div className="footer__brandText">
                <div className="footer__brandName">{BRAND_INFO.fullName}</div>
                <div className="footer__tagline">{BRAND_INFO.tagline}</div>
              </div>
            </div>
            <p className="footer__description">{BRAND_INFO.description}</p>
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h3 className="footer__sectionTitle">Tautan Cepat</h3>
            <nav aria-label="Footer navigation">
              <ul className="footer__linkList">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label} className="footer__linkItem">
                    <a href={link.href} className="footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="footer__section">
            <h3 className="footer__sectionTitle">Hubungi Kami</h3>
            <div className="footer__contactGroup">
              <a href={CONTACT_INFO.phoneLink} className="footer__contactItem">
                <PhoneIcon />
                <span>{CONTACT_INFO.phoneDisplay}</span>
              </a>
              <a href={CONTACT_INFO.emailLink} className="footer__contactItem">
                <EmailIcon />
                <span>{CONTACT_INFO.email}</span>
              </a>
              <div className="footer__hoursCompact">
                <ClockIcon />
                <span>{BUSINESS_HOURS.compact}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Newsletter Bar */}
        <div className="footer__secondary">
          <div className="footer__socialCompact">
            <span className="footer__socialLabel">Ikuti Kami:</span>
            <div className="footer__socialRow">
              {SOCIAL_MEDIA.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`footer__socialIcon footer__socialIcon--${platform.name.toLowerCase()}`}
                  aria-label={platform.label}
                  title={platform.name}
                >
                  <SocialIcon name={platform.name} className="footer__icon" />
                </a>
              ))}
            </div>
          </div>

          <div className="footer__newsletterCompact">
            <form
              onSubmit={handleNewsletterSubmit}
              className="footer__newsletterForm"
            >
              <input
                type="email"
                id="footer-newsletter-email"
                name="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Langganan newsletter"
                className="footer__newsletterInput"
                aria-label="Alamat email untuk newsletter"
                required
              />
              <button
                type="submit"
                className="footer__newsletterBtn"
                aria-label="Langganan"
              >
                Langganan
              </button>
            </form>
            {subscribeStatus === "success" && (
              <p
                className="footer__newsletterMessage footer__newsletterMessage--success"
                role="status"
                aria-live="polite"
              >
                Berhasil berlangganan!
              </p>
            )}
            {subscribeStatus === "error" && (
              <p
                className="footer__newsletterMessage footer__newsletterMessage--error"
                role="alert"
              >
                Email tidak valid
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} {BRAND_INFO.fullName}. Semua hak dilindungi.
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`footer__backToTop ${showBackToTop ? "footer__backToTop--visible" : ""}`}
        aria-label="Kembali ke atas"
        title="Kembali ke atas"
      >
        <ArrowUpIcon />
      </button>
    </footer>
  );
};

export default Footer;

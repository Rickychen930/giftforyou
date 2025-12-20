import React from "react";
import "../styles/Footer.css";

type SocialPlatform = {
  name: "Instagram" | "WhatsApp";
  url: string;
};

const socialPlatforms: SocialPlatform[] = [
  { name: "Instagram", url: "https://www.instagram.com/giftforyou.idn/?hl=en" },
  { name: "WhatsApp", url: "https://wa.me/6285161428911" },
];

function SocialIcon({ name }: { name: SocialPlatform["name"] }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="footer__icon">
        <path
          fill="currentColor"
          d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="footer__icon">
      <path
        fill="currentColor"
        d="M20.5 3.5A11 11 0 0 0 3.3 17.7L2 22l4.4-1.2A11 11 0 0 0 20.5 3.5ZM12 20a9 9 0 0 1-4.6-1.3l-.3-.2-2.6.7.7-2.5-.2-.3A9 9 0 1 1 12 20Zm5.2-6.6c-.3-.1-1.8-.9-2.1-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.5.1-.6l.6-.8c.1-.2.2-.4.3-.6a.6.6 0 0 0 0-.5c-.1-.1-.7-1.7-.9-2.3-.2-.6-.4-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3 4.9 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.3Z"
      />
    </svg>
  );
}

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Website footer">
      <div className="footer__container">
        {/* Brand */}
        <div className="footer__brand">
          <img
            src="/images/logo.png"
            alt="Giftforyou.idn logo"
            className="footer__logo"
            loading="lazy"
          />
          <div className="footer__brandText">
            <div className="footer__brandName">Giftforyou.idn</div>
            <div className="footer__tagline">
              Florist &amp; Gift Shop • Orchid Specialist
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="footer__block" aria-label="Contact information">
          <div className="footer__blockTitle">Contact</div>
          <address className="footer__address">
            <a className="footer__link" href="tel:+6285161428911">
              +62 851 6142 8911
            </a>
            <a
              className="footer__link"
              href="mailto:giftforyou.idn01@gmail.com"
            >
              giftforyou.idn01@gmail.com
            </a>
          </address>
        </div>

        {/* Social */}
        <div className="footer__block" aria-label="Social links">
          <div className="footer__blockTitle">Follow Us</div>

          {/* ✅ removed role="list" (ESLint CI error) */}
          <ul className="footer__socialLinks">
            {socialPlatforms.map((p) => (
              <li key={p.name} className="footer__socialItem">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`footer__socialBtn footer__socialBtn--${p.name.toLowerCase()}`}
                  aria-label={`Open ${p.name}`}
                  title={p.name}
                >
                  <SocialIcon name={p.name} />
                  <span className="footer__socialName">{p.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <div className="footer__bottom">
          <div className="footer__divider" />
          <p className="footer__copyright">
            © {year} Giftforyou.idn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

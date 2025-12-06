import React, { Component } from "react";
import "../styles/Footer.css";

interface SocialPlatform {
  name: string;
  icon: string;
  url: string;
  className: string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: "Instagram",
    icon: "📸",
    url: "https://www.instagram.com/giftforyou.idn/?hl=en",
    className: "instagram",
  },
  {
    name: "WhatsApp",
    icon: "💬",
    url: "https://api.whatsapp.com/message/IBVH7FPFONAFL1?autoload=1&app_absent=0",
    className: "whatsapp",
  },
];

class Footer extends Component {
  renderSocialLinks(): React.ReactNode {
    return (
      <div className="footer-social">
        {socialPlatforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`social-link ${platform.className}`}
          >
            <span className="social-icon">{platform.icon}</span>
            <span className="social-name">{platform.name}</span>
          </a>
        ))}
      </div>
    );
  }

  render(): React.ReactNode {
    return (
      <footer className="footer">
        <div className="footer-wrapper">
          <div className="footer-logo">
            <img src="/images/logo.png" alt="giftforyou.idn logo" />
          </div>

          <div className="footer-text">
            <p className="footer-brand">© 2025 giftforyou.idn</p>
            <p className="footer-rights">All rights reserved.</p>
          </div>

          <div className="footer-social-media">
            <div className="footer-social-media-text">Follow Us:</div>
            {this.renderSocialLinks()}
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;

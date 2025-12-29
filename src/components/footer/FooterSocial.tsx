import React from "react";
import "../../styles/footer/FooterSocial.css";
import { SOCIAL_MEDIA } from "../../constants/app-constants";
import { SocialIcon } from "../icons/SocialIcons";

const FooterSocial: React.FC = () => {
  return (
    <div className="footer-social">
      <span className="footer-social__label">Ikuti Kami:</span>
      <div className="footer-social__row">
        {SOCIAL_MEDIA.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`footer-social__icon footer-social__icon--${platform.name.toLowerCase()}`}
            aria-label={platform.label}
            title={platform.name}
          >
            <SocialIcon name={platform.name} className="footer-social__icon-svg" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default FooterSocial;


import React from "react";
import "../../styles/footer/FooterContact.css";
import { CONTACT_INFO, BUSINESS_HOURS } from "../../constants/app-constants";
import { PhoneIcon, EmailIcon, ClockIcon } from "../icons/UIIcons";

const FooterContact: React.FC = () => {
  return (
    <div className="footer-contact">
      <h3 className="footer-contact__title">Hubungi Kami</h3>
      <div className="footer-contact__group">
        <a href={CONTACT_INFO.phoneLink} className="footer-contact__item">
          <PhoneIcon />
          <span>{CONTACT_INFO.phoneDisplay}</span>
        </a>
        <a href={CONTACT_INFO.emailLink} className="footer-contact__item">
          <EmailIcon />
          <span>{CONTACT_INFO.email}</span>
        </a>
        <div className="footer-contact__hours">
          <ClockIcon />
          <span>{BUSINESS_HOURS.compact}</span>
        </div>
      </div>
    </div>
  );
};

export default FooterContact;


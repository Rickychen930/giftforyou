/**
 * Footer Contact Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/footer/FooterContact.css";
import { CONTACT_INFO, BUSINESS_HOURS } from "../../constants/app-constants";
import { PhoneIcon, EmailIcon, ClockIcon } from "../icons/UIIcons";

interface FooterContactState {
  // No state needed, but keeping for consistency
}

/**
 * Footer Contact Component
 * Class-based component for footer contact information
 */
class FooterContact extends Component<{}, FooterContactState> {
  private baseClass: string = "footer-contact";

  render(): React.ReactNode {
    return (
      <div className={this.baseClass}>
        <h3 className={`${this.baseClass}__title`}>Hubungi Kami</h3>
        <div className={`${this.baseClass}__group`}>
          <a href={CONTACT_INFO.phoneLink} className={`${this.baseClass}__item`}>
            <PhoneIcon />
            <span>{CONTACT_INFO.phoneDisplay}</span>
          </a>
          <a href={CONTACT_INFO.emailLink} className={`${this.baseClass}__item`}>
            <EmailIcon />
            <span>{CONTACT_INFO.email}</span>
          </a>
          <div className={`${this.baseClass}__hours`}>
            <ClockIcon />
            <span>{BUSINESS_HOURS.compact}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default FooterContact;

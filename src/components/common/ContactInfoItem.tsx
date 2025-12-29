/**
 * Contact Info Item Component
 * Luxury and responsive contact information item
 */

import React from "react";
import "../../styles/ContactInfoItem.css";

interface ContactInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}

/**
 * Contact Info Item Component
 * Luxury styled contact information item
 */
const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  icon,
  label,
  value,
  href,
  className = "",
}) => {
  const content = (
    <>
      <div className="contactInfoItem__icon">{icon}</div>
      <div className="contactInfoItem__content">
        <span className="contactInfoItem__label">{label}</span>
        <span className="contactInfoItem__value">{value}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`contactInfoItem contactInfoItem--link ${className}`}
        aria-label={`${label} ${value}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={`contactInfoItem ${className}`}>
      {content}
    </div>
  );
};

export default ContactInfoItem;


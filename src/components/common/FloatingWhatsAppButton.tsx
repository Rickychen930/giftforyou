/**
 * Floating WhatsApp Button Component (OOP)
 * Class-based component following SOLID principles
 * Luxury, elegant floating button for easy contact
 * Always visible with smooth animations
 */

import React, { Component } from "react";
import "../../styles/FloatingWhatsAppButton.css";
import { STORE_PROFILE } from "../../config/store-profile";

interface FloatingWhatsAppButtonState {
  isVisible: boolean;
  isHovered: boolean;
}

/**
 * Floating WhatsApp Button Component
 * Provides easy access to WhatsApp contact
 * Luxury design with smooth animations
 */
class FloatingWhatsAppButton extends Component<{}, FloatingWhatsAppButtonState> {
  private baseClass: string = "floatingWhatsApp";

  constructor(props: {}) {
    super(props);
    this.state = {
      isVisible: true,
      isHovered: false,
    };
  }

  private handleClick = (): void => {
    const whatsappUrl = STORE_PROFILE.whatsapp.url;
    const message = encodeURIComponent(
      "Halo Giftforyou.idn, saya tertarik dengan produk Anda. Bisa info lebih lanjut?"
    );
    window.open(`${whatsappUrl}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  private handleMouseEnter = (): void => {
    this.setState({ isHovered: true });
  };

  private handleMouseLeave = (): void => {
    this.setState({ isHovered: false });
  };

  render(): React.ReactNode {
    const { isVisible } = this.state;

    if (!isVisible) return null;

    return (
      <button
        className={this.baseClass}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        aria-label="Hubungi kami via WhatsApp"
        title="Chat via WhatsApp"
        type="button"
      >
        <div className={`${this.baseClass}__icon`}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className={`${this.baseClass}__label`}>Chat</span>
        <div className={`${this.baseClass}__ripple`} aria-hidden="true" />
      </button>
    );
  }
}

export default FloatingWhatsAppButton;


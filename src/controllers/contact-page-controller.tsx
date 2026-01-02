/**
 * Contact Page Controller
 * OOP-based controller for managing contact page state and form handling
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import {
  type ContactPageState,
  INITIAL_CONTACT_FORM_DATA,
  INITIAL_CONTACT_PAGE_STATE,
  DEFAULT_CONTACT_PAGE_SEO,
} from "../models/contact-page-model";
import { STORE_PROFILE } from "../config/store-profile";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import ContactPageView from "../view/contact-page";

interface ContactPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Contact Page Controller Class
 * Manages all business logic, form handling, and state for the contact page
 * Extends BaseController to avoid code duplication
 */
export class ContactPageController extends BaseController<
  ContactPageControllerProps,
  ContactPageState & BaseControllerState
> {
  private successTimeout: NodeJS.Timeout | null = null;

  constructor(props: ContactPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_CONTACT_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_CONTACT_PAGE_STATE,
    };
  }

  /**
   * Handle form field change
   */
  handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));
  };

  /**
   * Validate form data
   */
  private validateForm(): { isValid: boolean; errorMessage: string } {
    const { formData } = this.state;

    // Check required fields
    if (!formData.name || !formData.email || !formData.message) {
      return {
        isValid: false,
        errorMessage: "Mohon lengkapi semua field yang wajib diisi",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        isValid: false,
        errorMessage: "Format email tidak valid",
      };
    }

    return { isValid: true, errorMessage: "" };
  }

  /**
   * Build WhatsApp message from form data
   */
  private buildWhatsAppMessage(): string {
    const { formData } = this.state;
    return (
      `Halo ${STORE_PROFILE.brand.displayName},\n\n` +
      `Saya ingin menghubungi Anda melalui form kontak:\n\n` +
      `Nama: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Telepon: ${formData.phone || "-"}\n` +
      `Subjek: ${formData.subject || "Pertanyaan Umum"}\n\n` +
      `Pesan:\n${formData.message}`
    );
  }

  /**
   * Open WhatsApp with pre-filled message
   */
  private openWhatsApp(): void {
    const message = this.buildWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = STORE_PROFILE.contact.phoneE164.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  }

  /**
   * Reset form to initial state
   */
  private resetForm(): void {
    this.setState({
      formData: { ...INITIAL_CONTACT_FORM_DATA },
      status: "success",
      errorMessage: "",
    });

    // Reset status to idle after 3 seconds
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }

    this.successTimeout = setTimeout(() => {
      this.setState({ status: "idle" });
      this.successTimeout = null;
    }, 3000);
  }

  /**
   * Handle form submission
   */
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    this.setState({
      status: "loading",
      errorMessage: "",
    });

    // Validate form
    const validation = this.validateForm();
    if (!validation.isValid) {
      this.setState({
        status: "error",
        errorMessage: validation.errorMessage,
      });
      return;
    }

    try {
      // Open WhatsApp
      this.openWhatsApp();

      // Reset form
      this.resetForm();
    } catch (error) {
      this.setState({
        status: "error",
        errorMessage: "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  /**
   * Component lifecycle: Mount
   */
  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <ContactPageView
        formData={this.state.formData}
        status={this.state.status}
        errorMessage={this.state.errorMessage}
        onFormChange={this.handleChange}
        onFormSubmit={this.handleSubmit}
      />
    );
  }
}

export default ContactPageController;


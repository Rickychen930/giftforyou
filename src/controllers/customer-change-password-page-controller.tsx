/**
 * Customer Change Password Page Controller
 * OOP-based controller for managing customer change password page state and operations
 */

import React, { Component } from "react";
import { API_BASE } from "../config/api";
import { getAccessToken } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { setSeo } from "../utils/seo";
import {
  type ChangePasswordPageState,
  type ChangePasswordFormErrors,
  INITIAL_CHANGE_PASSWORD_PAGE_STATE,
  INITIAL_CHANGE_PASSWORD_FORM_DATA,
  INITIAL_PASSWORD_VISIBILITY,
  DEFAULT_CHANGE_PASSWORD_PAGE_SEO,
} from "../models/customer-change-password-page-model";
import CustomerChangePasswordPageView from "../view/customer-change-password-page";

interface CustomerChangePasswordPageControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Change Password Page Controller Class
 * Manages all business logic, form validation, and password change operations
 */
export class CustomerChangePasswordPageController extends Component<
  CustomerChangePasswordPageControllerProps,
  ChangePasswordPageState
> {
  private confettiTimeout: NodeJS.Timeout | null = null;

  constructor(props: CustomerChangePasswordPageControllerProps) {
    super(props);
    this.state = { ...INITIAL_CHANGE_PASSWORD_PAGE_STATE };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_CHANGE_PASSWORD_PAGE_SEO);
  }

  /**
   * Validate form
   */
  private validateForm(): boolean {
    const errors: ChangePasswordFormErrors = {};
    const { formData } = this.state;

    if (!formData.currentPassword) {
      errors.currentPassword = "Password saat ini wajib diisi";
    }

    if (!formData.newPassword) {
      errors.newPassword = "Password baru wajib diisi";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password minimal 8 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      errors.newPassword = "Password harus mengandung huruf besar, huruf kecil, dan angka";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = "Password baru harus berbeda dengan password saat ini";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle form field change
   */
  handleChange = (field: keyof ChangePasswordPageState["formData"], value: string): void => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [field]: value,
      },
      errors: {
        ...prevState.errors,
        [field]: undefined,
        general: undefined,
      },
      showSuccess: false,
    }));
  };

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility = (field: keyof ChangePasswordPageState["showPassword"]): void => {
    this.setState((prevState) => ({
      showPassword: {
        ...prevState.showPassword,
        [field]: !prevState.showPassword[field],
      },
    }));
  };

  /**
   * Handle form submission
   */
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setState({ isSaving: true, errors: {}, showSuccess: false });

    const token = getAccessToken();
    if (!token) {
      this.setState({
        errors: { general: "Tidak terautentikasi" },
        isSaving: false,
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/customer/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: this.state.formData.currentPassword,
          newPassword: this.state.formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          errors: {
            general: data.error || "Gagal mengubah password",
          },
          isSaving: false,
        });
        return;
      }

      this.setState({
        showSuccess: true,
        isSaving: false,
        showConfetti: true,
        formData: { ...INITIAL_CHANGE_PASSWORD_FORM_DATA },
        showPassword: { ...INITIAL_PASSWORD_VISIBILITY },
      });

      toast.success("Password berhasil diubah!");

      // Hide success message and confetti after 3 seconds
      if (this.confettiTimeout) {
        clearTimeout(this.confettiTimeout);
      }
      this.confettiTimeout = setTimeout(() => {
        this.setState({ showSuccess: false, showConfetti: false });
        this.confettiTimeout = null;
      }, 3000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to change password:", error);
      }
      this.setState({
        errors: {
          general: "Terjadi kesalahan. Silakan coba lagi nanti.",
        },
        isSaving: false,
      });
    }
  };

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.initializeSeo();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true, isLoading: false });
  }

  /**
   * Component lifecycle: Unmount
   */
  componentWillUnmount(): void {
    if (this.confettiTimeout) {
      clearTimeout(this.confettiTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerChangePasswordPageView
        formData={this.state.formData}
        errors={this.state.errors}
        isLoading={this.state.isLoading}
        isSaving={this.state.isSaving}
        isAuthenticated={this.state.isAuthenticated}
        showPassword={this.state.showPassword}
        showSuccess={this.state.showSuccess}
        showConfetti={this.state.showConfetti}
        onFormChange={this.handleChange}
        onTogglePasswordVisibility={this.togglePasswordVisibility}
        onFormSubmit={this.handleSubmit}
      />
    );
  }
}

export default CustomerChangePasswordPageController;


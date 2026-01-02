/**
 * Customer Profile Page Controller
 * OOP-based controller for managing customer profile page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { API_BASE } from "../config/api";
import { getAccessToken, clearAuth } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import {
  type ProfilePageState,
  type ProfileFormErrors,
  INITIAL_PROFILE_PAGE_STATE,
  DEFAULT_PROFILE_PAGE_SEO,
} from "../models/customer-profile-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import CustomerProfilePageView from "../view/customer-profile-page";

interface CustomerProfilePageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Profile Page Controller Class
 * Manages all business logic, form validation, and profile operations
 * Extends BaseController to avoid code duplication
 */
export class CustomerProfilePageController extends BaseController<
  CustomerProfilePageControllerProps,
  ProfilePageState & BaseControllerState
> {
  private confettiTimeout: NodeJS.Timeout | null = null;

  constructor(props: CustomerProfilePageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_PROFILE_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_PROFILE_PAGE_STATE,
    };
  }

  /**
   * Load profile data
   */
  private loadProfile = async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await this.safeFetch(`${API_BASE}/api/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.ok) {
        const text = await response.text();
        const data = this.safeJsonParse<any>(text, {});
        this.setState({
          user: data,
          formData: {
            fullName: data.fullName || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
          },
          isLoading: false,
        });
      } else if (response && response.status === 401) {
        clearAuth();
        this.setState({ isAuthenticated: false, isLoading: false });
      } else {
        this.setState({
          errors: { general: "Gagal memuat profil" },
          isLoading: false,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load profile:", error);
      }
      this.setState({
        errors: { general: "Terjadi kesalahan saat memuat profil" },
        isLoading: false,
      });
    }
  };

  /**
   * Validate form
   */
  private validateForm(): boolean {
    const errors: ProfileFormErrors = {};
    const { formData } = this.state;

    if (!formData.fullName.trim()) {
      errors.fullName = "Nama lengkap wajib diisi";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }

    if (formData.address.trim() && formData.address.trim().length < 10) {
      errors.address = "Alamat minimal 10 karakter";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle form field change
   */
  handleChange = (field: keyof ProfilePageState["formData"], value: string): void => {
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
   * Handle address change
   */
  handleAddressChange = (address: string): void => {
    this.handleChange("address", address);
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
      const response = await this.safeFetch(`${API_BASE}/api/customer/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(this.state.formData),
      });

      if (!response) {
        this.setState({
          errors: { general: "Gagal menyimpan profil" },
          isSaving: false,
        });
        return;
      }

      const text = await response.text();
      const data = this.safeJsonParse<any>(text, {});

      if (!response.ok) {
        this.setState({
          errors: {
            general: data.error || "Gagal memperbarui profil",
          },
          isSaving: false,
        });
        return;
      }

      this.setState({
        showSuccess: true,
        isSaving: false,
        lastSaved: new Date(),
        showConfetti: true,
        user: {
          ...this.state.user!,
          ...this.state.formData,
        },
      });

      toast.success("Profil berhasil diperbarui!");

      // Hide confetti after animation
      if (this.confettiTimeout) {
        clearTimeout(this.confettiTimeout);
      }
      this.confettiTimeout = setTimeout(() => {
        this.setState({ showConfetti: false });
        this.confettiTimeout = null;
      }, 3000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update profile:", error);
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
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true });
    this.loadProfile();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.confettiTimeout) {
      clearTimeout(this.confettiTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerProfilePageView
        user={this.state.user}
        formData={this.state.formData}
        errors={this.state.errors}
        isLoading={this.state.isLoading}
        isSaving={this.state.isSaving}
        isAuthenticated={this.state.isAuthenticated}
        showSuccess={this.state.showSuccess}
        lastSaved={this.state.lastSaved}
        showConfetti={this.state.showConfetti}
        onFormChange={this.handleChange}
        onAddressChange={this.handleAddressChange}
        onFormSubmit={this.handleSubmit}
      />
    );
  }
}

export default CustomerProfilePageController;


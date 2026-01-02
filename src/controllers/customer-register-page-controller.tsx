/**
 * Customer Register Page Controller
 * OOP-based controller for managing customer register page state and registration
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { API_BASE } from "../config/api";
import { setTokens } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import {
  type RegisterPageState,
  type RegisterFormErrors,
  INITIAL_REGISTER_PAGE_STATE,
  DEFAULT_REGISTER_PAGE_SEO,
} from "../models/customer-register-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import CustomerRegisterPageView from "../view/customer-register-page";

interface CustomerRegisterPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Register Page Controller Class
 * Manages all business logic, form validation, and registration
 * Extends BaseController to avoid code duplication
 */
export class CustomerRegisterPageController extends BaseController<
  CustomerRegisterPageControllerProps,
  RegisterPageState & BaseControllerState
> {
  constructor(props: CustomerRegisterPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_REGISTER_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_REGISTER_PAGE_STATE,
    };
  }

  /**
   * Validate form
   */
  private validateForm(): boolean {
    const errors: RegisterFormErrors = {};
    const { formData } = this.state;

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      errors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username hanya boleh huruf, angka, dan underscore";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Format email tidak valid";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Password harus mengandung huruf besar, huruf kecil, dan angka";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    // Full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Nama lengkap wajib diisi";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter";
    }

    // Phone number
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }

    // Terms agreement
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle form field change
   */
  handleChange = (field: keyof RegisterPageState["formData"] | "showPassword" | "showConfirmPassword", value: string | boolean): void => {
    if (field === "showPassword") {
      this.setState({ showPassword: value as boolean });
    } else if (field === "showConfirmPassword") {
      this.setState({ showConfirmPassword: value as boolean });
    } else {
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
      }));
    }
  };

  /**
   * Handle form submission
   */
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!this.validateForm()) {
      const firstError = Object.keys(this.state.errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          (element as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
          (element as HTMLElement).focus();
        }
      }
      return;
    }

    this.setState({ isLoading: true, errors: {} });

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.state.formData.username.trim(),
          email: this.state.formData.email.trim().toLowerCase(),
          password: this.state.formData.password,
          fullName: this.state.formData.fullName.trim(),
          phoneNumber: this.state.formData.phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          errors: {
            general: data.error || "Registrasi gagal. Silakan coba lagi.",
            ...(data.field && { [data.field]: data.error }),
          },
          isLoading: false,
        });
        return;
      }

      // Auto login after registration
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.state.formData.username.trim(),
          password: this.state.formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.token) {
        setTokens(loginData.token, loginData.refreshToken);
        this.setState({ showConfetti: true });
        toast.success("Registrasi berhasil! Selamat datang!");
        // Redirect to customer dashboard after confetti
        setTimeout(() => {
          window.location.href = "/customer/dashboard";
        }, 1500);
      } else {
        // Registration successful but auto-login failed, redirect to login
        toast.success("Registrasi berhasil! Silakan masuk dengan akun Anda.");
        window.location.href = "/customer/login?registered=true";
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Registration error:", error);
      }
      this.setState({
        errors: {
          general: "Terjadi kesalahan. Silakan coba lagi nanti.",
        },
        isLoading: false,
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
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerRegisterPageView
        formData={this.state.formData}
        errors={this.state.errors}
        isLoading={this.state.isLoading}
        showPassword={this.state.showPassword}
        showConfirmPassword={this.state.showConfirmPassword}
        showConfetti={this.state.showConfetti}
        onFormChange={this.handleChange}
        onFormSubmit={this.handleSubmit}
      />
    );
  }
}

export default CustomerRegisterPageController;


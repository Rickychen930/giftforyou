/**
 * Customer Login Page Controller
 * OOP-based controller for managing customer login page state and authentication
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import { setTokens } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import { initializeGoogleSignIn, triggerGoogleSignIn } from "../utils/google-oauth";
import {
  type LoginPageState,
  INITIAL_LOGIN_PAGE_STATE,
  DEFAULT_LOGIN_PAGE_SEO,
} from "../models/customer-login-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import CustomerLoginPageView from "../view/customer-login-page";

interface CustomerLoginPageControllerProps extends BaseControllerProps {
  searchParams: URLSearchParams;
}

/**
 * Customer Login Page Controller Class
 * Manages all business logic, authentication, and state for the login page
 * Extends BaseController to avoid code duplication
 */
export class CustomerLoginPageController extends BaseController<
  CustomerLoginPageControllerProps,
  LoginPageState & BaseControllerState
> {
  constructor(props: CustomerLoginPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_LOGIN_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_LOGIN_PAGE_STATE,
    };
  }

  /**
   * Load saved username if remember me was checked
   */
  private loadSavedUsername(): void {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      this.setState({
        formData: {
          ...this.state.formData,
          username: savedUsername,
          rememberMe: true,
        },
      });
    }
  }

  /**
   * Initialize Google Sign-In
   */
  private initializeGoogleAuth(): void {
    initializeGoogleSignIn(
      (credential) => {
        this.handleGoogleLogin(credential);
      },
      (error) => {
        // Only log in development, don't show error to user
        if (process.env.NODE_ENV === "development") {
          console.warn("Google Sign-In initialization:", error.message);
        }
      }
    );
  }

  /**
   * Handle form field change
   */
  handleChange = (field: keyof LoginPageState["formData"] | "showPassword", value: string | boolean): void => {
    if (field === "showPassword") {
      this.setState({ showPassword: value as boolean });
    } else {
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          [field]: value,
        },
        error: "",
      }));
    }
  };

  /**
   * Validate form
   */
  private validateForm(): boolean {
    const { username, password } = this.state.formData;
    if (!username.trim() || !password) {
      this.setState({ error: "Username dan password wajib diisi" });
      return false;
    }
    return true;
  }

  /**
   * Handle form submission
   */
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setState({ isLoading: true, error: "" });

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.state.formData.username.trim(),
          password: this.state.formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          error: data.error || "Username atau password salah",
          isLoading: false,
        });
        return;
      }

      // Save tokens
      if (data.token) {
        setTokens(data.token, data.refreshToken);

        // Save username if remember me is checked
        if (this.state.formData.rememberMe) {
          localStorage.setItem("rememberedUsername", this.state.formData.username.trim());
        } else {
          localStorage.removeItem("rememberedUsername");
        }

        // Check user role and redirect accordingly
        try {
          const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));
          const role = tokenPayload.role;

          toast.success("Login berhasil! Selamat datang kembali!");

          if (role === "admin") {
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 500);
          } else {
            setTimeout(() => {
              window.location.href = "/customer/dashboard";
            }, 500);
          }
        } catch {
          // Default to customer dashboard
          toast.success("Login berhasil!");
          setTimeout(() => {
            window.location.href = "/customer/dashboard";
          }, 500);
        }
      } else {
        this.setState({
          error: "Login gagal. Silakan coba lagi.",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      this.setState({
        error: "Terjadi kesalahan. Silakan coba lagi nanti.",
        isLoading: false,
      });
    }
  };

  /**
   * Handle Google login
   */
  handleGoogleLogin = async (credential: string): Promise<void> => {
    this.setState({ googleLoading: true, error: "" });

    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.setState({
          error: data.error || "Login dengan Google gagal",
          googleLoading: false,
        });
        return;
      }

      // Save tokens
      if (data.token) {
        setTokens(data.token, data.refreshToken);

        // Check user role and redirect accordingly
        try {
          const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));
          const role = tokenPayload.role;

          toast.success("Login dengan Google berhasil! Selamat datang!");

          if (role === "admin") {
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 500);
          } else {
            setTimeout(() => {
              window.location.href = "/customer/dashboard";
            }, 500);
          }
        } catch {
          // Default to customer dashboard
          toast.success("Login dengan Google berhasil!");
          setTimeout(() => {
            window.location.href = "/customer/dashboard";
          }, 500);
        }
      } else {
        this.setState({
          error: "Login gagal. Silakan coba lagi.",
          googleLoading: false,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      this.setState({
        error: "Terjadi kesalahan. Silakan coba lagi nanti.",
        googleLoading: false,
      });
    }
  };

  /**
   * Handle Google sign-in trigger
   */
  handleGoogleSignIn = (): void => {
    if (!this.state.googleLoading && !this.state.isLoading) {
      triggerGoogleSignIn();
    }
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.loadSavedUsername();
    this.initializeGoogleAuth();
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const registered = this.props.searchParams.get("registered") === "true";

    return (
      <CustomerLoginPageView
        formData={this.state.formData}
        error={this.state.error}
        isLoading={this.state.isLoading}
        showPassword={this.state.showPassword}
        googleLoading={this.state.googleLoading}
        registered={registered}
        onFormChange={this.handleChange}
        onFormSubmit={this.handleSubmit}
        onGoogleSignIn={this.handleGoogleSignIn}
      />
    );
  }
}

/**
 * Wrapper component to use useSearchParams hook
 */
const CustomerLoginPageControllerWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();

  return <CustomerLoginPageController searchParams={searchParams} />;
};

export default CustomerLoginPageControllerWrapper;


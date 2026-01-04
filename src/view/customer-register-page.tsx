import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/CustomerAuthPage.css";
import { setSeo } from "../utils/seo";
import { API_BASE } from "../config/api";
import { setTokens } from "../utils/auth-utils";
import { STORE_PROFILE } from "../config/store-profile";
import ConfettiEffect from "../components/ConfettiEffect";
import { toast } from "../utils/toast";

interface RegisterState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  agreeToTerms: boolean;
  errors: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    phoneNumber?: string;
    agreeToTerms?: string;
    general?: string;
  };
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showConfetti: boolean;
}

class CustomerRegisterPage extends Component<{}, RegisterState> {
  state: RegisterState = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    agreeToTerms: false,
    errors: {},
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    showConfetti: false,
  };

  componentDidMount(): void {
    setSeo({
      title: "Daftar Akun | Giftforyou.idn",
      description: "Buat akun baru untuk akses penuh ke marketplace bouquet dan florist terbaik.",
      path: "/register",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  private validateForm = (): boolean => {
    const errors: RegisterState["errors"] = {};

    // Username validation
    if (!this.state.username.trim()) {
      errors.username = "Username wajib diisi";
    } else if (this.state.username.length < 3) {
      errors.username = "Username minimal 3 karakter";
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.state.username)) {
      errors.username = "Username hanya boleh huruf, angka, dan underscore";
    }

    // Email validation
    if (!this.state.email.trim()) {
      errors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email)) {
      errors.email = "Format email tidak valid";
    }

    // Password validation
    if (!this.state.password) {
      errors.password = "Password wajib diisi";
    } else if (this.state.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.state.password)) {
      errors.password = "Password harus mengandung huruf besar, huruf kecil, dan angka";
    }

    // Confirm password
    if (!this.state.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (this.state.password !== this.state.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    // Full name
    if (!this.state.fullName.trim()) {
      errors.fullName = "Nama lengkap wajib diisi";
    } else if (this.state.fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter";
    }

    // Phone number
    if (!this.state.phoneNumber.trim()) {
      errors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(this.state.phoneNumber)) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }

    // Terms agreement
    if (!this.state.agreeToTerms) {
      errors.agreeToTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  private handleChange = (field: keyof RegisterState, value: string | boolean): void => {
    this.setState((prevState) => ({
      ...prevState,
      [field]: value,
      errors: {
        ...prevState.errors,
        [field]: undefined,
        general: undefined,
      },
    }));
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
          username: this.state.username.trim(),
          email: this.state.email.trim().toLowerCase(),
          password: this.state.password,
          fullName: this.state.fullName.trim(),
          phoneNumber: this.state.phoneNumber.trim(),
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
          username: this.state.username.trim(),
          password: this.state.password,
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

  render(): React.ReactNode {
    const { errors, isLoading, showPassword, showConfirmPassword, showConfetti } = this.state;

    return (
      <section className="customerAuthPage">
        <ConfettiEffect trigger={showConfetti} />
        <div className="customerAuthPage__background">
          <div className="customerAuthPage__gradient"></div>
        </div>

        <div className="customerAuthPage__container">
          <div className="customerAuthCard">
            <div className="customerAuthCard__header">
              <Link to="/" className="customerAuthCard__logo">
                <img
                  src={STORE_PROFILE.brand.logoPath}
                  alt={STORE_PROFILE.brand.displayName}
                  loading="eager"
                />
              </Link>
              <h1 className="customerAuthCard__title">Buat Akun Baru</h1>
              <p className="customerAuthCard__subtitle">
                Bergabunglah dengan komunitas pecinta bunga dan hadiah terbaik
              </p>
            </div>

            {errors.general && (
              <div className="customerAuthCard__error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{errors.general}</span>
              </div>
            )}

            <form className="customerAuthForm" onSubmit={this.handleSubmit} noValidate>
              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Nama Lengkap
                  <span className="customerAuthForm__required">*</span>
                </label>
                <input
                  type="text"
                  id="register-full-name"
                  name="fullName"
                  className={`customerAuthForm__input ${errors.fullName ? "customerAuthForm__input--error" : ""}`}
                  value={this.state.fullName}
                  onChange={(e) => this.handleChange("fullName", e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <span className="customerAuthForm__error" id="fullName-error" role="alert">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Username
                  <span className="customerAuthForm__required">*</span>
                </label>
                <input
                  type="text"
                  id="register-username"
                  name="username"
                  className={`customerAuthForm__input ${errors.username ? "customerAuthForm__input--error" : ""}`}
                  value={this.state.username}
                  onChange={(e) => this.handleChange("username", e.target.value)}
                  placeholder="Pilih username unik"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
                {errors.username && (
                  <span className="customerAuthForm__error" id="username-error" role="alert">
                    {errors.username}
                  </span>
                )}
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Email
                  <span className="customerAuthForm__required">*</span>
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  className={`customerAuthForm__input ${errors.email ? "customerAuthForm__input--error" : ""}`}
                  value={this.state.email}
                  onChange={(e) => this.handleChange("email", e.target.value)}
                  placeholder="nama@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <span className="customerAuthForm__error" id="email-error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Nomor Telepon
                  <span className="customerAuthForm__required">*</span>
                </label>
                <input
                  type="tel"
                  id="register-phone-number"
                  name="phoneNumber"
                  className={`customerAuthForm__input ${errors.phoneNumber ? "customerAuthForm__input--error" : ""}`}
                  value={this.state.phoneNumber}
                  onChange={(e) => this.handleChange("phoneNumber", e.target.value)}
                  placeholder="081234567890"
                  aria-invalid={!!errors.phoneNumber}
                  aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                />
                {errors.phoneNumber && (
                  <span className="customerAuthForm__error" id="phoneNumber-error" role="alert">
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Password
                  <span className="customerAuthForm__required">*</span>
                </label>
                <div className="customerAuthForm__passwordWrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="register-password"
                    name="password"
                    className={`customerAuthForm__input ${errors.password ? "customerAuthForm__input--error" : ""}`}
                    value={this.state.password}
                    onChange={(e) => this.handleChange("password", e.target.value)}
                    placeholder="Minimal 8 karakter"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="customerAuthForm__passwordToggle"
                    onClick={() => this.handleChange("showPassword", !showPassword)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <span className="customerAuthForm__error" id="password-error" role="alert">
                    {errors.password}
                  </span>
                )}
                <span className="customerAuthForm__hint">
                  Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
                </span>
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Konfirmasi Password
                  <span className="customerAuthForm__required">*</span>
                </label>
                <div className="customerAuthForm__passwordWrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="register-confirm-password"
                    name="confirmPassword"
                    className={`customerAuthForm__input ${errors.confirmPassword ? "customerAuthForm__input--error" : ""}`}
                    value={this.state.confirmPassword}
                    onChange={(e) => this.handleChange("confirmPassword", e.target.value)}
                    placeholder="Ulangi password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  />
                  <button
                    type="button"
                    className="customerAuthForm__passwordToggle"
                    onClick={() => this.handleChange("showConfirmPassword", !showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {showConfirmPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="customerAuthForm__error" id="confirmPassword-error" role="alert">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__checkbox">
                  <input
                    type="checkbox"
                    id="register-agree-to-terms"
                    name="agreeToTerms"
                    checked={this.state.agreeToTerms}
                    onChange={(e) => this.handleChange("agreeToTerms", e.target.checked)}
                    aria-invalid={!!errors.agreeToTerms}
                    aria-describedby={errors.agreeToTerms ? "agreeToTerms-error" : undefined}
                  />
                  <span>
                    Saya menyetujui{" "}
                    <Link to="/terms" className="customerAuthForm__link">
                      Syarat & Ketentuan
                    </Link>{" "}
                    dan{" "}
                    <Link to="/privacy" className="customerAuthForm__link">
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <span className="customerAuthForm__error" id="agreeToTerms-error" role="alert">
                    {errors.agreeToTerms}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`customerAuthForm__submit btn-luxury ${isLoading ? "customerAuthForm__submit--loading" : ""}`}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="customerAuthForm__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Mendaftar...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 8v6M23 11l-3-3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Daftar Sekarang</span>
                  </>
                )}
              </button>
            </form>

            <div className="customerAuthCard__footer">
              <p>
                Sudah punya akun?{" "}
                <Link to="/customer/login" className="customerAuthCard__link">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CustomerRegisterPage;


import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/CustomerAuthPage.css";
import { setSeo } from "../utils/seo";
import { API_BASE } from "../config/api";
import { setTokens } from "../utils/auth-utils";
import { STORE_PROFILE } from "../config/store-profile";
import { toast } from "../utils/toast";

interface LoginState {
  username: string;
  password: string;
  rememberMe: boolean;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
}

class CustomerLoginPage extends Component<{}, LoginState> {
  state: LoginState = {
    username: "",
    password: "",
    rememberMe: false,
    error: "",
    isLoading: false,
    showPassword: false,
  };

  componentDidMount(): void {
    setSeo({
      title: "Masuk ke Akun | Giftforyou.idn",
      description: "Masuk ke akun Anda untuk akses penuh ke marketplace bouquet dan florist.",
      path: "/customer/login",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Check if redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("registered") === "true") {
      // Success message will be shown in the UI based on URL parameter
    }

    // Load saved username if remember me was checked
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      this.setState({ username: savedUsername, rememberMe: true });
    }
  }

  private handleChange = (field: keyof LoginState, value: string | boolean): void => {
    this.setState((prevState) => ({
      ...prevState,
      [field]: value,
      error: "",
    }));
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!this.state.username.trim() || !this.state.password) {
      this.setState({ error: "Username dan password wajib diisi" });
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
          username: this.state.username.trim(),
          password: this.state.password,
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
        if (this.state.rememberMe) {
          localStorage.setItem("rememberedUsername", this.state.username.trim());
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

  render(): React.ReactNode {
    const { username, password, rememberMe, error, isLoading, showPassword } = this.state;
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get("registered") === "true";

    return (
      <section className="customerAuthPage">
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
              <h1 className="customerAuthCard__title">Masuk ke Akun</h1>
              <p className="customerAuthCard__subtitle">
                Selamat datang kembali! Masuk untuk melanjutkan belanja
              </p>
            </div>

            {registered && (
              <div className="customerAuthCard__success" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Registrasi berhasil! Silakan masuk dengan akun Anda.</span>
              </div>
            )}

            {error && (
              <div className="customerAuthCard__error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="customerAuthForm" onSubmit={this.handleSubmit} noValidate>
              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Username atau Email
                  <span className="customerAuthForm__required">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  className="customerAuthForm__input"
                  value={username}
                  onChange={(e) => this.handleChange("username", e.target.value)}
                  placeholder="Masukkan username atau email"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__label">
                  Password
                  <span className="customerAuthForm__required">*</span>
                </label>
                <div className="customerAuthForm__passwordWrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="customerAuthForm__input"
                    value={password}
                    onChange={(e) => this.handleChange("password", e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
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
                <div className="customerAuthForm__actions">
                  <label className="customerAuthForm__checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => this.handleChange("rememberMe", e.target.checked)}
                    />
                    <span>Ingat saya</span>
                  </label>
                  <Link to="/customer/forgot-password" className="customerAuthForm__forgotLink">
                    Lupa password?
                  </Link>
                </div>
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
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Masuk</span>
                  </>
                )}
              </button>
            </form>

            <div className="customerAuthCard__divider">
              <span>atau</span>
            </div>

            <div className="customerAuthCard__social">
              <button type="button" className="customerAuthCard__socialBtn" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            </div>

            <div className="customerAuthCard__footer">
              <p>
                Belum punya akun?{" "}
                <Link to="/customer/register" className="customerAuthCard__link">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CustomerLoginPage;


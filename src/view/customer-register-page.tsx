/**
 * Customer Register Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/CustomerAuthPage.css";
import { STORE_PROFILE } from "../config/store-profile";
import ConfettiEffect from "../components/common/ConfettiEffect";
import type { RegisterFormData, RegisterFormErrors } from "../models/customer-register-page-model";
import PasswordInput from "../components/common/PasswordInput";
import FormField from "../components/common/FormField";
import AlertMessage from "../components/common/AlertMessage";
import LuxuryButton from "../components/buttons/LuxuryButton";

interface CustomerRegisterPageViewProps {
  formData: RegisterFormData;
  errors: RegisterFormErrors;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  showConfetti: boolean;
  onFormChange: (field: keyof RegisterFormData | "showPassword" | "showConfirmPassword", value: string | boolean) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

/**
 * Customer Register Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CustomerRegisterPageView extends Component<CustomerRegisterPageViewProps> {
  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      formData,
      errors,
      isLoading,
      showPassword,
      showConfirmPassword,
      showConfetti,
      onFormChange,
      onFormSubmit,
    } = this.props;

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
              <AlertMessage
                variant="error"
                message={errors.general}
                className="customerAuthCard__error"
              />
            )}

            <form className="customerAuthForm" onSubmit={onFormSubmit} noValidate>
              <FormField
                label="Nama Lengkap"
                required
                htmlFor="register-full-name"
                error={errors.fullName}
                className="customerAuthForm__group"
              >
                <input
                  type="text"
                  id="register-full-name"
                  name="fullName"
                  className={`customerAuthForm__input ${errors.fullName ? "customerAuthForm__input--error" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => onFormChange("fullName", e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </FormField>

              <FormField
                label="Username"
                required
                htmlFor="register-username"
                error={errors.username}
                className="customerAuthForm__group"
              >
                <input
                  type="text"
                  id="register-username"
                  name="username"
                  className={`customerAuthForm__input ${errors.username ? "customerAuthForm__input--error" : ""}`}
                  value={formData.username}
                  onChange={(e) => onFormChange("username", e.target.value)}
                  placeholder="Pilih username unik"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? "username-error" : undefined}
                />
              </FormField>

              <FormField
                label="Email"
                required
                htmlFor="register-email"
                error={errors.email}
                className="customerAuthForm__group"
              >
                <input
                  type="email"
                  id="register-email"
                  name="email"
                  className={`customerAuthForm__input ${errors.email ? "customerAuthForm__input--error" : ""}`}
                  value={formData.email}
                  onChange={(e) => onFormChange("email", e.target.value)}
                  placeholder="nama@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </FormField>

              <FormField
                label="Nomor Telepon"
                required
                htmlFor="register-phone"
                error={errors.phoneNumber}
                className="customerAuthForm__group"
              >
                <input
                  type="tel"
                  id="register-phone"
                  name="phoneNumber"
                  className={`customerAuthForm__input ${errors.phoneNumber ? "customerAuthForm__input--error" : ""}`}
                  value={formData.phoneNumber}
                  onChange={(e) => onFormChange("phoneNumber", e.target.value)}
                  placeholder="081234567890"
                  aria-invalid={!!errors.phoneNumber}
                  aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                />
              </FormField>

              <FormField
                label="Password"
                required
                htmlFor="register-password"
                error={errors.password}
                hint="Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
                className="customerAuthForm__group"
              >
                <PasswordInput
                  id="register-password"
                  name="password"
                  className={`customerAuthForm__input ${errors.password ? "customerAuthForm__input--error" : ""}`}
                  value={formData.password}
                  onChange={(e) => onFormChange("password", e.target.value)}
                  placeholder="Minimal 8 karakter"
                  showPassword={showPassword}
                  onToggleVisibility={() => onFormChange("showPassword", !showPassword)}
                  error={errors.password}
                  hint="Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
                />
              </FormField>

              <FormField
                label="Konfirmasi Password"
                required
                htmlFor="register-confirm-password"
                error={errors.confirmPassword}
                className="customerAuthForm__group"
              >
                <PasswordInput
                  id="register-confirm-password"
                  name="confirmPassword"
                  className={`customerAuthForm__input ${errors.confirmPassword ? "customerAuthForm__input--error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => onFormChange("confirmPassword", e.target.value)}
                  placeholder="Ulangi password"
                  showPassword={showConfirmPassword}
                  onToggleVisibility={() => onFormChange("showConfirmPassword", !showConfirmPassword)}
                  error={errors.confirmPassword}
                />
              </FormField>

              <div className="customerAuthForm__group">
                <label className="customerAuthForm__checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => onFormChange("agreeToTerms", e.target.checked)}
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

              <LuxuryButton
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className={`customerAuthForm__submit ${isLoading ? "customerAuthForm__submit--loading" : ""}`}
                disabled={isLoading}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 8v6M23 11l-3-3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                }
                iconPosition="left"
              >
                {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </LuxuryButton>
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

export default CustomerRegisterPageView;

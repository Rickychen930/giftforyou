/**
 * Customer Change Password Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerChangePasswordPage.css";
import ConfettiEffect from "../components/ConfettiEffect";
import type {
  ChangePasswordFormData,
  ChangePasswordFormErrors,
  PasswordVisibility,
} from "../models/customer-change-password-page-model";

interface CustomerChangePasswordPageViewProps {
  formData: ChangePasswordFormData;
  errors: ChangePasswordFormErrors;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showPassword: PasswordVisibility;
  showSuccess: boolean;
  showConfetti: boolean;
  onFormChange: (field: keyof ChangePasswordFormData, value: string) => void;
  onTogglePasswordVisibility: (field: keyof PasswordVisibility) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

/**
 * Customer Change Password Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const CustomerChangePasswordPageView: React.FC<CustomerChangePasswordPageViewProps> = ({
  formData,
  errors,
  isLoading,
  isSaving,
  isAuthenticated,
  showPassword,
  showSuccess,
  showConfetti,
  onFormChange,
  onTogglePasswordVisibility,
  onFormSubmit,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  if (isLoading) {
    return (
      <section className="customerChangePassword customerChangePassword--loading">
        <div className="customerChangePassword__loading">
          <div className="customerChangePassword__spinner"></div>
          <p>Memuat...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="customerChangePassword" aria-labelledby="change-password-title">
      <ConfettiEffect trigger={showConfetti} />
      <div className="customerChangePassword__container">
        <div className="customerChangePassword__header">
          <Link to="/customer/dashboard" className="customerChangePassword__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 id="change-password-title" className="customerChangePassword__title">Ubah Password</h1>
          <p className="customerChangePassword__subtitle">
            Pastikan password baru Anda kuat dan mudah diingat
          </p>
        </div>

        {showSuccess && (
          <div className="customerChangePassword__success" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Password berhasil diubah!</span>
          </div>
        )}

        {errors.general && (
          <div className="customerChangePassword__error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        <div className="customerChangePassword__card">
          <form className="customerChangePassword__form" onSubmit={onFormSubmit}>
            <div className="customerChangePassword__formGroup">
              <label className="customerChangePassword__label">
                Password Saat Ini
                <span className="customerChangePassword__required">*</span>
              </label>
              <div className="customerChangePassword__passwordWrapper">
                <input
                  type={showPassword.current ? "text" : "password"}
                  className={`customerChangePassword__input ${errors.currentPassword ? "customerChangePassword__input--error" : ""}`}
                  value={formData.currentPassword}
                  onChange={(e) => onFormChange("currentPassword", e.target.value)}
                  placeholder="Masukkan password saat ini"
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                />
                <button
                  type="button"
                  className="customerChangePassword__passwordToggle"
                  onClick={() => onTogglePasswordVisibility("current")}
                  aria-label={showPassword.current ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    {showPassword.current ? (
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
              {errors.currentPassword && (
                <span className="customerChangePassword__errorText" id="currentPassword-error" role="alert">
                  {errors.currentPassword}
                </span>
              )}
            </div>

            <div className="customerChangePassword__formGroup">
              <label className="customerChangePassword__label">
                Password Baru
                <span className="customerChangePassword__required">*</span>
              </label>
              <div className="customerChangePassword__passwordWrapper">
                <input
                  type={showPassword.new ? "text" : "password"}
                  className={`customerChangePassword__input ${errors.newPassword ? "customerChangePassword__input--error" : ""}`}
                  value={formData.newPassword}
                  onChange={(e) => onFormChange("newPassword", e.target.value)}
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                />
                <button
                  type="button"
                  className="customerChangePassword__passwordToggle"
                  onClick={() => onTogglePasswordVisibility("new")}
                  aria-label={showPassword.new ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    {showPassword.new ? (
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
              {errors.newPassword && (
                <span className="customerChangePassword__errorText" id="newPassword-error" role="alert">
                  {errors.newPassword}
                </span>
              )}
              <span className="customerChangePassword__hint">
                Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
              </span>
            </div>

            <div className="customerChangePassword__formGroup">
              <label className="customerChangePassword__label">
                Konfirmasi Password Baru
                <span className="customerChangePassword__required">*</span>
              </label>
              <div className="customerChangePassword__passwordWrapper">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  className={`customerChangePassword__input ${errors.confirmPassword ? "customerChangePassword__input--error" : ""}`}
                  value={formData.confirmPassword}
                  onChange={(e) => onFormChange("confirmPassword", e.target.value)}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                />
                <button
                  type="button"
                  className="customerChangePassword__passwordToggle"
                  onClick={() => onTogglePasswordVisibility("confirm")}
                  aria-label={showPassword.confirm ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    {showPassword.confirm ? (
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
                <span className="customerChangePassword__errorText" id="confirmPassword-error" role="alert">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className="customerChangePassword__actions">
              <Link
                to="/customer/dashboard"
                className="customerChangePassword__cancelBtn"
              >
                Batal
              </Link>
              <button
                type="submit"
                className={`customerChangePassword__saveBtn btn-luxury ${isSaving ? "customerChangePassword__saveBtn--loading" : ""}`}
                disabled={isSaving}
                aria-busy={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="customerChangePassword__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Mengubah...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 15v3M15 12h3M12 9V6M9 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Ubah Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CustomerChangePasswordPageView;

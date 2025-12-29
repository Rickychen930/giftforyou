/**
 * Customer Change Password Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerChangePasswordPage.css";
import ConfettiEffect from "../components/ConfettiEffect";
import BackLink from "../components/common/BackLink";
import PasswordInput from "../components/common/PasswordInput";
import FormField from "../components/common/FormField";
import AlertMessage from "../components/common/AlertMessage";
import LuxuryButton from "../components/LuxuryButton";
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
          <BackLink to="/customer/dashboard" className="customerChangePassword__back">
            Kembali ke Dashboard
          </BackLink>
          <h1 id="change-password-title" className="customerChangePassword__title">Ubah Password</h1>
          <p className="customerChangePassword__subtitle">
            Pastikan password baru Anda kuat dan mudah diingat
          </p>
        </div>

        {showSuccess && (
          <AlertMessage
            variant="success"
            message="Password berhasil diubah!"
            className="customerChangePassword__success"
          />
        )}

        {errors.general && (
          <AlertMessage
            variant="error"
            message={errors.general}
            className="customerChangePassword__error"
          />
        )}

        <div className="customerChangePassword__card">
          <form className="customerChangePassword__form" onSubmit={onFormSubmit}>
            <FormField
              label="Password Saat Ini"
              required
              htmlFor="current-password"
              error={errors.currentPassword}
              className="customerChangePassword__formGroup"
            >
              <PasswordInput
                id="current-password"
                className={`customerChangePassword__input ${errors.currentPassword ? "customerChangePassword__input--error" : ""}`}
                value={formData.currentPassword}
                onChange={(e) => onFormChange("currentPassword", e.target.value)}
                placeholder="Masukkan password saat ini"
                autoComplete="current-password"
                showPassword={showPassword.current}
                onToggleVisibility={() => onTogglePasswordVisibility("current")}
                error={errors.currentPassword}
              />
            </FormField>

            <FormField
              label="Password Baru"
              required
              htmlFor="new-password"
              error={errors.newPassword}
              hint="Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
              className="customerChangePassword__formGroup"
            >
              <PasswordInput
                id="new-password"
                className={`customerChangePassword__input ${errors.newPassword ? "customerChangePassword__input--error" : ""}`}
                value={formData.newPassword}
                onChange={(e) => onFormChange("newPassword", e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                showPassword={showPassword.new}
                onToggleVisibility={() => onTogglePasswordVisibility("new")}
                error={errors.newPassword}
                hint="Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka"
              />
            </FormField>

            <FormField
              label="Konfirmasi Password Baru"
              required
              htmlFor="confirm-password"
              error={errors.confirmPassword}
              className="customerChangePassword__formGroup"
            >
              <PasswordInput
                id="confirm-password"
                className={`customerChangePassword__input ${errors.confirmPassword ? "customerChangePassword__input--error" : ""}`}
                value={formData.confirmPassword}
                onChange={(e) => onFormChange("confirmPassword", e.target.value)}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                showPassword={showPassword.confirm}
                onToggleVisibility={() => onTogglePasswordVisibility("confirm")}
                error={errors.confirmPassword}
              />
            </FormField>

            <div className="customerChangePassword__actions">
              <Link
                to="/customer/dashboard"
                className="customerChangePassword__cancelBtn"
              >
                Batal
              </Link>
              <LuxuryButton
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className={`customerChangePassword__saveBtn ${isSaving ? "customerChangePassword__saveBtn--loading" : ""}`}
                disabled={isSaving}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 15v3M15 12h3M12 9V6M9 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                }
                iconPosition="left"
              >
                {isSaving ? "Mengubah..." : "Ubah Password"}
              </LuxuryButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CustomerChangePasswordPageView;

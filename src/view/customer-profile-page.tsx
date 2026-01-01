/**
 * Customer Profile Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerProfilePage.css";
import AddressAutocomplete from "../components/AddressAutocomplete";
import AutoSaveIndicator from "../components/common/AutoSaveIndicator";
import ConfettiEffect from "../components/common/ConfettiEffect";
import BackLink from "../components/common/BackLink";
import AlertMessage from "../components/common/AlertMessage";
import FormField from "../components/common/FormField";
import LuxuryButton from "../components/buttons/LuxuryButton";
import type {
  ProfileUser,
  ProfileFormData,
  ProfileFormErrors,
} from "../models/customer-profile-page-model";

interface CustomerProfilePageViewProps {
  user: ProfileUser | null;
  formData: ProfileFormData;
  errors: ProfileFormErrors;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
  lastSaved: Date | null;
  showConfetti: boolean;
  onFormChange: (field: keyof ProfileFormData, value: string) => void;
  onAddressChange: (address: string) => void;
  onFormSubmit: (e: React.FormEvent) => void;
}

/**
 * Customer Profile Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CustomerProfilePageView extends Component<CustomerProfilePageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="customerProfile customerProfile--loading">
        <div className="customerProfile__loading">
          <div className="customerProfile__spinner"></div>
          <p>Memuat profil...</p>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      user,
      formData,
      errors,
      isLoading,
      isSaving,
      isAuthenticated,
      showSuccess,
      lastSaved,
      showConfetti,
      onFormChange,
      onAddressChange,
      onFormSubmit,
    } = this.props;

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    if (isLoading) {
      return this.renderLoading();
    }

    return (
    <section className="customerProfile" aria-labelledby="profile-title">
      <ConfettiEffect trigger={showConfetti} />
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      <div className="customerProfile__container">
        <div className="customerProfile__header">
          <BackLink to="/customer/dashboard" className="customerProfile__back">
            Kembali ke Dashboard
          </BackLink>
          <h1 id="profile-title" className="customerProfile__title">Edit Profil</h1>
          <p className="customerProfile__subtitle">
            Kelola informasi profil dan preferensi Anda
          </p>
        </div>

        {showSuccess && (
          <AlertMessage
            variant="success"
            message="Profil berhasil diperbarui!"
            className="customerProfile__success"
          />
        )}

        {errors.general && (
          <AlertMessage
            variant="error"
            message={errors.general}
            className="customerProfile__error"
          />
        )}

        <div className="customerProfile__card">
          <div className="customerProfile__section">
            <h2 className="customerProfile__sectionTitle">Informasi Akun</h2>
            <div className="customerProfile__info">
              <div className="customerProfile__infoItem">
                <span className="customerProfile__infoLabel">Username</span>
                <span className="customerProfile__infoValue">{user?.username}</span>
              </div>
              <div className="customerProfile__infoItem">
                <span className="customerProfile__infoLabel">Email</span>
                <span className="customerProfile__infoValue">{user?.email}</span>
              </div>
            </div>
          </div>

          <form className="customerProfile__form" onSubmit={onFormSubmit}>
            <div className="customerProfile__section">
              <h2 className="customerProfile__sectionTitle">Informasi Pribadi</h2>

              <FormField
                label="Nama Lengkap"
                required
                htmlFor="profile-full-name"
                error={errors.fullName}
                className="customerProfile__formGroup"
              >
                <input
                  type="text"
                  id="profile-full-name"
                  className={`customerProfile__input ${errors.fullName ? "customerProfile__input--error" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => onFormChange("fullName", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </FormField>

              <FormField
                label="Nomor Telepon"
                required
                htmlFor="profile-phone"
                error={errors.phoneNumber}
                className="customerProfile__formGroup"
              >
                <input
                  type="tel"
                  id="profile-phone"
                  className={`customerProfile__input ${errors.phoneNumber ? "customerProfile__input--error" : ""}`}
                  value={formData.phoneNumber}
                  onChange={(e) => onFormChange("phoneNumber", e.target.value)}
                  placeholder="081234567890"
                />
              </FormField>

              <FormField
                label="Alamat"
                htmlFor="profile-address"
                error={errors.address}
                className="customerProfile__formGroup"
              >
                <AddressAutocomplete
                  value={formData.address}
                  onChange={onAddressChange}
                  placeholder="Masukkan alamat lengkap"
                  error={errors.address}
                />
              </FormField>
            </div>

            <div className="customerProfile__actions">
              <Link
                to="/customer/dashboard"
                className="customerProfile__cancelBtn"
              >
                Batal
              </Link>
              <LuxuryButton
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className={`customerProfile__saveBtn ${isSaving ? "customerProfile__saveBtn--loading" : ""}`}
                disabled={isSaving}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                }
                iconPosition="left"
              >
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </LuxuryButton>
            </div>
          </form>
        </div>
      </div>
    </section>
    );
  }
}

export default CustomerProfilePageView;

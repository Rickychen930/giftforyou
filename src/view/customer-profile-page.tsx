/**
 * Customer Profile Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerProfilePage.css";
import AddressAutocomplete from "../components/AddressAutocomplete";
import AutoSaveIndicator from "../components/AutoSaveIndicator";
import ConfettiEffect from "../components/ConfettiEffect";
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
 * Pure presentation - receives all data and handlers via props
 */
const CustomerProfilePageView: React.FC<CustomerProfilePageViewProps> = ({
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
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  if (isLoading) {
    return (
      <section className="customerProfile customerProfile--loading">
        <div className="customerProfile__loading">
          <div className="customerProfile__spinner"></div>
          <p>Memuat profil...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="customerProfile" aria-labelledby="profile-title">
      <ConfettiEffect trigger={showConfetti} />
      <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
      <div className="customerProfile__container">
        <div className="customerProfile__header">
          <Link to="/customer/dashboard" className="customerProfile__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
          <h1 id="profile-title" className="customerProfile__title">Edit Profil</h1>
          <p className="customerProfile__subtitle">
            Kelola informasi profil dan preferensi Anda
          </p>
        </div>

        {showSuccess && (
          <div className="customerProfile__success" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Profil berhasil diperbarui!</span>
          </div>
        )}

        {errors.general && (
          <div className="customerProfile__error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{errors.general}</span>
          </div>
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

              <div className="customerProfile__formGroup">
                <label className="customerProfile__label">
                  Nama Lengkap
                  <span className="customerProfile__required">*</span>
                </label>
                <input
                  type="text"
                  className={`customerProfile__input ${errors.fullName ? "customerProfile__input--error" : ""}`}
                  value={formData.fullName}
                  onChange={(e) => onFormChange("fullName", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
                {errors.fullName && (
                  <span className="customerProfile__errorText" id="fullName-error" role="alert">
                    {errors.fullName}
                  </span>
                )}
              </div>

              <div className="customerProfile__formGroup">
                <label className="customerProfile__label">
                  Nomor Telepon
                  <span className="customerProfile__required">*</span>
                </label>
                <input
                  type="tel"
                  className={`customerProfile__input ${errors.phoneNumber ? "customerProfile__input--error" : ""}`}
                  value={formData.phoneNumber}
                  onChange={(e) => onFormChange("phoneNumber", e.target.value)}
                  placeholder="081234567890"
                  aria-invalid={!!errors.phoneNumber}
                  aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                />
                {errors.phoneNumber && (
                  <span className="customerProfile__errorText" id="phoneNumber-error" role="alert">
                    {errors.phoneNumber}
                  </span>
                )}
              </div>

              <div className="customerProfile__formGroup">
                <label className="customerProfile__label">
                  Alamat
                  <span className="customerProfile__optional">(Opsional)</span>
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={onAddressChange}
                  placeholder="Masukkan alamat lengkap"
                  error={errors.address}
                />
                {errors.address && (
                  <span className="customerProfile__errorText" role="alert">
                    {errors.address}
                  </span>
                )}
              </div>
            </div>

            <div className="customerProfile__actions">
              <Link
                to="/customer/dashboard"
                className="customerProfile__cancelBtn"
              >
                Batal
              </Link>
              <button
                type="submit"
                className={`customerProfile__saveBtn btn-luxury ${isSaving ? "customerProfile__saveBtn--loading" : ""}`}
                disabled={isSaving}
                aria-busy={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="customerProfile__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Simpan Perubahan</span>
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

export default CustomerProfilePageView;

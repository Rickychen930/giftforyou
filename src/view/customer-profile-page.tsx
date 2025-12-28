import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerProfilePage.css";
import { setSeo } from "../utils/seo";
import { API_BASE } from "../config/api";
import { getAccessToken, clearAuth } from "../utils/auth-utils";
import AddressAutocomplete from "../components/AddressAutocomplete";
import AutoSaveIndicator from "../components/AutoSaveIndicator";
import ConfettiEffect from "../components/ConfettiEffect";
import { toast } from "../utils/toast";

interface ProfileState {
  user: {
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    address: string;
  } | null;
  formData: {
    fullName: string;
    phoneNumber: string;
    address: string;
  };
  errors: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    general?: string;
  };
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
  lastSaved: Date | null;
  showConfetti: boolean;
}

class CustomerProfilePage extends Component<{}, ProfileState> {
  state: ProfileState = {
    user: null,
    formData: {
      fullName: "",
      phoneNumber: "",
      address: "",
    },
    errors: {},
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showSuccess: false,
    lastSaved: null,
    showConfetti: false,
  };

  componentDidMount(): void {
    setSeo({
      title: "Profil Saya | Giftforyou.idn",
      description: "Kelola informasi profil Anda.",
      path: "/customer/profile",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true });
    this.loadProfile();
  }

  private loadProfile = async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          user: data,
          formData: {
            fullName: data.fullName || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
          },
          isLoading: false,
        });
      } else if (response.status === 401) {
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

  private validateForm = (): boolean => {
    const errors: ProfileState["errors"] = {};

    if (!this.state.formData.fullName.trim()) {
      errors.fullName = "Nama lengkap wajib diisi";
    } else if (this.state.formData.fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter";
    }

    if (!this.state.formData.phoneNumber.trim()) {
      errors.phoneNumber = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(this.state.formData.phoneNumber)) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }

    if (this.state.formData.address.trim() && this.state.formData.address.trim().length < 10) {
      errors.address = "Alamat minimal 10 karakter";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  private handleChange = (field: keyof ProfileState["formData"], value: string): void => {
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

  private handleAddressChange = (address: string): void => {
    this.handleChange("address", address);
  };

  private handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
      const response = await fetch(`${API_BASE}/api/customer/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(this.state.formData),
      });

      const data = await response.json();

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
      setTimeout(() => {
        this.setState({ showConfetti: false });
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

  render(): React.ReactNode {
    const { user, formData, errors, isLoading, isSaving, isAuthenticated, showSuccess, lastSaved, showConfetti } = this.state;

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

            <form className="customerProfile__form" onSubmit={this.handleSubmit}>
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
                    onChange={(e) => this.handleChange("fullName", e.target.value)}
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
                    onChange={(e) => this.handleChange("phoneNumber", e.target.value)}
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
                    onChange={this.handleAddressChange}
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
  }
}

export default CustomerProfilePage;


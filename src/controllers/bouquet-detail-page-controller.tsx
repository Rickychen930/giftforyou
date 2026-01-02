/**
 * Bouquet Detail Page Controller
 * OOP-based controller for managing bouquet detail page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { useParams } from "react-router-dom";
import type { Bouquet } from "../models/domain/bouquet";
import { API_BASE } from "../config/api";
import { trackBouquetView } from "../services/analytics.service";
import { normalizeBouquet, normalizeBouquets } from "../utils/bouquet-normalizer";
import { buildImageUrl } from "../utils/image-utils";
import { buildWhatsAppLink } from "../utils/whatsapp";
import { formatIDR } from "../utils/money";
import { formatBouquetName } from "../utils/text-formatter";
import { STORE_PROFILE } from "../config/store-profile";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { addToRecentlyViewed } from "../utils/recently-viewed";
import { toast } from "../utils/toast";
import { getAccessToken } from "../utils/auth-utils";
import type { OrderFormData } from "../components/bouquet-detail/OrderForm";
import {
  type BouquetDetailPageState,
  INITIAL_BOUQUET_DETAIL_PAGE_STATE,
  getDefaultDate,
  FORM_STORAGE_KEY,
} from "../models/bouquet-detail-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import BouquetDetailPageView from "../view/bouquet-detail-page";

/**
 * Wrapper component to use hooks for route params
 */
const BouquetDetailPageControllerWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <BouquetDetailPageController id={id || ""} />;
};

interface BouquetDetailPageControllerProps extends BaseControllerProps {
  id: string;
}

/**
 * Bouquet Detail Page Controller Class
 * Manages all business logic, form validation, and bouquet operations
 * Extends BaseController to avoid code duplication
 */
export class BouquetDetailPageController extends BaseController<
  BouquetDetailPageControllerProps,
  BouquetDetailPageState & BaseControllerState & {
    bouquet: Bouquet | null;
    loading: boolean;
    error: string | null;
    similarBouquets: Bouquet[];
    detailUrl: string;
  }
> {
  private saveFormDataTimeout: NodeJS.Timeout | null = null;
  private validateFormTimeout: NodeJS.Timeout | null = null;

  constructor(props: BouquetDetailPageControllerProps) {
    const seoConfig: SeoConfig = {
      dynamicSeo: (state) => {
        const bouquet = (state as any).bouquet;
        if (!bouquet) return null;

        const details = [bouquet.type, bouquet.size].filter(Boolean).join(" • ");
        const price = Number.isFinite(bouquet.price) ? formatIDR(bouquet.price) : undefined;
        const titleParts = [formatBouquetName(bouquet.name), details].filter(Boolean).join(" — ");

        return {
          title: `${titleParts} | Giftforyou.idn - Florist Cirebon`,
          description:
            `${formatBouquetName(bouquet.name)}${details ? ` (${details})` : ""}` +
            (price ? ` — ${price}.` : ".") +
            ` Tersedia di Cirebon, Jawa Barat. Pesan mudah lewat WhatsApp dengan pengiriman cepat ke seluruh Cirebon dan sekitarnya.`,
          keywords:
            `${formatBouquetName(bouquet.name).toLowerCase()}, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist cirebon, toko bunga cirebon, hadiah cirebon, kado cirebon, florist jawa barat`,
          path: window.location.pathname,
          ogImagePath: bouquet.image ? buildImageUrl(bouquet.image) : undefined,
          structuredData: {
            "@type": "Product",
            name: bouquet.name,
            description: bouquet.description || `${bouquet.name} tersedia di Cirebon, Jawa Barat`,
            image: bouquet.image ? buildImageUrl(bouquet.image) : undefined,
            offers: {
              "@type": "Offer",
              price: bouquet.price,
              priceCurrency: "IDR",
              availability: bouquet.status === "ready" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
              url: window.location.href,
            },
            brand: {
              "@type": "Brand",
              name: STORE_PROFILE.brand.name,
            },
            category: bouquet.type || "Bouquet",
          },
        };
      },
    };

    super(props, seoConfig, {
      enableFadeIn: true,
      enableRevealOnScroll: true,
      enableLazyLoadImages: false, // Images are handled by ProductImage component
    });

    this.state = {
      ...this.state,
      ...INITIAL_BOUQUET_DETAIL_PAGE_STATE,
      bouquet: null,
      loading: true,
      error: null,
      similarBouquets: [],
      detailUrl: "",
    };
  }

  /**
   * Initialize detail URL
   */
  private initializeDetailUrl(): void {
    if (this.props.id) {
      this.setState({
        detailUrl: `${window.location.origin}/bouquet/${this.props.id}`,
      });
    }
  }

  /**
   * Load bouquet data
   */
  private loadBouquet = async (): Promise<void> => {
    if (!this.props.id) {
      this.setState({
        bouquet: null,
        error: "ID bouquet tidak ditemukan.",
        loading: false,
      });
      return;
    }

    trackBouquetView(this.props.id, `/bouquet/${this.props.id}`);

    try {
      this.setLoading(true);
      this.setState({ error: null });

      const res = await this.safeFetch(`${API_BASE}/api/bouquets/${this.props.id}`);

      if (!res || !res.ok) {
        const text = res ? await res.text() : "No response";
        throw new Error(`Gagal memuat bouquet (${res?.status || 0}): ${text}`);
      }

      const text = await res.text();
      const data = this.safeJsonParse<unknown>(text, null);
      if (!data) {
        throw new Error("Empty response body");
      }

      // Handle array response (some APIs return array)
      let bouquetData = data;
      if (Array.isArray(data) && data.length > 0) {
        bouquetData = data[0];
      } else if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        // Try common property names for bouquet data
        bouquetData = obj.bouquet ?? obj.data ?? obj.item ?? data;
      }

      const normalizedBouquet = normalizeBouquet(bouquetData);
      if (!normalizedBouquet) {
        // Log detailed info in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.warn("[Detail] Bouquet normalization failed. Raw data:", {
            hasData: !!data,
            dataType: typeof data,
            isArray: Array.isArray(data),
            keys: data && typeof data === "object" ? Object.keys(data) : [],
            sample: JSON.stringify(data).slice(0, 300),
          });
        }
        // Set error state gracefully instead of throwing
        this.setState({
          bouquet: null,
          error: "Data bouquet tidak valid atau tidak lengkap. Silakan coba lagi atau hubungi admin.",
          loading: false,
        });
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[Detail] Bouquet loaded:", {
          _id: normalizedBouquet._id,
          name: normalizedBouquet.name,
          price: normalizedBouquet.price,
          hasImage: !!normalizedBouquet.image,
        });
      }

      this.setState({
        bouquet: normalizedBouquet,
        isFavorite: isFavorite(normalizedBouquet._id),
      });

      // Track recently viewed
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          addToRecentlyViewed(
            normalizedBouquet._id,
            normalizedBouquet.name,
            normalizedBouquet.price,
            normalizedBouquet.image
          );
        }, { timeout: 1000 });
      } else {
        setTimeout(() => {
          addToRecentlyViewed(
            normalizedBouquet._id,
            normalizedBouquet.name,
            normalizedBouquet.price,
            normalizedBouquet.image
          );
        }, 100);
      }

      // SEO is handled by BaseController via dynamicSeo config

      // Load similar bouquets
      this.loadSimilarBouquets(normalizedBouquet);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") {
        return;
      }
      if (!this.abortController?.signal.aborted) {
        this.setError(e, "Gagal memuat bouquet.");
        this.setState({
          bouquet: null,
          error: this.handleError(e, "Gagal memuat bouquet."),
          loading: false,
        });
      }
    } finally {
      if (!this.abortController?.signal.aborted) {
        this.setLoading(false);
      }
    }
  };

  /**
   * Load similar bouquets
   */
  private loadSimilarBouquets = async (currentBouquet: Bouquet): Promise<void> => {
    if (!this.abortController) return;

    try {
      const allRes = await this.safeFetch(`${API_BASE}/api/bouquets`);
      if (allRes && allRes.ok) {
        const allText = await allRes.text();
        const allData = this.safeJsonParse<any[]>(allText, []);
        const allBouquets = Array.isArray(allData) ? normalizeBouquets(allData) : [];

        if (!this.abortController.signal.aborted) {
          const similar = allBouquets
            .filter((b) => b._id !== currentBouquet._id)
            .filter((b) => 
              b.collectionName === currentBouquet.collectionName ||
              b.type === currentBouquet.type ||
              b.size === currentBouquet.size
            )
            .slice(0, 4);

          this.setState({ similarBouquets: similar });
        }
      }
    } catch {
      // Silently fail for similar bouquets
    }
  };

  // SEO is now handled by BaseController via dynamicSeo config

  /**
   * Load saved form data
   */
  private loadSavedFormData(): void {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === "object") {
          this.setState({
            formData: {
              deliveryType: data.deliveryType || "delivery",
              deliveryDate: data.deliveryDate || getDefaultDate(),
              deliveryTimeSlot: data.deliveryTimeSlot || undefined,
              address: data.address || "",
              greetingCard: data.greetingCard || "",
              quantity: data.quantity || 1,
            },
          });
        }
      }

      setTimeout(() => {
        this.loadSavedAddress();
      }, 500);
    } catch {
      // Ignore errors
    }
  }

  /**
   * Load saved address
   */
  private loadSavedAddress = async (): Promise<void> => {
    try {
      const token = getAccessToken();
      if (!token || this.state.formData.address.trim()) return;

      const response = await fetch(`${API_BASE}/api/customers/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const addresses = await response.json();
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress && defaultAddress.fullAddress) {
          this.setState((prevState) => ({
            formData: { ...prevState.formData, address: defaultAddress.fullAddress },
          }));
          toast.info("Alamat default dimuat");
        }
      }
    } catch {
      // Silently fail
    }
  };

  /**
   * Save form data
   */
  private saveFormData(): void {
    try {
      const dataToSave = {
        deliveryType: this.state.formData.deliveryType,
        deliveryDate: this.state.formData.deliveryDate,
        deliveryTimeSlot: this.state.formData.deliveryTimeSlot,
        address: this.state.formData.address,
        greetingCard: this.state.formData.greetingCard,
        quantity: this.state.formData.quantity,
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Ignore errors
    }
  }

  /**
   * Validate form with data
   */
  private validateFormWithData(formData: OrderFormData): { isValid: boolean; errors: Partial<Record<keyof OrderFormData, string>> } {
    const errors: Partial<Record<keyof OrderFormData, string>> = {};

    // Validate quantity
    if (formData.quantity < 1 || formData.quantity > 99) {
      errors.quantity = "Jumlah harus antara 1-99";
    }

    // Validate delivery date
    if (!formData.deliveryDate) {
      errors.deliveryDate = "Tanggal harus diisi";
    } else {
      const selectedDate = new Date(formData.deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (selectedDate < tomorrow) {
        errors.deliveryDate = "Tanggal harus minimal besok";
      }
    }

    // Validate address only for delivery
    if (formData.deliveryType === "delivery") {
      if (!formData.address.trim()) {
        errors.address = "Alamat pengiriman harus diisi";
      } else if (formData.address.trim().length < 10) {
        errors.address = "Alamat terlalu pendek, minimal 10 karakter";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate form
   */
  private validateForm(): { isValid: boolean; errors: Partial<Record<keyof OrderFormData, string>> } {
    return this.validateFormWithData(this.state.formData);
  }

  /**
   * Calculate form progress
   */
  private calculateFormProgress(): number {
    const { formData } = this.state;
    let completed = 0;
    const total = 4;

    // Quantity validation
    if (formData.quantity >= 1 && formData.quantity <= 99) {
      completed++;
    }

    // Delivery type validation
    if (formData.deliveryType) {
      completed++;
    }

    // Delivery date validation
    if (formData.deliveryDate) {
      const selectedDate = new Date(formData.deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (selectedDate >= tomorrow) {
        completed++;
      }
    }

    // Address validation (only for delivery, auto-complete for pickup)
    if (formData.deliveryType === "pickup") {
      completed++;
    } else if (formData.deliveryType === "delivery" && formData.address.trim().length >= 10) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  }

  /**
   * Build customer order message
   */
  private buildCustomerOrderMessage = (bouquet: Bouquet, formData: OrderFormData): string => {
    const lines = [
      `Halo ${STORE_PROFILE.brand.displayName}, saya ingin pesan bouquet berikut:`,
      ``,
      `Nama: ${formatBouquetName(bouquet.name)}`,
      `Harga: ${formatIDR(bouquet.price)}`,
      bouquet.status ? `Status: ${bouquet.status === "ready" ? "Siap" : "Preorder"}` : "",
      bouquet.size ? `Ukuran: ${bouquet.size}` : "",
      bouquet.type ? `Tipe: ${bouquet.type}` : "",
      `Jumlah: ${formData.quantity}`,
      ``,
      `📦 Pengiriman: ${formData.deliveryType === "pickup" ? "Ambil di toko" : "Diantar"}`,
      formData.deliveryType === "delivery" && formData.deliveryDate
        ? `📅 Tanggal pengiriman: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengiriman: ${formData.deliveryTimeSlot}` : ""}`
        : formData.deliveryType === "pickup" && formData.deliveryDate
          ? `📅 Tanggal pengambilan: ${formData.deliveryDate}${formData.deliveryTimeSlot ? `\n⏰ Waktu pengambilan: ${formData.deliveryTimeSlot}` : ""}`
          : "",
      formData.deliveryType === "delivery" && formData.address
        ? `📍 Alamat: ${formData.address}`
        : "",
      formData.greetingCard
        ? `💌 Kartu ucapan: ${formData.greetingCard}`
        : "",
      ``,
      this.state.detailUrl ? `Tautan detail: ${this.state.detailUrl}` : "",
    ].filter(Boolean);

    return lines.join("\n");
  };

  /**
   * Handle form field change
   */
  handleFormChange = (field: keyof OrderFormData, value: string | number): void => {
    this.setState((prevState) => {
      const newFormData = {
        ...prevState.formData,
        [field]: value,
      };

      // Clear address when switching to pickup
      if (field === "deliveryType" && value === "pickup") {
        newFormData.address = "";
      }

      // Validate immediately with new form data
      const validation = this.validateFormWithData(newFormData);

      if (this.saveFormDataTimeout) {
        clearTimeout(this.saveFormDataTimeout);
      }
      this.saveFormDataTimeout = setTimeout(() => {
        this.saveFormData();
      }, 500);

      if (this.validateFormTimeout) {
        clearTimeout(this.validateFormTimeout);
      }
      this.validateFormTimeout = setTimeout(() => {
        const reValidation = this.validateForm();
        this.setState({
          formErrors: reValidation.errors,
          isFormValid: reValidation.isValid,
          formProgress: this.calculateFormProgress(),
        });
      }, 200);

      return {
        formData: newFormData,
        formErrors: validation.errors,
        isFormValid: validation.isValid,
        formProgress: this.calculateFormProgress(),
      };
    });
  };

  /**
   * Handle address change
   */
  handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    this.handleFormChange("address", e.target.value);
  };

  /**
   * Handle favorite toggle
   */
  handleFavoriteToggle = (): void => {
    const { bouquet } = this.state;
    if (!bouquet) return;

    const newFavoriteStatus = toggleFavorite(
      bouquet._id,
      bouquet.name,
      bouquet.price,
      bouquet.image
    );

    this.setState({ isFavorite: newFavoriteStatus });
  };

  /**
   * Handle order submit
   */
  handleOrderSubmit = (): void => {
    const { bouquet } = this.state;
    if (!bouquet || !this.state.isFormValid) {
      toast.error("Lengkapi semua field yang wajib terlebih dahulu");
      return;
    }

    const waOrderLink = buildWhatsAppLink(
      this.buildCustomerOrderMessage(bouquet, this.state.formData)
    );

    window.open(waOrderLink, "_blank", "noopener,noreferrer");
    this.setState({ showOrderModal: false });
  };

  /**
   * Handle show order modal
   */
  handleShowOrderModal = (): void => {
    this.setState({ showOrderModal: true });
  };

  /**
   * Handle close order modal
   */
  handleCloseOrderModal = (): void => {
    this.setState({ showOrderModal: false });
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO and luxury enhancements initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.initializeDetailUrl();
    this.loadSavedFormData();
    this.loadBouquet();

    // Initial validation
    const validateForm = () => {
      const validation = this.validateForm();
      this.setState({
        formErrors: validation.errors,
        isFormValid: validation.isValid,
        formProgress: this.calculateFormProgress(),
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(validateForm, { timeout: 200 });
    } else {
      setTimeout(validateForm, 100);
    }
  }

  /**
   * Component lifecycle: Update
   * BaseController handles SEO updates and luxury enhancements re-initialization
   */
  componentDidUpdate(prevProps: BouquetDetailPageControllerProps, prevState: BouquetDetailPageState & BaseControllerState & {
    bouquet: Bouquet | null;
    loading: boolean;
    error: string | null;
    similarBouquets: Bouquet[];
    detailUrl: string;
  }): void {
    super.componentDidUpdate(prevProps, prevState);
    
    // Reload bouquet if ID changed
    if (prevProps.id !== this.props.id) {
      this.initializeDetailUrl();
      this.loadBouquet();
      this.loadSavedFormData();
      // Reset form validation
      const validation = this.validateForm();
      this.setState({
        formErrors: validation.errors,
        isFormValid: validation.isValid,
        formProgress: this.calculateFormProgress(),
      });
    }
    
    // Sync form data changes with validation (only if form data actually changed)
    // Note: Validation is already handled in handleFormChange, this is just a safety check
    if (
      prevState.formData.deliveryType !== this.state.formData.deliveryType ||
      prevState.formData.deliveryDate !== this.state.formData.deliveryDate ||
      prevState.formData.deliveryTimeSlot !== this.state.formData.deliveryTimeSlot ||
      prevState.formData.address !== this.state.formData.address ||
      prevState.formData.greetingCard !== this.state.formData.greetingCard ||
      prevState.formData.quantity !== this.state.formData.quantity
    ) {
      // Form data changed, but validation is handled in handleFormChange
      // Only update if validation state is out of sync (shouldn't happen, but safety check)
      const currentProgress = this.calculateFormProgress();
      if (prevState.formProgress !== currentProgress) {
        // Progress changed, recalculate validation
        const validation = this.validateForm();
        this.setState({
          formErrors: validation.errors,
          isFormValid: validation.isValid,
          formProgress: currentProgress,
        });
      }
    }
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles AbortController cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.saveFormDataTimeout) {
      clearTimeout(this.saveFormDataTimeout);
    }
    if (this.validateFormTimeout) {
      clearTimeout(this.validateFormTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <BouquetDetailPageView
        bouquet={this.state.bouquet}
        loading={this.state.loading}
        error={this.state.error}
        detailUrl={this.state.detailUrl}
        similarBouquets={this.state.similarBouquets}
        formData={this.state.formData}
        formErrors={this.state.formErrors}
        isFormValid={this.state.isFormValid}
        isFavorite={this.state.isFavorite}
        showOrderModal={this.state.showOrderModal}
        formProgress={this.state.formProgress}
        getDefaultDate={getDefaultDate}
        onFormChange={this.handleFormChange}
        onAddressChange={this.handleAddressChange}
        onFavoriteToggle={this.handleFavoriteToggle}
        onOrderSubmit={this.handleOrderSubmit}
        onShowOrderModal={this.handleShowOrderModal}
        onCloseOrderModal={this.handleCloseOrderModal}
      />
    );
  }
}

export default BouquetDetailPageControllerWrapper;


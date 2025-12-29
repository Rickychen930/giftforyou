/**
 * Contact Page Model
 * Defines data structures and types for the contact page
 */

/**
 * Contact Form Data
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/**
 * Contact Form Status
 */
export type ContactFormStatus = "idle" | "loading" | "success" | "error";

/**
 * Contact Page State
 */
export interface ContactPageState {
  formData: ContactFormData;
  status: ContactFormStatus;
  errorMessage: string;
}

/**
 * Initial Contact Form Data
 */
export const INITIAL_CONTACT_FORM_DATA: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

/**
 * Initial Contact Page State
 */
export const INITIAL_CONTACT_PAGE_STATE: ContactPageState = {
  formData: INITIAL_CONTACT_FORM_DATA,
  status: "idle",
  errorMessage: "",
};

/**
 * Contact Page SEO Data
 */
export interface ContactPageSeoData {
  title: string;
  description: string;
  keywords: string;
  path: string;
}

/**
 * Default SEO data for contact page
 */
export const DEFAULT_CONTACT_PAGE_SEO: ContactPageSeoData = {
  title: "Kontak Kami - Hubungi Giftforyou.idn | Florist Cirebon",
  description:
    "Hubungi Giftforyou.idn untuk pemesanan bouquet, gift box, dan stand acrylic. Kami siap membantu Anda dengan berbagai kebutuhan hadiah dan dekorasi. Lokasi: Cirebon, Jawa Barat.",
  keywords:
    "kontak giftforyou, hubungi florist cirebon, alamat toko bunga cirebon, telepon florist cirebon",
  path: "/contact",
};


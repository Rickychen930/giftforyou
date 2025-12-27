// src/constants/app-constants.ts
// Centralized constants for the application

import { STORE_PROFILE } from "../config/store-profile";

export const BRAND_INFO = {
  name: STORE_PROFILE.brand.name,
  fullName: STORE_PROFILE.brand.displayName,
  tagline: STORE_PROFILE.brand.tagline,
  description: STORE_PROFILE.brand.description,
  logoPath: STORE_PROFILE.brand.logoPath,
} as const;

export const CONTACT_INFO = {
  email: STORE_PROFILE.contact.email,
  phone: STORE_PROFILE.contact.phoneDisplay,
  phoneDisplay: STORE_PROFILE.contact.phoneDisplay,
  phoneLink: `tel:${STORE_PROFILE.contact.phoneE164}`,
  emailLink: `mailto:${STORE_PROFILE.contact.email}`,
} as const;

export const SOCIAL_MEDIA = [
  {
    name: "Instagram" as const,
    url: STORE_PROFILE.social.instagram,
    label: "Ikuti kami di Instagram",
  },
  {
    name: "WhatsApp" as const,
    url: STORE_PROFILE.whatsapp.url,
    label: "Chat lewat WhatsApp",
  },
  {
    name: "TikTok" as const,
    url: STORE_PROFILE.social.tiktok,
    label: "Ikuti kami di TikTok",
  },
] as const;

export const BUSINESS_HOURS = {
  weekdays: STORE_PROFILE.hours.weekdays,
  saturday: STORE_PROFILE.hours.saturday,
  sunday: STORE_PROFILE.hours.sunday,
  compact: STORE_PROFILE.hours.compact,
} as const;

export const COLLECTION_SUGGESTIONS = [
  "Koleksi Orchid",
  "Mawar Premium",
  "Lili Eksotis",
  "Spesial Musiman",
  "Bouquet Ulang Tahun",
  "Hadiah Anniversary",
  "Best Seller",
  "Produk Terbaru",
] as const;

export const NAV_LINKS = {
  public: [
    { label: "Beranda", path: "/" },
    { label: "Koleksi", path: "/collection" },
    { label: "Login", path: "/login" },
  ],
  authenticated: [
    { label: "Beranda", path: "/" },
    { label: "Koleksi", path: "/collection" },
    { label: "Dashboard", path: "/dashboard" },
  ],
} as const;

export const QUICK_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Katalog Bouquet", href: "/collection" },
  { label: "Koleksi", href: "/#collections" },
  { label: "Tentang Kami", href: "/#about" },
] as const;

export type SocialPlatform = (typeof SOCIAL_MEDIA)[number]["name"];

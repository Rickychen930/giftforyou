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
    label: "Follow us on Instagram",
  },
  {
    name: "WhatsApp" as const,
    url: STORE_PROFILE.whatsapp.url,
    label: "Contact us on WhatsApp",
  },
  {
    name: "Facebook" as const,
    url: STORE_PROFILE.social.facebook,
    label: "Follow us on Facebook",
  },
  {
    name: "TikTok" as const,
    url: STORE_PROFILE.social.tiktok,
    label: "Follow us on TikTok",
  },
] as const;

export const BUSINESS_HOURS = {
  weekdays: STORE_PROFILE.hours.weekdays,
  saturday: STORE_PROFILE.hours.saturday,
  sunday: STORE_PROFILE.hours.sunday,
  compact: STORE_PROFILE.hours.compact,
} as const;

export const COLLECTION_SUGGESTIONS = [
  "Orchid Collection",
  "Premium Roses",
  "Exotic Lilies",
  "Seasonal Specials",
  "Birthday Bouquets",
  "Anniversary Gifts",
  "Best Sellers",
  "New Arrivals",
] as const;

export const NAV_LINKS = {
  public: [
    { label: "Home", path: "/" },
    { label: "Our Collection", path: "/collection" },
    { label: "Login", path: "/login" },
  ],
  authenticated: [
    { label: "Home", path: "/" },
    { label: "Our Collection", path: "/collection" },
    { label: "Dashboard", path: "/dashboard" },
  ],
} as const;

export const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Bouquet Catalog", href: "/collection" },
  { label: "Collections", href: "/#collections" },
  { label: "About Us", href: "/#about" },
] as const;

export type SocialPlatform = (typeof SOCIAL_MEDIA)[number]["name"];

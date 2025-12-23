// src/constants/app-constants.ts
// Centralized constants for the application

export const BRAND_INFO = {
  name: "Giftforyou.idn",
  fullName: "Giftforyou.idn",
  tagline: "Luxury Floral Boutique",
  description:
    "Premium flowers and personalized gifts for every special occasion.",
  logoPath: "/images/logo.png",
} as const;

export const CONTACT_INFO = {
  email: "giftforyou.idn01@gmail.com",
  phone: "+62 851 6142 8911",
  phoneDisplay: "+62 851 6142 8911",
  phoneLink: "tel:+6285161428911",
  emailLink: "mailto:giftforyou.idn01@gmail.com",
} as const;

export const SOCIAL_MEDIA = [
  {
    name: "Instagram" as const,
    url: "https://www.instagram.com/giftforyou.idn/?hl=en",
    label: "Follow us on Instagram",
  },
  {
    name: "WhatsApp" as const,
    url: "https://wa.me/6285161428911",
    label: "Contact us on WhatsApp",
  },
  {
    name: "Facebook" as const,
    url: "https://facebook.com/giftforyou.idn",
    label: "Follow us on Facebook",
  },
  {
    name: "TikTok" as const,
    url: "https://tiktok.com/@giftforyou.idn",
    label: "Follow us on TikTok",
  },
] as const;

export const BUSINESS_HOURS = {
  weekdays: "Monday - Friday: 9:00 AM - 8:00 PM",
  saturday: "Saturday: 9:00 AM - 9:00 PM",
  sunday: "Sunday: 10:00 AM - 6:00 PM",
  compact: "Mon-Sat: 9AM-8PM",
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

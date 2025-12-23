// src/models/store-model.ts

import { STORE_PROFILE } from "../config/store-profile";

export interface StoreHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface StoreSocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string; // e.g. https://wa.me/6285...
}

export interface StoreData {
  name: string;
  address: string;
  city: string;

  phone: string; // keep as string to preserve +62 formatting
  email: string;

  mapEmbedUrl: string; // Google Maps embed url
  mapDirectionsUrl?: string; // optional: direct maps link for "Get Directions"

  hours: StoreHours;
  social?: StoreSocialLinks;
}

/**
 * Single store config (you can later change this to an array if you have many branches)
 */
export const storeData: StoreData = {
  name: STORE_PROFILE.brand.displayName,
  address: `${STORE_PROFILE.location.streetAddress}, Pamengkang, Kec. ${STORE_PROFILE.location.subLocality}`,
  city: `${STORE_PROFILE.location.locality}, ${STORE_PROFILE.location.region} ${STORE_PROFILE.location.postalCode}, Indonesia`,

  phone: STORE_PROFILE.contact.phoneDisplay,
  email: STORE_PROFILE.contact.email,

  mapEmbedUrl: STORE_PROFILE.location.maps.embedUrl,
  mapDirectionsUrl: STORE_PROFILE.location.maps.placeUrl,

  hours: {
    weekdays: STORE_PROFILE.hours.weekdays,
    saturday: STORE_PROFILE.hours.saturday,
    sunday: STORE_PROFILE.hours.sunday,
  },

  social: {
    instagram: STORE_PROFILE.social.instagram,
    facebook: STORE_PROFILE.social.facebook,
    tiktok: STORE_PROFILE.social.tiktok,
    whatsapp: STORE_PROFILE.whatsapp.url,
  },
};

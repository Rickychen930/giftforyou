// src/models/store-model.ts

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
  name: "Giftforyou.idn Florist & Gift Shop",
  address: "Perum Mustika Blok C No 9",
  city: "Cirebon, West Java, Indonesia",

  phone: "+62 851 6142 8911",
  email: "giftforyou.idn01@gmail.com",

  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.100714098869!2d108.55960827524292!3d-6.7575718932390165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f1d0c68b89013%3A0x6349563c1a437106!2sGiftforyou.idn%20Florist%20%26%20Gift%20shop!5e0!3m2!1sen!2sau!4v1762314519420!5m2!1sen!2sau",

  // Optional (recommended): for a "Get Directions" button
  mapDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Giftforyou.idn%20Florist%20%26%20Gift%20shop",

  hours: {
    weekdays: "Mon–Fri: 9:00 AM – 6:00 PM",
    saturday: "Sat: 10:00 AM – 4:00 PM",
    sunday: "Sun: Closed",
  },

  social: {
    instagram: "https://instagram.com/giftforyou.idn",
    whatsapp: "https://wa.me/6285161428911",
    // facebook: "https://facebook.com/...",
    // tiktok: "https://tiktok.com/@...",
  },
};

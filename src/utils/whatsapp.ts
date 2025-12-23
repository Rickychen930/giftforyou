import { STORE_PROFILE } from "../config/store-profile";

export const buildWhatsAppLink = (text: string): string => {
  const encoded = encodeURIComponent(text);
  return `${STORE_PROFILE.whatsapp.url}?text=${encoded}`;
};

export const buildWhatsAppLinkEncoded = (encodedText: string): string => {
  return `${STORE_PROFILE.whatsapp.url}?text=${encodedText}`;
};

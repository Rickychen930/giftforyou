"use strict";
// src/models/store-model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeData = void 0;
const store_profile_1 = require("../config/store-profile");
/**
 * Single store config (you can later change this to an array if you have many branches)
 */
exports.storeData = {
    name: store_profile_1.STORE_PROFILE.brand.displayName,
    address: `${store_profile_1.STORE_PROFILE.location.streetAddress}, Pamengkang, Kec. ${store_profile_1.STORE_PROFILE.location.subLocality}`,
    city: `${store_profile_1.STORE_PROFILE.location.locality}, ${store_profile_1.STORE_PROFILE.location.region} ${store_profile_1.STORE_PROFILE.location.postalCode}, Indonesia`,
    phone: store_profile_1.STORE_PROFILE.contact.phoneDisplay,
    email: store_profile_1.STORE_PROFILE.contact.email,
    mapEmbedUrl: store_profile_1.STORE_PROFILE.location.maps.embedUrl,
    mapDirectionsUrl: store_profile_1.STORE_PROFILE.location.maps.placeUrl,
    hours: {
        weekdays: store_profile_1.STORE_PROFILE.hours.weekdays,
        saturday: store_profile_1.STORE_PROFILE.hours.saturday,
        sunday: store_profile_1.STORE_PROFILE.hours.sunday,
    },
    social: {
        instagram: store_profile_1.STORE_PROFILE.social.instagram,
        facebook: store_profile_1.STORE_PROFILE.social.facebook,
        tiktok: store_profile_1.STORE_PROFILE.social.tiktok,
        whatsapp: store_profile_1.STORE_PROFILE.whatsapp.url,
    },
};
//# sourceMappingURL=store-model.js.map
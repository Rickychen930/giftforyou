import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "./money";

export interface DeliveryPriceResult {
  price: number;
  distance: number; // in kilometers
  estimatedTime: string; // e.g., "30-45 menit"
  formattedPrice: string;
}

/**
 * Calculate delivery price based on distance from store location
 * Uses Haversine formula for distance calculation
 */
export function calculateDeliveryPrice(
  destinationLat: number,
  destinationLng: number
): DeliveryPriceResult {
  const storeLat = STORE_PROFILE.location.geo.latitude;
  const storeLng = STORE_PROFILE.location.geo.longitude;

  // Calculate distance using Haversine formula
  const distance = calculateDistance(storeLat, storeLng, destinationLat, destinationLng);

  // Base price structure (in IDR)
  // Within Cirebon city: 15,000 - 25,000
  // Outside Cirebon but within regency: 25,000 - 40,000
  // Far outside: 40,000 - 60,000
  let price = 0;

  if (distance <= 5) {
    // Within 5km - same-day delivery area
    price = 15000;
  } else if (distance <= 10) {
    // 5-10km - standard delivery
    price = 20000;
  } else if (distance <= 20) {
    // 10-20km - extended delivery
    price = 30000;
  } else if (distance <= 30) {
    // 20-30km - far delivery
    price = 40000;
  } else {
    // Beyond 30km - special delivery (contact for quote)
    price = 50000;
  }

  // Estimate delivery time based on distance
  let estimatedTime = "";
  if (distance <= 5) {
    estimatedTime = "30-45 menit";
  } else if (distance <= 10) {
    estimatedTime = "45-60 menit";
  } else if (distance <= 20) {
    estimatedTime = "1-2 jam";
  } else if (distance <= 30) {
    estimatedTime = "2-3 jam";
  } else {
    estimatedTime = "3+ jam (hubungi untuk konfirmasi)";
  }

  return {
    price,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    estimatedTime,
    formattedPrice: formatIDR(price),
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if address is within same-day delivery zone
 */
export function isSameDayDelivery(distance: number): boolean {
  return distance <= 5; // Within 5km
}

/**
 * Get delivery zone name based on distance
 */
export function getDeliveryZone(distance: number): string {
  if (distance <= 5) {
    return "Zona Same-Day";
  } else if (distance <= 10) {
    return "Zona Standar";
  } else if (distance <= 20) {
    return "Zona Extended";
  } else if (distance <= 30) {
    return "Zona Jauh";
  } else {
    return "Zona Khusus (Hubungi untuk konfirmasi)";
  }
}


/**
 * Centralized bouquet normalization utility
 * Ensures consistent bouquet data transformation across the application
 */

import type { Bouquet } from "../models/domain/bouquet";
import { isNonEmptyString } from "./validation";

/**
 * Normalize raw bouquet data from API to Bouquet type
 * Handles all edge cases and ensures type safety
 */
export function normalizeBouquet(b: unknown): Bouquet | null {
  if (!b || typeof b !== "object") {
    return null;
  }

  const raw = b as Record<string, unknown>;

  // Critical fields - if missing, return null to filter out invalid bouquets
  // Try multiple possible ID field names
  const id = String(
    raw._id ?? 
    raw.id ?? 
    (raw as any).bouquetId ?? 
    ""
  ).trim();
  
  // Try multiple possible name field names
  const name = (
    isNonEmptyString(raw.name) ? raw.name.trim() :
    isNonEmptyString((raw as any).title) ? (raw as any).title.trim() :
    isNonEmptyString((raw as any).bouquetName) ? (raw as any).bouquetName.trim() :
    ""
  );

  // If critical fields are missing, return null (will be filtered out)
  if (!id || !name) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Normalizer] Bouquet missing critical fields:", {
        hasId: !!id,
        hasName: !!name,
        rawKeys: Object.keys(raw),
        sample: JSON.stringify(raw).slice(0, 200),
      });
    }
    return null;
  }

  return {
    _id: id,
    name,
    description: isNonEmptyString(raw.description) ? raw.description : "",
    price: typeof raw.price === "number" && Number.isFinite(raw.price) && raw.price >= 0 ? raw.price : 0,
    type: isNonEmptyString(raw.type) ? raw.type : "",
    size: isNonEmptyString(raw.size) ? raw.size : "",
    image: isNonEmptyString(raw.image) ? raw.image : "",
    status: raw.status === "preorder" ? "preorder" : "ready",
    collectionName: isNonEmptyString(raw.collectionName) ? raw.collectionName : "",
    occasions: Array.isArray(raw.occasions)
      ? raw.occasions.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [],
    flowers: Array.isArray(raw.flowers)
      ? raw.flowers.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [],
    isNewEdition: Boolean(raw.isNewEdition),
    isFeatured: Boolean(raw.isFeatured),
    quantity: typeof raw.quantity === "number" && Number.isFinite(raw.quantity) && raw.quantity >= 0 ? raw.quantity : 0,
    customPenanda: Array.isArray(raw.customPenanda)
      ? raw.customPenanda.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [],
    careInstructions: isNonEmptyString(raw.careInstructions) ? raw.careInstructions : undefined,
    createdAt: isNonEmptyString(raw.createdAt) ? raw.createdAt : undefined,
    updatedAt: isNonEmptyString(raw.updatedAt) ? raw.updatedAt : undefined,
  };
}

/**
 * Normalize array of bouquets
 * Filters out invalid bouquets (those missing critical fields)
 */
export function normalizeBouquets(bouquets: unknown[]): Bouquet[] {
  return bouquets
    .map(normalizeBouquet)
    .filter((b): b is Bouquet => b !== null);
}


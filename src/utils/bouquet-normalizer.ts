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
export function normalizeBouquet(b: unknown): Bouquet {
  if (!b || typeof b !== "object") {
    return getEmptyBouquet();
  }

  const raw = b as Record<string, unknown>;

  return {
    _id: String(raw._id ?? ""),
    name: isNonEmptyString(raw.name) ? raw.name : "",
    description: isNonEmptyString(raw.description) ? raw.description : "",
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : 0,
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
    quantity: typeof raw.quantity === "number" && Number.isFinite(raw.quantity) ? raw.quantity : 0,
    customPenanda: Array.isArray(raw.customPenanda)
      ? raw.customPenanda.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      : [],
    careInstructions: isNonEmptyString(raw.careInstructions) ? raw.careInstructions : undefined,
    createdAt: isNonEmptyString(raw.createdAt) ? raw.createdAt : undefined,
    updatedAt: isNonEmptyString(raw.updatedAt) ? raw.updatedAt : undefined,
  };
}

/**
 * Get empty bouquet object with default values
 */
function getEmptyBouquet(): Bouquet {
  return {
    _id: "",
    name: "",
    description: "",
    price: 0,
    type: "",
    size: "",
    image: "",
    status: "ready",
    collectionName: "",
    occasions: [],
    flowers: [],
    isNewEdition: false,
    isFeatured: false,
    quantity: 0,
    customPenanda: [],
    careInstructions: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  };
}

/**
 * Normalize array of bouquets
 */
export function normalizeBouquets(bouquets: unknown[]): Bouquet[] {
  return bouquets.map(normalizeBouquet);
}


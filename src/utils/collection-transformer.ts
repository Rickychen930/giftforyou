/**
 * Collection Transformer Utility
 * Transforms Collection domain models to component-ready props
 * Follows SOLID, DRY principles
 */

import type { Collection } from "../models/domain/collection";
import type { BouquetCardProps } from "../components/collection-container-component";
import type { Bouquet } from "../models/domain/bouquet";

type RawBouquet = Bouquet & {
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
};

export interface PreparedCollection {
  id: string;
  name: string;
  description: string;
  bouquets: BouquetCardProps[];
}

/**
 * Normalize bouquet data to BouquetCardProps
 * Handles edge cases and type safety
 */
export function normalizeBouquetToCardProps(
  raw: unknown,
  collectionName: string
): BouquetCardProps | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Partial<RawBouquet> & { id?: string };

  const id = data._id ?? data.id;
  const name = data.name;

  if (!id || !name) return null;

  const imageCandidate =
    (typeof data.image === "string" && data.image) ||
    (typeof data.imageUrl === "string" && data.imageUrl) ||
    "";

  const typeCandidate =
    (typeof data.type === "string" && data.type) ||
    (typeof (data as any).category === "string" && (data as any).category) ||
    "";

  const statusCandidate = data.status === "preorder" ? "preorder" : "ready";

  return {
    _id: String(id),
    name: String(name),
    description: data.description ?? "",
    price: typeof data.price === "number" ? data.price : Number(data.price) || 0,
    type: typeCandidate,
    size: data.size ?? "",
    image: imageCandidate,
    status:
      statusCandidate === "ready" && data.inStock === false
        ? "preorder"
        : statusCandidate,
    collectionName: data.collectionName ?? collectionName,
    isNewEdition: typeof data.isNewEdition === "boolean" ? data.isNewEdition : false,
    isFeatured: typeof data.isFeatured === "boolean" ? data.isFeatured : false,
  };
}

/**
 * Transform bouquets array from Collection to BouquetCardProps array
 */
export function transformBouquetsToCardProps(
  collection: Collection
): BouquetCardProps[] {
  const list = collection.bouquets;
  if (!Array.isArray(list) || list.length === 0) return [];

  return list
    .map((item) => normalizeBouquetToCardProps(item, collection.name))
    .filter((b): b is BouquetCardProps => Boolean(b));
}

/**
 * Extract collection ID from various possible formats
 */
export function extractCollectionId(
  collection: unknown
): string {
  const anyC = collection as { _id?: string; id?: string; name?: string };
  return anyC?._id ?? anyC?.id ?? anyC?.name ?? "";
}

/**
 * Extract collection name safely
 */
export function extractCollectionName(collection: unknown): string {
  const anyC = collection as { name?: string };
  return typeof anyC?.name === "string" ? anyC.name.trim() : "";
}

/**
 * Prepare collections for rendering
 * Filters out invalid collections and transforms data
 */
export function prepareCollections(
  collections: Collection[]
): PreparedCollection[] {
  if (!Array.isArray(collections)) return [];

  return collections
    .map((c) => {
      const id = extractCollectionId(c);
      const name = extractCollectionName(c);

      if (!id || !name) return null;

      const bouquets = transformBouquetsToCardProps(c);

      return {
        id,
        name,
        description: c.description ?? "",
        bouquets,
      };
    })
    .filter((c): c is PreparedCollection => {
      return c !== null && Boolean(c.id) && Boolean(c.name) && c.bouquets.length > 0;
    });
}

